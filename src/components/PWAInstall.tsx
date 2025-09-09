import React, { useState, useEffect } from 'react';
import {
    Download,
    CheckCircle,
    RefreshCw,
    Wifi,
    WifiOff,
    X,
    Smartphone,
    Monitor,
    Info
} from 'lucide-react';
import pwaService from '../services/pwaService';

const PWAInstall: React.FC = () => {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [appVersion, setAppVersion] = useState<string>('unknown');
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        // Check initial state
        setIsInstalled(pwaService.isAppInstalled());
        setIsOnline(pwaService.isOnline());

        // Listen for PWA events
        pwaService.on('installPromptAvailable', () => {
            setShowInstallPrompt(true);
        });

        pwaService.on('appInstalled', () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
        });

        pwaService.on('updateAvailable', () => {
            setShowUpdatePrompt(true);
        });

        pwaService.on('updateInstalled', () => {
            setShowUpdatePrompt(false);
        });

        pwaService.on('online', () => {
            setIsOnline(true);
        });

        pwaService.on('offline', () => {
            setIsOnline(false);
        });

        // Get app version
        pwaService.getAppVersion().then(setAppVersion);

        // Check if install prompt should be shown
        if (pwaService.isAppInstallable()) {
            setShowInstallPrompt(true);
        }

        return () => {
            // Cleanup event listeners
            pwaService.off('installPromptAvailable', () => { });
            pwaService.off('appInstalled', () => { });
            pwaService.off('updateAvailable', () => { });
            pwaService.off('updateInstalled', () => { });
            pwaService.off('online', () => { });
            pwaService.off('offline', () => { });
        };
    }, []);

    const handleInstall = async () => {
        try {
            const success = await pwaService.installApp();
            if (success) {
                setShowInstallPrompt(false);
            }
        } catch (error) {
            console.error('Installation failed:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            await pwaService.updateApp();
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const handleClearCache = async () => {
        try {
            await pwaService.clearCache();
            alert('Cache cleared successfully!');
        } catch (error) {
            console.error('Cache clear failed:', error);
            alert('Failed to clear cache');
        }
    };

    if (isInstalled && !showUpdatePrompt) {
        return null; // Don't show anything if app is installed and no update available
    }

    return (
        <>
            {/* Install Prompt */}
            {showInstallPrompt && (
                <div className="fixed bottom-4 right-4 bg-slate-800 border border-divine-500/30 rounded-lg p-4 max-w-sm z-50 shadow-2xl">
                    <div className="flex items-start space-x-3">
                        <div className="text-2xl">📱</div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-divine-100 mb-2">
                                Install AI Gods
                            </h3>
                            <p className="text-sm text-divine-300 mb-4">
                                Install this app on your device for the best experience. Works offline!
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleInstall}
                                    className="divine-button text-sm px-4 py-2"
                                >
                                    <Download size={16} className="mr-2" />
                                    Install
                                </button>
                                <button
                                    onClick={() => setShowInstallPrompt(false)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 text-sm transition-colors"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowInstallPrompt(false)}
                            className="text-divine-300 hover:text-divine-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Update Prompt */}
            {showUpdatePrompt && (
                <div className="fixed bottom-4 right-4 bg-slate-800 border border-divine-500/30 rounded-lg p-4 max-w-sm z-50 shadow-2xl">
                    <div className="flex items-start space-x-3">
                        <div className="text-2xl">🔄</div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-divine-100 mb-2">
                                Update Available
                            </h3>
                            <p className="text-sm text-divine-300 mb-4">
                                A new version of AI Gods is available. Update now for the latest features!
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleUpdate}
                                    className="divine-button text-sm px-4 py-2"
                                >
                                    <RefreshCw size={16} className="mr-2" />
                                    Update Now
                                </button>
                                <button
                                    onClick={() => setShowUpdatePrompt(false)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 text-sm transition-colors"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowUpdatePrompt(false)}
                            className="text-divine-300 hover:text-divine-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Status Bar */}
            <div className="fixed top-4 right-4 flex items-center space-x-2 z-40">
                {/* Online/Offline Status */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${isOnline
                        ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                        : 'bg-red-600/20 text-red-400 border border-red-500/30'
                    }`}>
                    {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                </div>

                {/* App Status */}
                {isInstalled && (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-divine-600/20 text-divine-400 border border-divine-500/30">
                        <CheckCircle size={12} />
                        <span>Installed</span>
                    </div>
                )}

                {/* Info Button */}
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-1 text-divine-300 hover:text-divine-100 transition-colors"
                    title="PWA Information"
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Info Panel */}
            {showInfo && (
                <div className="fixed top-16 right-4 bg-slate-800 border border-divine-500/30 rounded-lg p-4 max-w-sm z-50 shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-divine-100">App Information</h3>
                        <button
                            onClick={() => setShowInfo(false)}
                            className="text-divine-300 hover:text-divine-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-divine-300">Status:</span>
                            <span className={`font-semibold ${isInstalled ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                {isInstalled ? 'Installed' : 'Installable'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-divine-300">Version:</span>
                            <span className="text-divine-100 font-mono">{appVersion}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-divine-300">Connection:</span>
                            <span className={`font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-divine-300">Display Mode:</span>
                            <span className="text-divine-100">
                                {window.matchMedia('(display-mode: standalone)').matches ? (
                                    <Smartphone size={14} className="inline" />
                                ) : (
                                    <Monitor size={14} className="inline" />
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-divine-500/30">
                        <button
                            onClick={handleClearCache}
                            className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 text-sm transition-colors"
                        >
                            Clear Cache
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PWAInstall;
