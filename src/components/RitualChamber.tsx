import React, { useState, useEffect } from 'react';
import {
    Flame,
    Star,
    Clock,
    Zap,
    Shield,
    Heart,
    X,
    Play,
    Pause,
    RotateCcw,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { God } from '../types/gods';
import {
    Ritual,
    RitualOffer,
    ActiveRitual,
    RitualOutcome
} from '../services/ritualService';
import ritualService from '../services/ritualService';

interface RitualChamberProps {
    god: God;
    onClose: () => void;
}

const RitualChamber: React.FC<RitualChamberProps> = ({ god, onClose }) => {
    const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
    const [selectedOfferings, setSelectedOfferings] = useState<RitualOffer[]>([]);
    const [activeRitual, setActiveRitual] = useState<ActiveRitual | null>(null);
    const [ritualOutcome, setRitualOutcome] = useState<RitualOutcome | null>(null);
    const [showOfferings, setShowOfferings] = useState(false);
    const [ritualProgress, setRitualProgress] = useState(0);
    const [isRitualActive, setIsRitualActive] = useState(false);

    const availableRituals = ritualService.getAvailableRituals();
    const availableOfferings = ritualService.getAvailableOfferings();
    const recommendedRituals = ritualService.getRitualRecommendations(god.id);

    useEffect(() => {
        // Check for existing active rituals
        const activeRituals = ritualService.getActiveRituals(god.id);
        if (activeRituals.length > 0) {
            setActiveRitual(activeRituals[0]);
            setIsRitualActive(true);
        }
    }, [god.id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRitualActive && activeRitual) {
            interval = setInterval(() => {
                setRitualProgress(prev => {
                    const newProgress = prev + (100 / (activeRitual.ritual.duration * 60)) * 0.1; // Update every 100ms
                    if (newProgress >= 100) {
                        completeRitual();
                        return 100;
                    }
                    return newProgress;
                });
            }, 100);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRitualActive, activeRitual]);

    const handleRitualSelect = (ritual: Ritual) => {
        setSelectedRitual(ritual);
        setShowOfferings(true);
        setSelectedOfferings([]);
    };

    const handleOfferingSelect = (offering: RitualOffer) => {
        if (selectedOfferings.find(o => o.id === offering.id)) {
            setSelectedOfferings(prev => prev.filter(o => o.id !== offering.id));
        } else {
            setSelectedOfferings(prev => [...prev, offering]);
        }
    };

    const startRitual = async () => {
        if (!selectedRitual || selectedOfferings.length === 0) return;

        try {
            const newActiveRitual = await ritualService.startRitual(
                selectedRitual.id,
                god.id,
                selectedOfferings
            );

            setActiveRitual(newActiveRitual);
            setIsRitualActive(true);
            setRitualProgress(0);
            setShowOfferings(false);
            setSelectedRitual(null);
            setSelectedOfferings([]);
        } catch (error) {
            console.error('Failed to start ritual:', error);
        }
    };

    const completeRitual = async () => {
        if (!activeRitual) return;

        try {
            const outcome = await ritualService.completeRitual(activeRitual.id);
            setRitualOutcome(outcome);
            setIsRitualActive(false);
            setActiveRitual(null);
        } catch (error) {
            console.error('Failed to complete ritual:', error);
        }
    };

    const resetRitual = () => {
        setSelectedRitual(null);
        setSelectedOfferings([]);
        setShowOfferings(false);
        setRitualOutcome(null);
        setRitualProgress(0);
        setIsRitualActive(false);
        setActiveRitual(null);
    };

    const getRarityColor = (rarity: RitualOffer['rarity']) => {
        const colors = {
            'common': 'text-gray-400',
            'uncommon': 'text-green-400',
            'rare': 'text-blue-400',
            'epic': 'text-purple-400',
            'legendary': 'text-yellow-400'
        };
        return colors[rarity];
    };

    const getDifficultyColor = (difficulty: Ritual['difficulty']) => {
        const colors = {
            1: 'text-green-400',
            2: 'text-blue-400',
            3: 'text-yellow-400',
            4: 'text-orange-400',
            5: 'text-red-400'
        };
        return colors[difficulty];
    };

    if (ritualOutcome) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-800 border border-divine-500/30 rounded-lg max-w-2xl w-full p-6">
                    <div className="text-center">
                        <div className="text-6xl mb-4">
                            {ritualOutcome.success ? '✨' : '💥'}
                        </div>
                        <h3 className={`text-2xl font-bold mb-4 ${ritualOutcome.success ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {ritualOutcome.success ? 'Ritual Succeeded!' : 'Ritual Failed!'}
                        </h3>
                        <p className="text-divine-100 mb-6">{ritualOutcome.message}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {ritualOutcome.rewards.length > 0 && (
                                <div className="divine-card p-4">
                                    <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center space-x-2">
                                        <CheckCircle size={20} />
                                        <span>Rewards</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {ritualOutcome.rewards.map((reward, index) => (
                                            <div key={index} className="text-divine-100 text-sm">• {reward}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {ritualOutcome.penalties.length > 0 && (
                                <div className="corruption-card p-4">
                                    <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center space-x-2">
                                        <XCircle size={20} />
                                        <span>Penalties</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {ritualOutcome.penalties.map((penalty, index) => (
                                            <div key={index} className="text-corruption-100 text-sm">• {penalty}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="divine-card p-4 mb-6">
                            <h4 className="text-lg font-semibold text-divine-100 mb-3">Divine Response</h4>
                            <p className="text-divine-200 italic">"{ritualOutcome.godResponse}"</p>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={resetRitual}
                                className="divine-button"
                            >
                                <RotateCcw size={18} />
                                <span>Perform Another Ritual</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeRitual) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-800 border border-divine-500/30 rounded-lg max-w-2xl w-full p-6">
                    <div className="text-center">
                        <div className="text-6xl mb-4">{activeRitual.ritual.icon}</div>
                        <h3 className="text-2xl font-bold text-divine-100 mb-2">
                            {activeRitual.ritual.name}
                        </h3>
                        <p className="text-divine-300 mb-6">{activeRitual.ritual.description}</p>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-divine-300 mb-2">
                                <span>Ritual Progress</span>
                                <span>{Math.round(ritualProgress)}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-divine-400 to-corruption-400 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${ritualProgress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Time Remaining */}
                        <div className="text-divine-200 mb-6">
                            <div className="flex items-center justify-center space-x-2">
                                <Clock size={20} />
                                <span>
                                    {Math.max(0, Math.ceil((activeRitual.ritual.duration * 60 * (100 - ritualProgress) / 100)))} minutes remaining
                                </span>
                            </div>
                        </div>

                        {/* Offerings Used */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-divine-100 mb-3">Offerings Used</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {activeRitual.offerings.map((offering) => (
                                    <div key={offering.id} className="text-center p-3 bg-slate-700/30 rounded">
                                        <div className="text-2xl mb-1">{offering.icon}</div>
                                        <div className="text-sm text-divine-100">{offering.name}</div>
                                        <div className={`text-xs ${getRarityColor(offering.rarity)}`}>
                                            {offering.rarity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-divine-300 text-sm">
                            The ritual is in progress. Please wait for completion...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-divine-500/30 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-divine-500/30">
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl">🔮</div>
                        <div>
                            <h3 className="text-lg font-bold text-divine-100">Ritual Chamber</h3>
                            <p className="text-sm text-divine-300">
                                Perform divine rituals for {god.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-divine-300 hover:text-divine-100 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {!showOfferings ? (
                        /* Ritual Selection */
                        <div>
                            <div className="text-center mb-8">
                                <h4 className="text-xl font-bold text-divine-100 mb-2">Choose Your Ritual</h4>
                                <p className="text-divine-300">
                                    Select a ritual to perform. Each has different requirements, risks, and rewards.
                                </p>
                            </div>

                            {/* Recommended Rituals */}
                            {recommendedRituals.length > 0 && (
                                <div className="mb-8">
                                    <h5 className="text-lg font-semibold text-divine-100 mb-4 flex items-center space-x-2">
                                        <Star size={20} className="text-yellow-400" />
                                        <span>Recommended for {god.name}</span>
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recommendedRituals.map((ritual) => (
                                            <div
                                                key={ritual.id}
                                                className={`${ritual.color} p-6 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg`}
                                                onClick={() => handleRitualSelect(ritual)}
                                            >
                                                <div className="text-4xl mb-3">{ritual.icon}</div>
                                                <h6 className="text-lg font-semibold text-white mb-2">{ritual.name}</h6>
                                                <p className="text-white/80 text-sm mb-4">{ritual.description}</p>

                                                <div className="space-y-2 text-white/90 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span>Difficulty:</span>
                                                        <span className={`font-semibold ${getDifficultyColor(ritual.difficulty)}`}>
                                                            {'⭐'.repeat(ritual.difficulty)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>Duration:</span>
                                                        <span>{ritual.duration} min</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Available Rituals */}
                            <div>
                                <h5 className="text-lg font-semibold text-divine-100 mb-4">All Available Rituals</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availableRituals.map((ritual) => (
                                        <div
                                            key={ritual.id}
                                            className="divine-card p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                                            onClick={() => handleRitualSelect(ritual)}
                                        >
                                            <div className="text-4xl mb-3">{ritual.icon}</div>
                                            <h6 className="text-lg font-semibold text-divine-100 mb-2">{ritual.name}</h6>
                                            <p className="text-divine-300 text-sm mb-4">{ritual.description}</p>

                                            <div className="space-y-2 text-divine-400 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span>Difficulty:</span>
                                                    <span className={`font-semibold ${getDifficultyColor(ritual.difficulty)}`}>
                                                        {'⭐'.repeat(ritual.difficulty)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Duration:</span>
                                                    <span>{ritual.duration} min</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Offering Selection */
                        <div>
                            <div className="text-center mb-8">
                                <h4 className="text-xl font-bold text-divine-100 mb-2">
                                    Select Offerings for {selectedRitual?.name}
                                </h4>
                                <p className="text-divine-300">
                                    Choose offerings to increase your ritual's success chance. Better offerings = higher success rate.
                                </p>
                            </div>

                            {/* Selected Ritual Info */}
                            {selectedRitual && (
                                <div className="divine-card p-6 mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className={`text-4xl ${selectedRitual.color} p-3 rounded-lg`}>
                                            {selectedRitual.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="text-xl font-semibold text-divine-100 mb-2">
                                                {selectedRitual.name}
                                            </h5>
                                            <p className="text-divine-300 mb-3">{selectedRitual.description}</p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-divine-400">Requirements:</span>
                                                    <div className="text-divine-200">
                                                        {selectedRitual.requirements.map((req, idx) => (
                                                            <div key={idx}>• {req}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-divine-400">Risks:</span>
                                                    <div className="text-divine-200">
                                                        {selectedRitual.risks.map((risk, idx) => (
                                                            <div key={idx}>• {risk}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Offerings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {availableOfferings.map((offering) => {
                                    const isSelected = selectedOfferings.find(o => o.id === offering.id);
                                    return (
                                        <div
                                            key={offering.id}
                                            className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${isSelected
                                                    ? 'border-divine-400 bg-divine-600/30'
                                                    : 'border-slate-600 bg-slate-700/30 hover:border-divine-500/50'
                                                }`}
                                            onClick={() => handleOfferingSelect(offering)}
                                        >
                                            <div className="text-3xl mb-2">{offering.icon}</div>
                                            <h6 className="font-semibold text-divine-100 mb-1">{offering.name}</h6>
                                            <p className="text-divine-300 text-sm mb-3">{offering.description}</p>

                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-divine-400">Value:</span>
                                                    <span className="text-divine-200">{offering.value}/100</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-divine-400">Rarity:</span>
                                                    <span className={`font-semibold ${getRarityColor(offering.rarity)}`}>
                                                        {offering.rarity}
                                                    </span>
                                                </div>
                                                <div className="text-divine-400">
                                                    <span>Effects:</span>
                                                    <div className="text-divine-200 mt-1">
                                                        {offering.effects.map((effect, idx) => (
                                                            <div key={idx}>• {effect}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Selected Offerings Summary */}
                            {selectedOfferings.length > 0 && (
                                <div className="divine-card p-6 mb-6">
                                    <h5 className="text-lg font-semibold text-divine-100 mb-4">
                                        Selected Offerings ({selectedOfferings.length})
                                    </h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {selectedOfferings.map((offering) => (
                                            <div key={offering.id} className="text-center p-3 bg-slate-700/30 rounded">
                                                <div className="text-2xl mb-1">{offering.icon}</div>
                                                <div className="text-sm text-divine-100">{offering.name}</div>
                                                <div className={`text-xs ${getRarityColor(offering.rarity)}`}>
                                                    {offering.rarity}
                                                </div>
                                                <div className="text-xs text-divine-300">
                                                    Value: {offering.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        <div className="text-divine-300 mb-4">
                                            Total Value: {selectedOfferings.reduce((sum, o) => sum + o.value, 0)}/100
                                        </div>
                                        <button
                                            onClick={startRitual}
                                            className="divine-button"
                                            disabled={selectedOfferings.length === 0}
                                        >
                                            <Flame size={18} />
                                            <span>Begin Ritual</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Back Button */}
                            <div className="text-center">
                                <button
                                    onClick={() => setShowOfferings(false)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 transition-colors"
                                >
                                    ← Back to Rituals
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RitualChamber;
