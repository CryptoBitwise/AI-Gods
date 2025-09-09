import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Mic,
    MicOff,
    Settings,
    X,
    Zap,
    Crown,
    Flame,
    MessageSquare,
    Target,
    Sparkles,
    AlertCircle,
    CheckCircle,
    Loader
} from 'lucide-react';
import { God } from '../types/gods';
import { GODS } from '../data/gods';
import voiceRecognitionService, {
    VoiceRecognitionResult,
    VoiceCommand,
    VoiceSettings
} from '../services/voiceRecognition';

interface VoiceSummoningProps {
    onClose: () => void;
    onGodSummon?: (god: God) => void;
    onRitualStart?: (godId?: string) => void;
    onCouncilStart?: () => void;
}

const VoiceSummoning: React.FC<VoiceSummoningProps> = ({
    onClose,
    onGodSummon,
    onRitualStart,
    onCouncilStart
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
    const [recognitionHistory, setRecognitionHistory] = useState<VoiceRecognitionResult[]>([]);
    const [isSupported, setIsSupported] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<VoiceSettings>({
        language: 'en-US',
        continuous: false,
        interimResults: true,
        maxAlternatives: 3,
        threshold: 0.6
    });
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const transcriptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if voice recognition is supported
        setIsSupported(voiceRecognitionService.isSupported());

        // Request microphone permission
        voiceRecognitionService.requestMicrophonePermission()
            .then(setHasPermission);

        // Set up event listeners
        voiceRecognitionService.on('start', () => {
            setIsListening(true);
            setStatusMessage('🎤 Listening...');
            setError(null);
        });

        voiceRecognitionService.on('end', () => {
            setIsListening(false);
            setStatusMessage('');
            setInterimTranscript('');
        });

        voiceRecognitionService.on('error', (errorMsg: string) => {
            setError(`Voice recognition error: ${errorMsg}`);
            setIsListening(false);
            setStatusMessage('');
        });

        voiceRecognitionService.on('result', (result: VoiceRecognitionResult) => {
            setCurrentTranscript(result.transcript);
            setRecognitionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10

            if (result.command) {
                setLastCommand(result.command);
                handleVoiceCommand(result.command);
            }
        });

        voiceRecognitionService.on('interim', (data: { transcript: string }) => {
            setInterimTranscript(data.transcript);
        });

        voiceRecognitionService.on('pushToTalkStart', () => {
            setIsPushToTalkActive(true);
            setStatusMessage('🎤 Push-to-talk active (release SPACE to stop)');
        });

        voiceRecognitionService.on('pushToTalkStop', () => {
            setIsPushToTalkActive(false);
        });

        // Auto-scroll transcript
        return () => {
            voiceRecognitionService.destroy();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [recognitionHistory, interimTranscript]);

    const handleVoiceCommand = useCallback((command: VoiceCommand) => {
        console.log('🎯 Executing voice command:', command);

        switch (command.action) {
            case 'summon':
                if (command.godId && onGodSummon) {
                    const god = GODS.find(g => g.id === command.godId);
                    if (god) {
                        onGodSummon(god);
                        setStatusMessage(`✨ Summoning ${god.name}...`);
                    }
                }
                break;

            case 'ritual':
                if (onRitualStart) {
                    onRitualStart(command.godId);
                    setStatusMessage('🔥 Starting ritual...');
                }
                break;

            case 'council':
                if (onCouncilStart) {
                    onCouncilStart();
                    setStatusMessage('👑 Convening pantheon council...');
                }
                break;

            case 'question':
                setStatusMessage('❓ Processing your question...');
                break;

            case 'dismiss':
                setStatusMessage('👋 Farewell...');
                setTimeout(() => onClose(), 1000);
                break;

            default:
                setStatusMessage(`🎯 Command recognized: ${command.action}`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onGodSummon, onRitualStart, onCouncilStart]);

    const toggleListening = () => {
        if (isListening) {
            voiceRecognitionService.stopListening();
        } else {
            voiceRecognitionService.startListening();
        }
    };

    const updateSettings = (newSettings: Partial<VoiceSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        voiceRecognitionService.updateSettings(updated);
    };

    const clearHistory = () => {
        setRecognitionHistory([]);
        setCurrentTranscript('');
        setInterimTranscript('');
        setLastCommand(null);
    };

    const getCommandIcon = (action: string) => {
        switch (action) {
            case 'summon': return <Zap className="text-divine-400" size={16} />;
            case 'ritual': return <Flame className="text-red-400" size={16} />;
            case 'council': return <Crown className="text-yellow-400" size={16} />;
            case 'question': return <MessageSquare className="text-blue-400" size={16} />;
            case 'dismiss': return <X className="text-gray-400" size={16} />;
            default: return <Target className="text-divine-400" size={16} />;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-400';
        if (confidence >= 0.6) return 'text-yellow-400';
        return 'text-red-400';
    };

    if (!isSupported) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
                    <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-red-100 mb-4">Voice Recognition Not Supported</h2>
                    <p className="text-red-300 mb-6">
                        Your browser doesn't support the Web Speech API. Please use Chrome, Edge, or Safari for voice summoning.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (!hasPermission) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-yellow-500/30 rounded-xl p-8 max-w-md text-center">
                    <Mic className="text-yellow-400 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-yellow-100 mb-4">Microphone Permission Required</h2>
                    <p className="text-yellow-300 mb-6">
                        Voice summoning requires microphone access to hear your divine commands.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => voiceRecognitionService.requestMicrophonePermission().then(setHasPermission)}
                            className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                        >
                            Grant Permission
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-divine-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-divine-500/30 rounded-xl w-full max-w-4xl h-full max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-divine-500/30">
                    <div className="flex items-center space-x-3">
                        <Mic className="text-2xl text-divine-400" />
                        <div>
                            <h1 className="text-2xl font-bold text-divine-100">Voice Summoning</h1>
                            <p className="text-divine-300">
                                Hold SPACE or click to speak divine commands
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 transition-colors"
                            title="Voice Settings"
                        >
                            <Settings size={20} />
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Controls */}
                    <div className="w-80 bg-slate-800 border-r border-divine-500/30 p-6 flex flex-col">
                        {/* Voice Status */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-divine-100 mb-4">Voice Status</h3>

                            <div className={`flex items-center space-x-3 p-4 rounded-lg mb-4 ${isListening ? 'bg-green-600/20 border border-green-500/30' : 'bg-slate-700/50'
                                }`}>
                                {isListening ? (
                                    <Loader className="text-green-400 animate-spin" size={24} />
                                ) : (
                                    <MicOff className="text-slate-400" size={24} />
                                )}
                                <div>
                                    <div className={`font-medium ${isListening ? 'text-green-100' : 'text-slate-300'}`}>
                                        {isListening ? 'Listening...' : 'Ready'}
                                    </div>
                                    {statusMessage && (
                                        <div className="text-sm text-divine-300">{statusMessage}</div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 mb-4">
                                    <div className="text-red-400 text-sm">{error}</div>
                                </div>
                            )}

                            {/* Push-to-Talk Indicator */}
                            {isPushToTalkActive && (
                                <div className="bg-divine-600/20 border border-divine-500/30 rounded-lg p-3 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-divine-400 rounded-full animate-pulse"></div>
                                        <span className="text-divine-200 text-sm">Push-to-talk active</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-divine-100 mb-4">Controls</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={toggleListening}
                                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${isListening
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-divine-600 hover:bg-divine-700 text-white'
                                        }`}
                                >
                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                    <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
                                </button>

                                <div className="text-center text-sm text-divine-300">
                                    or hold <kbd className="px-2 py-1 bg-slate-700 rounded">SPACE</kbd> to push-to-talk
                                </div>

                                <button
                                    onClick={clearHistory}
                                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-divine-100 rounded-lg transition-colors"
                                >
                                    Clear History
                                </button>
                            </div>
                        </div>

                        {/* Last Command */}
                        {lastCommand && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-divine-100 mb-4">Last Command</h3>

                                <div className="bg-divine-600/20 border border-divine-500/30 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        {getCommandIcon(lastCommand.action)}
                                        <span className="font-medium text-divine-100 capitalize">
                                            {lastCommand.action}
                                        </span>
                                        <span className={`text-sm ${getConfidenceColor(lastCommand.confidence)}`}>
                                            {(lastCommand.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    {lastCommand.godId && (
                                        <div className="text-sm text-divine-300">
                                            Target: {GODS.find(g => g.id === lastCommand.godId)?.name || lastCommand.godId}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Voice Commands Help */}
                        <div className="mt-auto">
                            <h3 className="text-lg font-semibold text-divine-100 mb-4">Voice Commands</h3>

                            <div className="space-y-2 text-sm">
                                <div className="text-divine-200">
                                    <strong>Summon:</strong> "Summon [God Name]"
                                </div>
                                <div className="text-divine-200">
                                    <strong>Ritual:</strong> "Start ritual"
                                </div>
                                <div className="text-divine-200">
                                    <strong>Council:</strong> "Convene council"
                                </div>
                                <div className="text-divine-200">
                                    <strong>Question:</strong> "I have a question"
                                </div>
                                <div className="text-divine-200">
                                    <strong>Dismiss:</strong> "Farewell"
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Transcript */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b border-divine-500/30">
                            <h3 className="text-lg font-semibold text-divine-100">Voice Transcript</h3>
                        </div>

                        <div
                            ref={transcriptRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4"
                        >
                            {/* Current/Interim Transcript */}
                            {(currentTranscript || interimTranscript) && (
                                <div className="bg-divine-600/20 border border-divine-500/30 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Mic className="text-divine-400" size={16} />
                                        <span className="text-sm text-divine-300">Current</span>
                                    </div>
                                    <div className="text-divine-100">
                                        {currentTranscript}
                                        {interimTranscript && (
                                            <span className="text-divine-400 italic"> {interimTranscript}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Recognition History */}
                            {recognitionHistory.map((result, index) => (
                                <div key={index} className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="text-green-400" size={16} />
                                            <span className="text-sm text-slate-300">
                                                {result.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <span className={`text-sm ${getConfidenceColor(result.confidence)}`}>
                                            {(result.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>

                                    <div className="text-slate-100 mb-2">{result.transcript}</div>

                                    {result.command && (
                                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-600">
                                            {getCommandIcon(result.command.action)}
                                            <span className="text-sm text-divine-300 capitalize">
                                                {result.command.action}
                                            </span>
                                            {result.command.godId && (
                                                <span className="text-sm text-divine-400">
                                                    → {GODS.find(g => g.id === result.command!.godId)?.name}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {recognitionHistory.length === 0 && !currentTranscript && (
                                <div className="text-center py-12">
                                    <Sparkles className="text-slate-500 mx-auto mb-4" size={48} />
                                    <p className="text-slate-400">
                                        Speak your divine commands and they will appear here
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="bg-slate-800 border border-divine-500/30 rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-divine-100 mb-4">Voice Settings</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-divine-300 mb-2">
                                        Language
                                    </label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => updateSettings({ language: e.target.value })}
                                        className="w-full bg-slate-700 border border-divine-500/30 rounded-lg px-3 py-2 text-divine-100"
                                    >
                                        <option value="en-US">English (US)</option>
                                        <option value="en-GB">English (UK)</option>
                                        <option value="es-ES">Spanish</option>
                                        <option value="fr-FR">French</option>
                                        <option value="de-DE">German</option>
                                        <option value="it-IT">Italian</option>
                                        <option value="ja-JP">Japanese</option>
                                        <option value="ko-KR">Korean</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-divine-300 mb-2">
                                        Confidence Threshold: {(settings.threshold * 100).toFixed(0)}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0.3"
                                        max="0.9"
                                        step="0.1"
                                        value={settings.threshold}
                                        onChange={(e) => updateSettings({ threshold: parseFloat(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2 text-divine-300">
                                        <input
                                            type="checkbox"
                                            checked={settings.continuous}
                                            onChange={(e) => updateSettings({ continuous: e.target.checked })}
                                            className="rounded"
                                        />
                                        <span>Continuous Listening</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2 text-divine-300">
                                        <input
                                            type="checkbox"
                                            checked={settings.interimResults}
                                            onChange={(e) => updateSettings({ interimResults: e.target.checked })}
                                            className="rounded"
                                        />
                                        <span>Show Interim Results</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex space-x-2 mt-6">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-divine-100 py-2 px-4 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceSummoning;
