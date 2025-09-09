import React, { useState, useEffect } from 'react';
import { Volume2, X } from 'lucide-react';
import ttsService from '../services/tts';
import { GOD_VOICES } from '../services/tts';

interface TTSSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const TTSSettings: React.FC<TTSSettingsProps> = ({ isOpen, onClose }) => {
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            const voices = ttsService.getAvailableVoices();
            setAvailableVoices(voices);
            if (voices.length > 0) {
                setSelectedVoice(voices[0].name);
            }
        }
    }, [isOpen]);

    const testVoice = async () => {
        if (selectedVoice) {
            const voice = availableVoices.find(v => v.name === selectedVoice);
            if (voice) {
                const utterance = new SpeechSynthesisUtterance(
                    "Greetings, mortal. I am the voice of the divine. Hear my wisdom."
                );
                utterance.voice = voice;
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-divine-500/30 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-divine-500/30">
                    <div className="flex items-center space-x-2">
                        <Volume2 size={20} className="text-divine-400" />
                        <h3 className="text-lg font-bold text-divine-100">Voice Settings</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-divine-300 hover:text-divine-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* TTS Support Status */}
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-divine-300 mb-1">TTS Support</div>
                        <div className={`text-lg font-bold ${ttsService.isSupported() ? 'text-green-400' : 'text-red-400'}`}>
                            {ttsService.isSupported() ? 'Available' : 'Not Supported'}
                        </div>

                        {/* Debug Button */}
                        <button
                            onClick={() => ttsService.logAvailableVoices()}
                            className="mt-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white transition-colors"
                        >
                            🔍 Log Available Voices (Console)
                        </button>
                    </div>

                    {/* Available Voices */}
                    {ttsService.isSupported() && (
                        <div>
                            <label className="block text-sm font-medium text-divine-300 mb-2">
                                System Voice
                            </label>
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="w-full bg-slate-700/50 border border-divine-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-divine-400"
                            >
                                {availableVoices.map((voice) => (
                                    <option key={voice.name} value={voice.name}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={testVoice}
                                className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-divine-600 hover:bg-divine-500 rounded-lg transition-colors text-white"
                            >
                                <Volume2 size={16} />
                                <span>Test Voice</span>
                            </button>
                        </div>
                    )}

                    {/* God Voice Examples */}
                    <div>
                        <h4 className="text-sm font-medium text-divine-300 mb-3">God Voice Examples</h4>
                        <div className="space-y-2">
                            {Object.entries(GOD_VOICES).map(([temperament, voice]) => (
                                <div key={temperament} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                                    <div>
                                        <div className="text-sm font-medium text-divine-100">{voice.name}</div>
                                        <div className="text-xs text-divine-300">{voice.description}</div>
                                    </div>
                                    <button
                                        onClick={() => ttsService.speakAsGod(
                                            `I am ${voice.name}, speaking with the voice of ${temperament.toLowerCase()} temperament.`,
                                            temperament
                                        )}
                                        className="px-3 py-1 bg-divine-600/50 hover:bg-divine-500/50 rounded text-xs text-divine-100 transition-colors"
                                    >
                                        Test
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="text-xs text-divine-400 text-center p-3 bg-slate-700/30 rounded">
                        <p>Each god has a unique voice personality based on their temperament.</p>
                        <p className="mt-1">Voice quality depends on your system's available TTS voices.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TTSSettings;
