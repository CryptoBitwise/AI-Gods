interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

interface PWAInstallPrompt {
    event: BeforeInstallPromptEvent;
    showPrompt(): Promise<void>;
}

class PWAService {
    private deferredPrompt: BeforeInstallPromptEvent | null = null;
    private isInstalled = false;
    private onlineStatus = navigator.onLine;
    private updateAvailable = false;
    private swRegistration: ServiceWorkerRegistration | null = null;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        // Check if app is already installed
        this.isInstalled = this.checkIfInstalled();

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e as BeforeInstallPromptEvent;
            this.dispatchEvent('installPromptAvailable');
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.dispatchEvent('appInstalled');
        });

        // Register service worker
        await this.registerServiceWorker();

        // Check for updates
        this.checkForUpdates();
    }

    private checkIfInstalled(): boolean {
        // Check if running in standalone mode (installed PWA)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }

        // Check if running in fullscreen mode
        if (window.matchMedia('(display-mode: fullscreen)').matches) {
            return true;
        }

        // Check if running in minimal-ui mode
        if (window.matchMedia('(display-mode: minimal-ui)').matches) {
            return true;
        }

        return false;
    }

    private async registerServiceWorker(): Promise<void> {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered successfully:', this.swRegistration);

                // Listen for service worker updates
                this.swRegistration.addEventListener('updatefound', () => {
                    const newWorker = this.swRegistration!.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.updateAvailable = true;
                                this.dispatchEvent('updateAvailable');
                            }
                        });
                    }
                });

                // Listen for controller change (new service worker activated)
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    this.updateAvailable = false;
                    this.dispatchEvent('updateInstalled');
                });

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    private handleOnline(): void {
        this.onlineStatus = true;
        this.dispatchEvent('online');

        // Sync any offline data
        this.syncOfflineData();
    }

    private handleOffline(): void {
        this.onlineStatus = false;
        this.dispatchEvent('offline');
    }

    private async syncOfflineData(): Promise<void> {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
                // Request background sync for offline actions
                const registration = await navigator.serviceWorker.ready;
                // Note: Background sync API is not widely supported yet
                // await registration.sync.register('offline-ritual');
                console.log('🔄 Background sync would be registered here when supported');
            } catch (error) {
                console.error('❌ Background sync registration failed:', error);
            }
        }
    }

    private checkForUpdates(): void {
        if (this.swRegistration) {
            this.swRegistration.update();
        }
    }

    // Public methods
    public async installApp(): Promise<boolean> {
        if (!this.deferredPrompt) {
            console.log('❌ No install prompt available');
            return false;
        }

        try {
            // Show the install prompt
            await this.deferredPrompt.prompt();

            // Wait for user choice
            const choiceResult = await this.deferredPrompt.userChoice;

            if (choiceResult.outcome === 'accepted') {
                console.log('✅ App installation accepted');
                this.deferredPrompt = null;
                return true;
            } else {
                console.log('❌ App installation dismissed');
                return false;
            }
        } catch (error) {
            console.error('❌ Install prompt failed:', error);
            return false;
        }
    }

    public async updateApp(): Promise<void> {
        if (this.swRegistration && this.updateAvailable) {
            try {
                // Send message to service worker to skip waiting
                if (this.swRegistration.waiting) {
                    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }

                // Reload the page to activate new service worker
                window.location.reload();
            } catch (error) {
                console.error('❌ App update failed:', error);
            }
        }
    }

    public getInstallPrompt(): PWAInstallPrompt | null {
        if (!this.deferredPrompt) {
            return null;
        }

        return {
            event: this.deferredPrompt,
            showPrompt: async () => {
                await this.installApp();
            }
        };
    }

    public isAppInstallable(): boolean {
        return !this.isInstalled && this.deferredPrompt !== null;
    }

    public isAppInstalled(): boolean {
        return this.isInstalled;
    }

    public isOnline(): boolean {
        return this.onlineStatus;
    }

    public hasUpdate(): boolean {
        return this.updateAvailable;
    }

    public getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
        return this.swRegistration;
    }

    // Offline functionality
    public async cacheData(key: string, data: any): Promise<void> {
        if ('caches' in window) {
            try {
                const cache = await caches.open('ai-gods-data');
                const response = new Response(JSON.stringify(data));
                await cache.put(`/data/${key}`, response);
                console.log('💾 Data cached successfully:', key);
            } catch (error) {
                console.error('❌ Failed to cache data:', error);
            }
        }
    }

    public async getCachedData(key: string): Promise<any | null> {
        if ('caches' in window) {
            try {
                const cache = await caches.open('ai-gods-data');
                const response = await cache.match(`/data/${key}`);
                if (response) {
                    const data = await response.json();
                    console.log('📦 Data retrieved from cache:', key);
                    return data;
                }
            } catch (error) {
                console.error('❌ Failed to retrieve cached data:', error);
            }
        }
        return null;
    }

    // Event dispatching
    private dispatchEvent(eventName: string, data?: any): void {
        const event = new CustomEvent(`pwa:${eventName}`, { detail: data });
        window.dispatchEvent(event);
    }

    // Event listening
    public on(eventName: string, callback: (event: CustomEvent) => void): void {
        window.addEventListener(`pwa:${eventName}`, callback as EventListener);
    }

    public off(eventName: string, callback: (event: CustomEvent) => void): void {
        window.removeEventListener(`pwa:${eventName}`, callback as EventListener);
    }

    // Utility methods
    public async getAppVersion(): Promise<string> {
        if (this.swRegistration && this.swRegistration.active) {
            try {
                const messageChannel = new MessageChannel();
                return new Promise((resolve) => {
                    messageChannel.port1.onmessage = (event) => {
                        resolve(event.data.version);
                    };

                    this.swRegistration!.active!.postMessage(
                        { type: 'GET_VERSION' },
                        [messageChannel.port2]
                    );
                });
            } catch (error) {
                console.error('❌ Failed to get app version:', error);
                return 'unknown';
            }
        }
        return 'unknown';
    }

    public async clearCache(): Promise<void> {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('🗑️ All caches cleared successfully');
            } catch (error) {
                console.error('❌ Failed to clear caches:', error);
            }
        }
    }

    public async unregisterServiceWorker(): Promise<void> {
        if (this.swRegistration) {
            try {
                await this.swRegistration.unregister();
                this.swRegistration = null;
                console.log('✅ Service Worker unregistered successfully');
            } catch (error) {
                console.error('❌ Failed to unregister Service Worker:', error);
            }
        }
    }
}

// Export singleton instance
export const pwaService = new PWAService();
export default pwaService;
