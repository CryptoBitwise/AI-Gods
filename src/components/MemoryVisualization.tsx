import React, { useState, useEffect, useMemo } from 'react';
import {
    Clock,
    Network,
    PieChart,
    BarChart3,
    Calendar,
    Brain,
    Eye,
    Zap,
    Star,
    Heart,
    Shield
} from 'lucide-react';
import { God } from '../types/gods';
import { GodMemory, MemoryEntry } from '../services/memory';
import memoryService from '../services/memory';

interface MemoryVisualizationProps {
    god: God;
    onClose: () => void;
}

type VisualizationMode = 'timeline' | 'clusters' | 'relationships' | 'analytics';

interface MemoryCluster {
    id: string;
    name: string;
    memories: MemoryEntry[];
    color: string;
    size: number;
    tags: string[];
}

const MemoryVisualization: React.FC<MemoryVisualizationProps> = ({ god, onClose }) => {
    const [memory, setMemory] = useState<GodMemory | null>(null);
    const [mode, setMode] = useState<VisualizationMode>('timeline');
    const [loading, setLoading] = useState(true);
    const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);

    useEffect(() => {
        loadGodMemory();
    }, [god.id]);

    const loadGodMemory = async () => {
        setLoading(true);
        try {
            const godMemory = await memoryService.getGodMemory(god.id);
            setMemory(godMemory);
        } catch (error) {
            console.error('Failed to load god memory:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get color for cluster based on tag
    const getClusterColor = (tag: string): string => {
        const colors: Record<string, string> = {
            'conversation': 'bg-blue-500',
            'ritual': 'bg-purple-500',
            'offering': 'bg-green-500',
            'lore': 'bg-yellow-500',
            'interaction': 'bg-red-500',
            'creation': 'bg-cyan-500',
            'summoning': 'bg-pink-500',
            'identity': 'bg-indigo-500'
        };
        return colors[tag] || 'bg-gray-500';
    };

    // Generate memory clusters based on tags and content
    const memoryClusters = useMemo(() => {
        if (!memory) return [];

        const clusters: Record<string, MemoryCluster> = {};

        memory.memories.forEach((mem) => {
            const primaryTag = mem.tags[0] || 'general';

            if (!clusters[primaryTag]) {
                clusters[primaryTag] = {
                    id: primaryTag,
                    name: primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1),
                    memories: [],
                    color: getClusterColor(primaryTag),
                    size: 0,
                    tags: []
                };
            }

            clusters[primaryTag].memories.push(mem);
            clusters[primaryTag].size += mem.importance;
            const uniqueTags = new Set([...clusters[primaryTag].tags, ...mem.tags]);
            clusters[primaryTag].tags = Array.from(uniqueTags);
        });

        return Object.values(clusters).sort((a, b) => b.size - a.size);
    }, [memory]);

    // Timeline visualization
    const renderTimeline = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-divine-100 mb-2">Memory Timeline</h3>
                <p className="text-divine-300">Journey through {god.name}'s divine experiences</p>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-divine-500/30"></div>

                <div className="space-y-6">
                    {memory?.memories.slice().reverse().map((mem, index) => (
                        <div key={mem.id} className="relative flex items-start space-x-6">
                            {/* Timeline dot */}
                            <div className="relative z-10 flex-shrink-0">
                                <div className={`w-4 h-4 rounded-full border-2 border-divine-400 ${getClusterColor(mem.tags[0] || 'general').replace('bg-', 'bg-')}`}></div>
                                {index < memory.memories.length - 1 && (
                                    <div className="absolute top-4 left-1.5 w-0.5 h-6 bg-divine-500/30"></div>
                                )}
                            </div>

                            {/* Memory content */}
                            <div
                                className={`flex-1 p-4 rounded-lg cursor-pointer transition-all hover:scale-105 ${selectedMemory?.id === mem.id
                                    ? 'ring-2 ring-divine-400 bg-divine-600/30'
                                    : 'bg-slate-700/30 hover:bg-slate-600/30'
                                    }`}
                                onClick={() => setSelectedMemory(selectedMemory?.id === mem.id ? null : mem)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getClusterColor(mem.tags[0] || 'general').replace('bg-', 'bg-')} text-white`}>
                                            {mem.type}
                                        </span>
                                        <span className="text-xs text-divine-400">
                                            {mem.timestamp.toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Star size={12} className="text-yellow-400" />
                                        <span className="text-xs text-divine-300">{mem.importance}</span>
                                    </div>
                                </div>

                                <p className="text-divine-100 text-sm mb-2">{mem.content}</p>

                                <div className="flex flex-wrap gap-1">
                                    {mem.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-divine-600/20 text-divine-300 rounded text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Cluster visualization
    const renderClusters = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-divine-100 mb-2">Memory Clusters</h3>
                <p className="text-divine-300">Grouped by themes and importance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {memoryClusters.map((cluster) => (
                    <div
                        key={cluster.id}
                        className="divine-card p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                        onClick={() => setSelectedMemory(cluster.memories[0])}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-full ${cluster.color} flex items-center justify-center`}>
                                <Brain size={24} className="text-white" />
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-divine-100">{cluster.size}</div>
                                <div className="text-xs text-divine-400">Importance</div>
                            </div>
                        </div>

                        <h4 className="text-lg font-semibold text-divine-100 mb-2">{cluster.name}</h4>
                        <p className="text-divine-300 text-sm mb-3">
                            {cluster.memories.length} memories
                        </p>

                        <div className="space-y-2">
                            {cluster.memories.slice(0, 3).map((mem) => (
                                <div key={mem.id} className="text-xs text-divine-200 bg-slate-700/30 p-2 rounded">
                                    {mem.content.substring(0, 60)}...
                                </div>
                            ))}
                            {cluster.memories.length > 3 && (
                                <div className="text-xs text-divine-400 text-center">
                                    +{cluster.memories.length - 3} more
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Relationship visualization
    const renderRelationships = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-divine-100 mb-2">Divine Relationships</h3>
                <p className="text-divine-300">Allies, enemies, and divine connections</p>
            </div>

            {memory && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Allies */}
                    <div className="divine-card p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Heart size={20} className="text-green-400" />
                            <h4 className="text-lg font-semibold text-divine-100">Allies</h4>
                        </div>
                        <div className="space-y-3">
                            {memory.lore.allies.map((ally, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-green-600/20 rounded border border-green-500/30">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">A</span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-green-100">{ally}</div>
                                        <div className="text-xs text-green-300">Divine Ally</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Enemies */}
                    <div className="corruption-card p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Shield size={20} className="text-red-400" />
                            <h4 className="text-lg font-semibold text-corruption-100">Enemies</h4>
                        </div>
                        <div className="space-y-3">
                            {memory.lore.enemies.map((enemy, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-red-600/20 rounded border border-red-500/30">
                                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">E</span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-red-100">{enemy}</div>
                                        <div className="text-xs text-red-300">Divine Enemy</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Relationship with User */}
            {memory && (
                <div className="divine-card p-6">
                    <h4 className="text-lg font-semibold text-divine-100 mb-4 text-center">Relationship with You</h4>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${memory.personality.relationshipWithUser >= 50 ? 'text-green-400' :
                                memory.personality.relationshipWithUser >= 0 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {memory.personality.relationshipWithUser > 0 ? '+' : ''}{memory.personality.relationshipWithUser}
                            </div>
                            <div className="text-sm text-divine-300">
                                {memory.personality.relationshipWithUser >= 50 ? 'Ally' :
                                    memory.personality.relationshipWithUser >= 0 ? 'Neutral' : 'Enemy'}
                            </div>
                        </div>

                        {/* Relationship bar */}
                        <div className="flex-1 max-w-xs">
                            <div className="w-full bg-slate-700 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${memory.personality.relationshipWithUser >= 50 ? 'bg-green-500' :
                                        memory.personality.relationshipWithUser >= 0 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{
                                        width: `${Math.abs(memory.personality.relationshipWithUser)}%`,
                                        marginLeft: memory.personality.relationshipWithUser < 0 ? 'auto' : '0'
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-divine-400 mt-1">
                                <span>-100</span>
                                <span>0</span>
                                <span>+100</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Analytics visualization
    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-divine-100 mb-2">Memory Analytics</h3>
                <p className="text-divine-300">Statistical insights into divine knowledge</p>
            </div>

            {memory && (
                <>
                    {/* Memory Type Distribution */}
                    <div className="divine-card p-6">
                        <h4 className="text-lg font-semibold text-divine-100 mb-4">Memory Types</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Object.entries(
                                memory.memories.reduce((acc, mem) => {
                                    acc[mem.type] = (acc[mem.type] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>)
                            ).map(([type, count]) => (
                                <div key={type} className="text-center p-3 bg-slate-700/30 rounded">
                                    <div className="text-2xl font-bold text-divine-100">{count}</div>
                                    <div className="text-xs text-divine-300 capitalize">{type}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Personality Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div className="divine-card p-6 text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">{memory.personality.knowledgeLevel}</div>
                            <div className="text-sm text-divine-300">Knowledge Level</div>
                            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${memory.personality.knowledgeLevel}%` }}></div>
                            </div>
                        </div>

                        <div className="divine-card p-6 text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">{memory.personality.corruptionLevel}</div>
                            <div className="text-sm text-divine-300">Corruption Level</div>
                            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${memory.personality.corruptionLevel}%` }}></div>
                            </div>
                        </div>

                        <div className="divine-card p-6 text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">{memory.sessions.totalSessions}</div>
                            <div className="text-sm text-divine-300">Total Sessions</div>
                            <div className="text-xs text-divine-400 mt-1">
                                Last: {memory.sessions.lastSession.toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="divine-card p-6">
                        <h4 className="text-lg font-semibold text-divine-100 mb-4">Recent Activity</h4>
                        <div className="space-y-3">
                            {memory.memories
                                .filter(m => m.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
                                .slice(0, 5)
                                .map((mem) => (
                                    <div key={mem.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full ${getClusterColor(mem.tags[0] || 'general').replace('bg-', 'bg-')}`}></div>
                                            <span className="text-divine-100 text-sm">{mem.content.substring(0, 40)}...</span>
                                        </div>
                                        <div className="text-xs text-divine-400">
                                            {mem.timestamp.toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-slate-800 border border-divine-500/30 rounded-lg p-8 text-center">
                    <div className="animate-spin text-4xl mb-4">🎭</div>
                    <p className="text-divine-100">Loading divine visualizations...</p>
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
            <div className="bg-slate-800 border border-divine-500/30 rounded-lg w-[95vw] max-w-7xl h-[95vh] max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-divine-500/30">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">🎭</div>
                        <div>
                            <h3 className="text-lg font-bold text-divine-100">{god.name}'s Memory Visualization</h3>
                            <p className="text-sm text-divine-300">
                                {memory.memories.length} memories • {memoryClusters.length} clusters
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-divine-300 hover:text-divine-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center justify-center space-x-2 p-4 border-b border-divine-500/30">
                    {[
                        { mode: 'timeline' as VisualizationMode, icon: Clock, label: 'Timeline' },
                        { mode: 'clusters' as VisualizationMode, icon: Network, label: 'Clusters' },
                        { mode: 'relationships' as VisualizationMode, icon: Heart, label: 'Relationships' },
                        { mode: 'analytics' as VisualizationMode, icon: BarChart3, label: 'Analytics' }
                    ].map(({ mode: m, icon: Icon, label }) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${mode === m
                                ? 'bg-divine-600 text-white shadow-lg'
                                : 'bg-slate-700/50 text-divine-300 hover:bg-slate-600/50'
                                }`}
                        >
                            <Icon size={16} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {mode === 'timeline' && renderTimeline()}
                    {mode === 'clusters' && renderClusters()}
                    {mode === 'relationships' && renderRelationships()}
                    {mode === 'analytics' && renderAnalytics()}
                </div>

                {/* Selected Memory Detail */}
                {selectedMemory && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <div className="bg-slate-800 border border-divine-500/30 rounded-lg w-[90vw] max-w-4xl h-[80vh] max-h-[80vh] overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-divine-100">Memory Detail</h4>
                                <button
                                    onClick={() => setSelectedMemory(null)}
                                    className="text-divine-300 hover:text-divine-100 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded text-sm font-medium ${getClusterColor(selectedMemory.tags[0] || 'general').replace('bg-', 'bg-')} text-white`}>
                                        {selectedMemory.type}
                                    </span>
                                    <span className="text-sm text-divine-400">
                                        {selectedMemory.timestamp.toLocaleString()}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                        <Star size={14} className="text-yellow-400" />
                                        <span className="text-xs text-divine-300">{selectedMemory.importance}</span>
                                    </div>
                                </div>

                                <p className="text-divine-100">{selectedMemory.content}</p>

                                <div className="flex flex-wrap gap-2">
                                    {selectedMemory.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-divine-600/20 text-divine-300 rounded text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {selectedMemory.metadata && Object.keys(selectedMemory.metadata).length > 0 && (
                                    <div>
                                        <h5 className="text-sm font-semibold text-divine-300 mb-2">Metadata</h5>
                                        <pre className="text-xs text-divine-200 bg-slate-700/30 p-2 rounded overflow-auto">
                                            {JSON.stringify(selectedMemory.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemoryVisualization;
