import React, { useState, useEffect } from 'react';
import { Brain, Heart, Shield, BookOpen, Clock, Star, Zap, Eye, EyeOff } from 'lucide-react';
import { God } from '../types/gods';
import { GodMemory } from '../services/memory';
import memoryService from '../services/memory';
import { getMemorySummary } from '../services/memoryInit';

interface GodMemoryProps {
    god: God;
    onClose: () => void;
}

const GodMemoryComponent: React.FC<GodMemoryProps> = ({ god, onClose }) => {
    const [memory, setMemory] = useState<GodMemory | null>(null);
    const [summary, setSummary] = useState<string>('');
    const [showSecrets, setShowSecrets] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGodMemory();
    }, [god.id]);

    const loadGodMemory = async () => {
        setLoading(true);
        try {
            const godMemory = await memoryService.getGodMemory(god.id);
            const memorySummary = await getMemorySummary(god.id);

            setMemory(godMemory);
            setSummary(memorySummary);
        } catch (error) {
            console.error('Failed to load god memory:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPersonalityColor = (value: number, type: 'relationship' | 'knowledge' | 'corruption') => {
        if (type === 'relationship') {
            if (value >= 50) return 'text-green-400';
            if (value >= 0) return 'text-yellow-400';
            return 'text-red-400';
        }
        if (type === 'knowledge') {
            if (value >= 80) return 'text-blue-400';
            if (value >= 60) return 'text-cyan-400';
            return 'text-gray-400';
        }
        if (type === 'corruption') {
            if (value >= 70) return 'text-purple-400';
            if (value >= 40) return 'text-orange-400';
            return 'text-green-400';
        }
        return 'text-gray-400';
    };

    const getMoodIcon = (mood: string) => {
        const moodIcons: Record<string, string> = {
            'Contemplative': '🧘',
            'Mysterious': '🌙',
            'Hopeful': '✨',
            'Intrigued': '🕵️',
            'Chaotic': '🌀',
            'Neutral': '😐'
        };
        return moodIcons[mood] || '😐';
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-slate-800 border border-divine-500/30 rounded-lg p-8 text-center">
                    <div className="animate-spin text-4xl mb-4">🧠</div>
                    <p className="text-divine-100">Loading divine memories...</p>
                </div>
            </div>
        );
    }

    if (!memory) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-slate-800 border border-divine-500/30 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-divine-100">Failed to load memories</p>
                    <button onClick={onClose} className="mt-4 divine-button">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-divine-500/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-divine-500/30">
                    <div className="flex items-center space-x-3">
                        <Brain size={24} className="text-divine-400" />
                        <div>
                            <h3 className="text-lg font-bold text-divine-100">{god.name}'s Memory</h3>
                            <p className="text-sm text-divine-300">{summary}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="flex items-center space-x-2 px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-divine-300 transition-colors"
                        >
                            {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />}
                            <span>{showSecrets ? 'Hide Secrets' : 'Show Secrets'}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="text-divine-300 hover:text-divine-100 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {/* Personality Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="divine-card p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <Heart size={18} className="text-red-400" />
                                <h4 className="font-semibold text-divine-100">Relationship</h4>
                            </div>
                            <div className={`text-2xl font-bold ${getPersonalityColor(memory.personality.relationshipWithUser, 'relationship')}`}>
                                {memory.personality.relationshipWithUser > 0 ? '+' : ''}{memory.personality.relationshipWithUser}
                            </div>
                            <div className="text-xs text-divine-300 mt-1">
                                {memory.personality.relationshipWithUser >= 50 ? 'Ally' :
                                    memory.personality.relationshipWithUser >= 0 ? 'Neutral' : 'Enemy'}
                            </div>
                        </div>

                        <div className="divine-card p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <BookOpen size={18} className="text-blue-400" />
                                <h4 className="font-semibold text-divine-100">Knowledge</h4>
                            </div>
                            <div className={`text-2xl font-bold ${getPersonalityColor(memory.personality.knowledgeLevel, 'knowledge')}`}>
                                {memory.personality.knowledgeLevel}
                            </div>
                            <div className="text-xs text-divine-300 mt-1">
                                {memory.personality.knowledgeLevel >= 80 ? 'Wise' :
                                    memory.personality.knowledgeLevel >= 60 ? 'Learned' : 'Student'}
                            </div>
                        </div>

                        <div className="divine-card p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <Shield size={18} className="text-purple-400" />
                                <h4 className="font-semibold text-divine-100">Corruption</h4>
                            </div>
                            <div className={`text-2xl font-bold ${getPersonalityColor(memory.personality.corruptionLevel, 'corruption')}`}>
                                {memory.personality.corruptionLevel}
                            </div>
                            <div className="text-xs text-divine-300 mt-1">
                                {memory.personality.corruptionLevel >= 70 ? 'Corrupted' :
                                    memory.personality.corruptionLevel >= 40 ? 'Tainted' : 'Pure'}
                            </div>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className="divine-card p-4">
                        <h4 className="font-semibold text-divine-100 mb-3 flex items-center space-x-2">
                            <Zap size={18} className="text-yellow-400" />
                            <span>Current Status</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-divine-300 mb-1">Current Mood</div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{getMoodIcon(memory.personality.currentMood)}</span>
                                    <span className="text-divine-100 font-medium">{memory.personality.currentMood}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-divine-300 mb-1">Total Sessions</div>
                                <div className="text-divine-100 font-medium">{memory.sessions.totalSessions}</div>
                            </div>
                        </div>
                    </div>

                    {/* Special Abilities */}
                    <div className="divine-card p-4">
                        <h4 className="font-semibold text-divine-100 mb-3 flex items-center space-x-2">
                            <Star size={18} className="text-yellow-400" />
                            <span>Special Abilities</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {memory.personality.specialAbilities.map((ability, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-divine-600/30 text-divine-200 rounded-full text-sm border border-divine-500/30"
                                >
                                    {ability}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Recent Memories */}
                    <div className="divine-card p-4">
                        <h4 className="font-semibold text-divine-100 mb-3 flex items-center space-x-2">
                            <Clock size={18} className="text-cyan-400" />
                            <span>Recent Memories</span>
                        </h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                            {memory.memories.slice(0, 5).map((mem) => (
                                <div key={mem.id} className="p-3 bg-slate-700/30 rounded border-l-4 border-divine-500/30">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="text-sm text-divine-300 mb-1">
                                                {mem.type} • {mem.timestamp.toLocaleString()}
                                            </div>
                                            <div className="text-divine-100 text-sm">{mem.content}</div>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <span className="text-xs text-divine-400">Importance: {mem.importance}</span>
                                                {mem.tags.map((tag, idx) => (
                                                    <span key={idx} className="text-xs bg-divine-600/20 text-divine-300 px-2 py-1 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secret Information (Conditional) */}
                    {showSecrets && (
                        <div className="corruption-card p-4">
                            <h4 className="font-semibold text-corruption-100 mb-3 flex items-center space-x-2">
                                <Eye size={18} className="text-corruption-400" />
                                <span>Secret Knowledge</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-corruption-300 mb-2">Taboos</div>
                                    <div className="space-y-1">
                                        {memory.lore.taboos.map((taboo, index) => (
                                            <div key={index} className="text-corruption-200 text-sm">• {taboo}</div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-corruption-300 mb-2">Allies & Enemies</div>
                                    <div className="space-y-1">
                                        <div className="text-green-400 text-sm">Allies: {memory.lore.allies.join(', ')}</div>
                                        <div className="text-red-400 text-sm">Enemies: {memory.lore.enemies.join(', ')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GodMemoryComponent;
