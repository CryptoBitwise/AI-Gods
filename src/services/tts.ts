// TTS service for divine voices
import coquiTTS from './coquiTTS';

export interface VoiceSettings {
    pitch: number;
    rate: number;
    volume: number;
    voice?: SpeechSynthesisVoice;
}

export interface GodVoice {
    id: string;
    name: string;
    settings: VoiceSettings;
    description: string;
}

// Define unique voices for each god temperament
export const GOD_VOICES: Record<string, GodVoice> = {
    'Orderly': {
        id: 'orderly',
        name: 'The Architect',
        settings: {
            pitch: 0.8,    // Lower, authoritative
            rate: 0.9,     // Slower, deliberate
            volume: 1.0
        },
        description: 'Structured, measured, and authoritative - like a wise architect'
    },
    'Mystical': {
        id: 'mystical',
        name: 'The Enigma',
        settings: {
            pitch: 1.2,    // Higher, ethereal
            rate: 0.8,     // Slower, mysterious
            volume: 0.9
        },
        description: 'Whispery, ethereal, and mysterious - like shadows speaking'
    },
    'Radiant': {
        id: 'radiant',
        name: 'The Beacon',
        settings: {
            pitch: 1.1,    // Higher, warm
            rate: 1.0,     // Normal, clear
            volume: 1.0
        },
        description: 'Warm, bright, and encouraging - like sunlight given voice'
    },
    'Corrupt': {
        id: 'corrupt',
        name: 'The Harbinger',
        settings: {
            pitch: 0.7,    // Lower, dark
            rate: 1.1,     // Slightly faster, seductive
            volume: 0.8
        },
        description: 'Dark, seductive, and dangerous - like corruption itself'
    },
    'Glitched': {
        id: 'glitched',
        name: 'The Anomaly',
        settings: {
            pitch: 1.3,    // Higher, chaotic
            rate: 1.2,     // Faster, glitchy
            volume: 0.7
        },
        description: 'Chaotic, digital, and glitchy - like corrupted code speaking'
    }
};

class TTSService {
    private synthesis: SpeechSynthesis;
    private voices: SpeechSynthesisVoice[] = [];
    private isInitialized = false;

    constructor() {
        this.synthesis = window.speechSynthesis;
        this.initializeVoices();
    }

    private initializeVoices() {
        // Wait for voices to load
        if (this.synthesis.getVoices().length > 0) {
            this.voices = this.synthesis.getVoices();
            this.isInitialized = true;
            console.log(`🔊 TTS initialized with ${this.voices.length} voices`);
        } else {
            this.synthesis.addEventListener('voiceschanged', () => {
                this.voices = this.synthesis.getVoices();
                this.isInitialized = true;
                console.log(`🔊 TTS voices loaded: ${this.voices.length} voices available`);
            });

            // Fallback: try to initialize after a short delay
            setTimeout(() => {
                if (!this.isInitialized && this.synthesis.getVoices().length > 0) {
                    this.voices = this.synthesis.getVoices();
                    this.isInitialized = true;
                    console.log(`🔊 TTS fallback initialization: ${this.voices.length} voices`);
                }
            }, 1000);
        }
    }

    // Get available voices
    getAvailableVoices(): SpeechSynthesisVoice[] {
        return this.voices;
    }

    // Get available Coqui TTS voices
    getCoquiVoices() {
        if (coquiTTS.isServiceSupported()) {
            return coquiTTS.getVoices();
        }
        return [];
    }

    // Speak text with god's voice
    async speakAsGod(text: string, temperament: string): Promise<void> {
        console.log(`🔊 TTS Request: "${text.substring(0, 50)}..." for ${temperament} temperament`);
        console.log(`🔊 Coqui TTS supported: ${coquiTTS.isServiceSupported()}`);
        console.log(`🔊 Web Speech supported: ${this.isSupported()}`);

        // Try Web Speech API first (more reliable for hackathon)
        if (this.isInitialized && this.isSupported()) {
            try {
                console.log(`🔊 Using Web Speech API for ${temperament} temperament`);
                return await this.speakWithWebSpeech(text, temperament);
            } catch (error) {
                console.error('❌ Web Speech API failed, falling back to Coqui TTS:', error);
            }
        } else {
            console.log(`⚠️ Web Speech API not available, using Coqui TTS`);
        }

        // Fallback to Coqui TTS (now with real speech)
        if (coquiTTS.isServiceSupported()) {
            try {
                console.log(`🎵 Using Coqui TTS for ${temperament} temperament`);
                const voice = coquiTTS.getVoiceByTemperament(temperament);
                console.log(`🎵 Selected voice:`, voice);
                await coquiTTS.speak(text, { voice: voice.id });
                console.log(`✅ Coqui TTS completed successfully`);
                return;
            } catch (error) {
                console.error('❌ Coqui TTS failed:', error);
                throw error;
            }
        } else {
            console.error('❌ No TTS method available');
            throw new Error('No TTS method available');
        }
    }

    // Web Speech API implementation (extracted for clarity)
    private async speakWithWebSpeech(text: string, temperament: string): Promise<void> {
        console.log(`🔊 Web Speech API: Starting speech for ${temperament}...`);
        console.log(`🔊 TTS State: initialized=${this.isInitialized}, voices=${this.voices.length}, supported=${this.isSupported()}`);

        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                console.error('❌ Web Speech API not initialized yet, trying to initialize...');
                // Try to initialize on the fly
                this.voices = this.synthesis.getVoices();
                if (this.voices.length > 0) {
                    this.isInitialized = true;
                    console.log(`🔊 TTS initialized on-the-fly with ${this.voices.length} voices`);
                } else {
                    reject(new Error('TTS not initialized and no voices available'));
                    return;
                }
            }

            // Stop any current speech
            this.synthesis.cancel();

            // Get the god's voice settings
            const godVoice = GOD_VOICES[temperament] || GOD_VOICES['Orderly'];

            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);

            // Apply voice settings
            utterance.pitch = godVoice.settings.pitch;
            utterance.rate = godVoice.settings.rate;
            utterance.volume = godVoice.settings.volume;

            // Try to find a good voice for the temperament
            if (this.voices.length > 0) {
                // For glitched gods, use a more robotic voice if available
                if (temperament === 'Glitched') {
                    const glitchVoice = this.voices.find(v =>
                        v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Alex') || v.name.includes('David')
                    );
                    if (glitchVoice) utterance.voice = glitchVoice;
                }
                // For mystical gods, prefer female voices
                else if (temperament === 'Mystical') {
                    const mysticalVoice = this.voices.find(v =>
                        v.name.includes('female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Zira')
                    );
                    if (mysticalVoice) utterance.voice = mysticalVoice;
                }
                // For corrupt gods, prefer deeper voices
                else if (temperament === 'Corrupt') {
                    const corruptVoice = this.voices.find(v =>
                        v.name.includes('male') || v.name.includes('Daniel') || v.name.includes('James') || v.name.includes('Mark')
                    );
                    if (corruptVoice) utterance.voice = corruptVoice;
                }
                // For orderly gods, use a clear, authoritative voice
                else if (temperament === 'Orderly') {
                    const orderlyVoice = this.voices.find(v =>
                        v.name.includes('Microsoft') || v.name.includes('David') || v.name.includes('Mark')
                    );
                    if (orderlyVoice) utterance.voice = orderlyVoice;
                }
                // For radiant gods, use a warm, friendly voice
                else if (temperament === 'Radiant') {
                    const radiantVoice = this.voices.find(v =>
                        v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Zira')
                    );
                    if (radiantVoice) utterance.voice = radiantVoice;
                }
            }

            // Set up event handlers
            utterance.onend = () => {
                console.log('🔊 Web Speech API: Speech completed');
                resolve();
            };
            utterance.onerror = (error) => {
                console.error('🔊 Web Speech API: Speech error:', error);
                reject(error);
            };

            // Speak!
            console.log('🔊 Web Speech API: Starting speech...');
            this.synthesis.speak(utterance);
        });
    }

    // Stop all speech
    stop(): void {
        // Stop Coqui TTS if it's speaking
        if (coquiTTS.isServiceSupported()) {
            coquiTTS.stop();
        }

        // Stop Web Speech API
        this.synthesis.cancel();
    }

    // Check if TTS is supported
    isSupported(): boolean {
        return 'speechSynthesis' in window || coquiTTS.isServiceSupported();
    }

    // Get TTS service status
    getServiceStatus(): {
        webSpeech: boolean;
        coquiTTS: boolean;
        preferred: string;
        voices: number;
    } {
        return {
            webSpeech: 'speechSynthesis' in window,
            coquiTTS: coquiTTS.isServiceSupported(),
            preferred: 'Web Speech API (Hackathon Priority)',
            voices: this.voices.length
        };
    }

    // Check if currently speaking
    isSpeaking(): boolean {
        return this.synthesis.speaking;
    }

    // Debug: Log all available voices
    logAvailableVoices(): void {
        console.log('🔊 Available TTS Voices:');
        this.voices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.lang}) - ${voice.default ? 'DEFAULT' : ''}`);
        });
        console.log(`Total voices: ${this.voices.length}`);
    }
}

// Export singleton instance
export const ttsService = new TTSService();
export default ttsService;
