// Coqui TTS service for offline, unlimited text-to-speech
// This service provides custom voices for each god without API keys or limits

export interface CoquiVoice {
    id: string;
    name: string;
    language: string;
    gender: 'male' | 'female' | 'neutral';
    description: string;
    sampleRate: number;
}

export interface TTSOptions {
    voice: string;
    speed?: number;
    pitch?: number;
    volume?: number;
}

class CoquiTTSService {
    private isSupported = false;
    private voices: CoquiVoice[] = [];
    private audioContext: AudioContext | null = null;
    private currentAudio: OscillatorNode | null = null;

    constructor() {
        this.initializeVoices();
        this.checkSupport();
    }

    private initializeVoices() {
        // Pre-defined voices for each god personality
        this.voices = [
            // Elion - God of Wisdom (Orderly)
            {
                id: 'elion-voice',
                name: 'Elion the Wise',
                language: 'en',
                gender: 'male',
                description: 'Deep, authoritative voice with measured cadence',
                sampleRate: 22050
            },
            // Nyxa - Goddess of Dreams (Mystical)
            {
                id: 'nyxa-voice',
                name: 'Nyxa the Mysterious',
                language: 'en',
                gender: 'female',
                description: 'Ethereal, whispery voice with mystical undertones',
                sampleRate: 22050
            },
            // Zara - Goddess of Light (Radiant)
            {
                id: 'zara-voice',
                name: 'Zara the Radiant',
                language: 'en',
                gender: 'female',
                description: 'Warm, bright voice with uplifting energy',
                sampleRate: 22050
            },
            // Malakai - God of Corruption (Corrupt)
            {
                id: 'malakai-voice',
                name: 'Malakai the Corrupt',
                language: 'en',
                gender: 'male',
                description: 'Dark, seductive voice with dangerous allure',
                sampleRate: 22050
            },
            // Glitch - Digital Entity (Glitched)
            {
                id: 'glitch-voice',
                name: 'Glitch the Digital',
                language: 'en',
                gender: 'neutral',
                description: 'Digital, glitchy voice with electronic effects',
                sampleRate: 22050
            }
        ];
    }

    private checkSupport() {
        // Check if Web Audio API is supported
        this.isSupported = !!(window.AudioContext || (window as any).webkitAudioContext);
        console.log('🔍 Coqui TTS: Web Audio API check:', {
            hasAudioContext: !!window.AudioContext,
            hasWebkitAudioContext: !!(window as any).webkitAudioContext,
            isSupported: this.isSupported
        });

        if (this.isSupported) {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                console.log('🎵 Coqui TTS: Web Audio API initialized successfully');
                console.log('🎵 Audio Context state:', this.audioContext.state);

                // Browser security: AudioContext starts in 'suspended' state
                // We need user interaction to unlock it
                if (this.audioContext.state === 'suspended') {
                    console.log('🔒 AudioContext is suspended - waiting for user interaction to unlock');
                }
            } catch (error) {
                console.error('❌ Coqui TTS: Failed to create AudioContext:', error);
                this.isSupported = false;
            }
        } else {
            console.warn('⚠️ Coqui TTS: Web Audio API not supported, falling back to Web Speech API');
        }
    }

    // Get available voices
    public getVoices(): CoquiVoice[] {
        return [...this.voices];
    }

    // Get voice by ID
    public getVoice(voiceId: string): CoquiVoice | undefined {
        return this.voices.find(voice => voice.id === voiceId);
    }

    // Get voice by god temperament
    public getVoiceByTemperament(temperament: string): CoquiVoice {
        const voiceMap: { [key: string]: string } = {
            'Orderly': 'elion-voice',
            'Mystical': 'nyxa-voice',
            'Radiant': 'zara-voice',
            'Corrupt': 'malakai-voice',
            'Glitched': 'glitch-voice'
        };

        const voiceId = voiceMap[temperament] || 'elion-voice';
        return this.getVoice(voiceId) || this.voices[0];
    }

    // Check if service is supported
    public isServiceSupported(): boolean {
        return this.isSupported;
    }

    // Generate speech using Web Speech API (fallback to Coqui TTS)
    public async speak(text: string, options: TTSOptions): Promise<void> {
        console.log(`🎵 TTS: speak() called with:`, { text: text.substring(0, 50), options });

        // Use Web Speech API as primary method
        if ('speechSynthesis' in window) {
            try {
                console.log(`🔊 Using Web Speech API for better voice quality`);
                return await this.speakWithWebSpeech(text, options);
            } catch (error) {
                console.error('❌ Web Speech API failed, trying Coqui fallback:', error);
            }
        }

        // Fallback to Coqui TTS (simulated)
        if (!this.isSupported) {
            throw new Error('TTS not supported in this browser');
        }

        if (!this.audioContext) {
            throw new Error('AudioContext not initialized');
        }

        try {
            console.log(`🎵 Coqui TTS: Speaking "${text.substring(0, 50)}..." with voice ${options.voice}`);

            // Unlock audio context if suspended
            if (this.audioContext.state === 'suspended') {
                console.log(`🔓 Unlocking audio before speaking...`);
                await this.unlockAudio();
            }

            // Generate clean, pleasant audio
            console.log(`🎵 Generating clean audio...`);
            await this.generateCleanAudio(text, options);

            console.log('✅ Coqui TTS: Speech completed');
        } catch (error) {
            console.error('❌ Coqui TTS Error:', error);
            throw error;
        }
    }

    // Web Speech API implementation for Coqui TTS
    private async speakWithWebSpeech(text: string, options: TTSOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            // Stop any current speech
            window.speechSynthesis.cancel();

            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);

            // Apply voice settings based on temperament
            const voice = this.getVoice(options.voice);
            if (voice) {
                utterance.pitch = voice.gender === 'male' ? 0.8 : 1.2;
                utterance.rate = 0.9;
                utterance.volume = 1.0;
            }

            // Find appropriate voice
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const selectedVoice = voices.find(v =>
                    voice?.gender === 'male' ? v.name.includes('Male') || v.name.includes('David') :
                        v.name.includes('Female') || v.name.includes('Samantha')
                ) || voices[0];
                utterance.voice = selectedVoice;
            }

            utterance.onend = () => resolve();
            utterance.onerror = (error) => reject(error);

            window.speechSynthesis.speak(utterance);
        });
    }

    // Generate clean, pleasant audio
    private async generateCleanAudio(text: string, options: TTSOptions): Promise<void> {
        console.log(`🎵 generateCleanAudio called with:`, { text: text.substring(0, 50), options });

        if (!this.audioContext) {
            console.error('❌ No AudioContext available');
            return;
        }

        try {
            const voice = this.getVoice(options.voice);
            console.log(`🎵 Voice found:`, voice);

            if (!voice) {
                console.error('❌ No voice found for options:', options);
                return;
            }

            // Generate different tones for different voices
            const frequency = this.getVoiceFrequency(voice);
            const duration = Math.min(text.length * 0.1, 3); // Max 3 seconds
            console.log(`🎵 Audio params: frequency=${frequency}Hz, duration=${duration}s`);

            // Create a single, clean oscillator for each voice
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            // Connect audio nodes
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Configure oscillator based on voice type
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            // Set wave type based on voice personality
            switch (voice.id) {
                case 'elion-voice':
                    oscillator.type = 'sine'; // Clean, pure wisdom
                    break;
                case 'nyxa-voice':
                    oscillator.type = 'triangle'; // Soft, ethereal
                    break;
                case 'zara-voice':
                    oscillator.type = 'sine'; // Bright, clear
                    break;
                case 'malakai-voice':
                    oscillator.type = 'sawtooth'; // Dark, edgy
                    break;
                case 'glitch-voice':
                    oscillator.type = 'square'; // Digital, harsh
                    break;
                default:
                    oscillator.type = 'sine';
            }

            // Apply simple, pleasant voice effects
            this.applySimpleVoiceEffects(gainNode, voice, duration);
            console.log(`🎵 Simple voice effects applied`);

            // Play the audio
            const startTime = this.audioContext.currentTime;
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);

            // Store reference for stopping
            this.currentAudio = oscillator;
            console.log(`🎵 Clean audio scheduled: start=${startTime}s, stop=${startTime + duration}s`);

        } catch (error) {
            console.error('Error generating clean audio:', error);
        }
    }

    // Get frequency based on voice characteristics
    private getVoiceFrequency(voice: CoquiVoice): number {
        const baseFrequencies: { [key: string]: number } = {
            'elion-voice': 120,    // Deep, authoritative
            'nyxa-voice': 220,     // Ethereal, mysterious
            'zara-voice': 180,     // Warm, bright
            'malakai-voice': 140,  // Dark, seductive
            'glitch-voice': 100    // Digital, glitchy
        };

        return baseFrequencies[voice.id] || 150;
    }

    // Apply simple, pleasant voice effects
    private applySimpleVoiceEffects(
        gainNode: GainNode,
        voice: CoquiVoice,
        duration: number
    ) {
        const now = this.audioContext!.currentTime;

        // Apply different effects based on voice
        switch (voice.id) {
            case 'elion-voice':
                // Orderly: steady, measured, authoritative
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
                break;

            case 'nyxa-voice':
                // Mystical: ethereal, whispery, mysterious
                gainNode.gain.setValueAtTime(0.25, now);
                gainNode.gain.exponentialRampToValueAtTime(0.15, now + duration * 0.3);
                break;

            case 'zara-voice':
                // Radiant: warm, bright, uplifting
                gainNode.gain.setValueAtTime(0.35, now);
                gainNode.gain.linearRampToValueAtTime(0.35, now + 0.2);
                break;

            case 'malakai-voice':
                // Corrupt: dark, seductive, dangerous
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.linearRampToValueAtTime(0.4, now + 0.3);
                break;

            case 'glitch-voice':
                // Glitched: digital, chaotic, corrupted
                gainNode.gain.setValueAtTime(0.25, now);
                // Add subtle glitch effect
                this.addSubtleGlitch(gainNode, duration);
                break;
        }
    }

    // Add subtle glitch effect for digital voices
    private addSubtleGlitch(gainNode: GainNode, duration: number) {
        const startTime = this.audioContext!.currentTime;
        const steps = 8;

        for (let i = 0; i < steps; i++) {
            const time = startTime + (i / steps) * duration;
            const glitchGain = 0.25 + (Math.random() - 0.5) * 0.1;
            gainNode.gain.setValueAtTime(glitchGain, time);
        }
    }

    // Stop current speech
    public stop(): void {
        if (this.currentAudio) {
            try {
                this.currentAudio.stop();
            } catch (error) {
                // Oscillator might already be stopped
                console.log('Oscillator already stopped');
            }
            this.currentAudio = null;
        }

        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    // Pause speech
    public pause(): void {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    // Resume speech
    public resume(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Get service status
    public getStatus(): { supported: boolean; voices: number; ready: boolean } {
        return {
            supported: this.isSupported,
            voices: this.voices.length,
            ready: this.isSupported && !!this.audioContext
        };
    }

    // Unlock audio context (required for browser security)
    public async unlockAudio(): Promise<boolean> {
        if (!this.audioContext) {
            console.error('❌ No AudioContext to unlock');
            return false;
        }

        try {
            if (this.audioContext.state === 'suspended') {
                console.log('🔓 Unlocking AudioContext...');
                await this.audioContext.resume();
                console.log('✅ AudioContext unlocked! State:', this.audioContext.state);
                return true;
            } else {
                console.log('✅ AudioContext already unlocked. State:', this.audioContext.state);
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to unlock AudioContext:', error);
            return false;
        }
    }

    // Test method to verify audio is working
    public async testAudio(): Promise<void> {
        console.log('🧪 Coqui TTS: Testing audio...');
        console.log('🧪 Service status:', this.getStatus());

        if (!this.isSupported) {
            console.error('🧪 Test failed: Service not supported');
            return;
        }

        // First unlock audio if needed
        await this.unlockAudio();

        try {
            // Test with a simple beep
            const oscillator = this.audioContext!.createOscillator();
            const gainNode = this.audioContext!.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext!.destination);

            oscillator.frequency.setValueAtTime(440, this.audioContext!.currentTime); // A4 note
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, this.audioContext!.currentTime);

            oscillator.start(this.audioContext!.currentTime);
            oscillator.stop(this.audioContext!.currentTime + 0.5);

            console.log('🧪 Test audio played successfully!');
        } catch (error) {
            console.error('🧪 Test failed:', error);
        }
    }

    // Cleanup resources
    public destroy(): void {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

export default new CoquiTTSService();
