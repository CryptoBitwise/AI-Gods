// Type definitions for Speech Recognition API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface VoiceCommand {
    id: string;
    trigger: string[];
    godId?: string;
    action: 'summon' | 'ritual' | 'offering' | 'question' | 'dismiss' | 'council';
    parameters?: Record<string, any>;
    confidence: number;
}

interface VoiceRecognitionResult {
    transcript: string;
    confidence: number;
    command?: VoiceCommand;
    timestamp: Date;
}

interface VoiceSettings {
    language: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    threshold: number; // Confidence threshold
}

class VoiceRecognitionService {
    private recognition: any | null = null;
    private isListening = false;
    private isPushToTalkActive = false;
    private settings: VoiceSettings;
    private callbacks: Map<string, Function> = new Map();
    private keyDownListener: ((e: KeyboardEvent) => void) | null = null;
    private keyUpListener: ((e: KeyboardEvent) => void) | null = null;
    private pushToTalkKey = ' '; // Spacebar

    // Predefined voice commands for gods and rituals
    private commands: VoiceCommand[] = [
        // God summoning commands
        {
            id: 'summon-aethon',
            trigger: ['summon aethon', 'call aethon', 'invoke aethon', 'aethon appear'],
            godId: 'aethon',
            action: 'summon',
            confidence: 0.7
        },
        {
            id: 'summon-nyxara',
            trigger: ['summon nyxara', 'call nyxara', 'invoke nyxara', 'nyxara appear'],
            godId: 'nyxara',
            action: 'summon',
            confidence: 0.7
        },
        {
            id: 'summon-zephyros',
            trigger: ['summon zephyros', 'call zephyros', 'invoke zephyros', 'zephyros appear'],
            godId: 'zephyros',
            action: 'summon',
            confidence: 0.7
        },
        {
            id: 'summon-korvain',
            trigger: ['summon korvain', 'call korvain', 'invoke korvain', 'korvain appear'],
            godId: 'korvain',
            action: 'summon',
            confidence: 0.7
        },
        {
            id: 'summon-xerion',
            trigger: ['summon xerion', 'call xerion', 'invoke xerion', 'xerion appear'],
            godId: 'xerion',
            action: 'summon',
            confidence: 0.7
        },

        // Ritual commands
        {
            id: 'start-ritual',
            trigger: ['start ritual', 'begin ritual', 'perform ritual', 'initiate ceremony'],
            action: 'ritual',
            confidence: 0.8
        },
        {
            id: 'make-offering',
            trigger: ['make offering', 'present offering', 'give offering', 'offer tribute'],
            action: 'offering',
            confidence: 0.8
        },

        // Council commands
        {
            id: 'convene-council',
            trigger: ['convene council', 'start council', 'begin council', 'gather pantheon'],
            action: 'council',
            confidence: 0.8
        },

        // Question commands
        {
            id: 'ask-question',
            trigger: ['i have a question', 'answer me', 'tell me', 'explain'],
            action: 'question',
            confidence: 0.6
        },

        // Dismissal commands
        {
            id: 'dismiss-god',
            trigger: ['dismiss', 'go away', 'leave me', 'farewell', 'until next time'],
            action: 'dismiss',
            confidence: 0.7
        }
    ];

    constructor() {
        this.settings = {
            language: 'en-US',
            continuous: false,
            interimResults: true,
            maxAlternatives: 3,
            threshold: 0.6
        };

        this.initializeRecognition();
        this.setupPushToTalk();
    }

    private initializeRecognition(): void {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('❌ Speech recognition not supported in this browser');
            return;
        }

        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        if (!this.recognition) return;

        this.recognition.continuous = this.settings.continuous;
        this.recognition.interimResults = this.settings.interimResults;
        this.recognition.lang = this.settings.language;
        this.recognition.maxAlternatives = this.settings.maxAlternatives;

        this.recognition.onstart = () => {
            console.log('🎤 Voice recognition started');
            this.isListening = true;
            this.emit('start');
        };

        this.recognition.onend = () => {
            console.log('🎤 Voice recognition ended');
            this.isListening = false;
            this.emit('end');
        };

        this.recognition.onerror = (event) => {
            console.error('❌ Voice recognition error:', event.error);
            this.emit('error', event.error);
        };

        this.recognition.onresult = (event) => {
            this.handleRecognitionResult(event);
        };
    }

    private setupPushToTalk(): void {
        this.keyDownListener = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !this.isPushToTalkActive && !this.isInputFocused()) {
                e.preventDefault();
                this.startPushToTalk();
            }
        };

        this.keyUpListener = (e: KeyboardEvent) => {
            if (e.code === 'Space' && this.isPushToTalkActive) {
                e.preventDefault();
                this.stopPushToTalk();
            }
        };

        document.addEventListener('keydown', this.keyDownListener);
        document.addEventListener('keyup', this.keyUpListener);
    }

    private isInputFocused(): boolean {
        const activeElement = document.activeElement;
        return activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement ||
            activeElement?.getAttribute('contenteditable') === 'true';
    }

    private handleRecognitionResult(event: any): void {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence;

            if (result.isFinal) {
                finalTranscript += transcript;

                // Process the final result
                const recognitionResult: VoiceRecognitionResult = {
                    transcript: finalTranscript.trim(),
                    confidence,
                    timestamp: new Date()
                };

                // Try to match voice commands
                const command = this.parseCommand(recognitionResult.transcript);
                if (command) {
                    recognitionResult.command = command;
                }

                console.log('🎤 Voice recognized:', recognitionResult);
                this.emit('result', recognitionResult);
            } else {
                interimTranscript += transcript;
                this.emit('interim', { transcript: interimTranscript, confidence });
            }
        }
    }

    private parseCommand(transcript: string): VoiceCommand | null {
        const lowerTranscript = transcript.toLowerCase().trim();

        // Find the best matching command
        let bestMatch: VoiceCommand | null = null;
        let bestScore = 0;

        for (const command of this.commands) {
            for (const trigger of command.trigger) {
                const score = this.calculateSimilarity(lowerTranscript, trigger);
                if (score > bestScore && score >= command.confidence) {
                    bestMatch = { ...command };
                    bestScore = score;
                }
            }
        }

        if (bestMatch) {
            bestMatch.confidence = bestScore;
            console.log(`🎯 Command matched: ${bestMatch.id} (${bestScore.toFixed(2)})`);
        }

        return bestMatch;
    }

    private calculateSimilarity(text1: string, text2: string): number {
        // Simple word-based similarity calculation
        const words1 = text1.split(' ');
        const words2 = text2.split(' ');

        // Check for exact match first
        if (text1 === text2) return 1.0;

        // Check if all words of trigger are in transcript
        const matchingWords = words2.filter(word =>
            words1.some(w => w.includes(word) || word.includes(w))
        );

        const similarity = matchingWords.length / words2.length;

        // Bonus for word order
        if (text1.includes(text2) || text2.includes(text1)) {
            return Math.min(similarity + 0.2, 1.0);
        }

        return similarity;
    }

    // Public methods
    public isSupported(): boolean {
        return this.recognition !== null;
    }

    public startListening(): void {
        if (!this.recognition || this.isListening) return;

        try {
            this.recognition.start();
            console.log('🎤 Starting voice recognition...');
        } catch (error) {
            console.error('❌ Failed to start voice recognition:', error);
        }
    }

    public stopListening(): void {
        if (!this.recognition || !this.isListening) return;

        try {
            this.recognition.stop();
            console.log('🎤 Stopping voice recognition...');
        } catch (error) {
            console.error('❌ Failed to stop voice recognition:', error);
        }
    }

    public startPushToTalk(): void {
        if (this.isPushToTalkActive) return;

        this.isPushToTalkActive = true;
        console.log('🎤 Push-to-talk activated');
        this.emit('pushToTalkStart');
        this.startListening();
    }

    public stopPushToTalk(): void {
        if (!this.isPushToTalkActive) return;

        this.isPushToTalkActive = false;
        console.log('🎤 Push-to-talk deactivated');
        this.emit('pushToTalkStop');
        this.stopListening();
    }

    public updateSettings(newSettings: Partial<VoiceSettings>): void {
        this.settings = { ...this.settings, ...newSettings };

        if (this.recognition) {
            this.recognition.lang = this.settings.language;
            this.recognition.continuous = this.settings.continuous;
            this.recognition.interimResults = this.settings.interimResults;
            this.recognition.maxAlternatives = this.settings.maxAlternatives;
        }
    }

    public getSettings(): VoiceSettings {
        return { ...this.settings };
    }

    public addCommand(command: VoiceCommand): void {
        this.commands.push(command);
        console.log(`🎯 Added voice command: ${command.id}`);
    }

    public removeCommand(commandId: string): void {
        this.commands = this.commands.filter(cmd => cmd.id !== commandId);
        console.log(`🗑️ Removed voice command: ${commandId}`);
    }

    public getCommands(): VoiceCommand[] {
        return [...this.commands];
    }

    public setPushToTalkKey(key: string): void {
        this.pushToTalkKey = key;
        console.log(`🎤 Push-to-talk key set to: ${key}`);
    }

    // Event system
    public on(event: string, callback: Function): void {
        this.callbacks.set(event, callback);
    }

    public off(event: string): void {
        this.callbacks.delete(event);
    }

    private emit(event: string, data?: any): void {
        const callback = this.callbacks.get(event);
        if (callback) {
            callback(data);
        }

        // Also dispatch window event for global listening
        window.dispatchEvent(new CustomEvent(`voice:${event}`, { detail: data }));
    }

    // Cleanup
    public destroy(): void {
        if (this.recognition) {
            this.recognition.abort();
        }

        if (this.keyDownListener && this.keyUpListener) {
            document.removeEventListener('keydown', this.keyDownListener);
            document.removeEventListener('keyup', this.keyUpListener);
        }

        this.callbacks.clear();
        console.log('🎤 Voice recognition service destroyed');
    }

    // Utility methods
    public async requestMicrophonePermission(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('✅ Microphone permission granted');
            return true;
        } catch (error) {
            console.error('❌ Microphone permission denied:', error);
            return false;
        }
    }

    public testVoiceRecognition(): void {
        if (!this.isSupported()) {
            console.error('❌ Voice recognition not supported');
            return;
        }

        console.log('🧪 Testing voice recognition...');
        this.on('result', (result: VoiceRecognitionResult) => {
            console.log('🧪 Test result:', result);
            this.off('result');
        });

        this.startListening();

        setTimeout(() => {
            this.stopListening();
        }, 5000);
    }
}

// Export singleton instance
export const voiceRecognitionService = new VoiceRecognitionService();
export default voiceRecognitionService;
export type { VoiceCommand, VoiceRecognitionResult, VoiceSettings };
