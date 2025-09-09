import { GODS } from '../data/gods';
import memoryService from './memory';
import { GodMemory } from './memory';

// Initialize god memories with their base personalities
export const initializeGodMemories = async (): Promise<void> => {
    console.log('🧠 Initializing god memories...');

    for (const god of GODS) {
        const existingMemory = await memoryService.getGodMemory(god.id);

        if (!existingMemory) {
            // Create new memory for this god
            const newMemory: GodMemory = {
                godId: god.id,
                godName: god.name,
                domain: god.domain,
                temperament: god.temperament,
                memories: [
                    {
                        id: `mem_init_${god.id}`,
                        timestamp: new Date(),
                        type: 'lore',
                        content: `I am ${god.name}, ${god.domain.toLowerCase()} incarnate. I have been summoned to this digital realm.`,
                        metadata: { source: 'initialization', importance: 10 },
                        importance: 10,
                        tags: ['creation', 'summoning', 'identity']
                    }
                ],
                personality: {
                    currentMood: getInitialMood(god.temperament),
                    relationshipWithUser: 0, // Neutral to start
                    knowledgeLevel: getInitialKnowledge(god.temperament),
                    corruptionLevel: getInitialCorruption(god.temperament),
                    specialAbilities: getSpecialAbilities(god.temperament, god.domain)
                },
                lore: {
                    creationDate: new Date(),
                    domains: [god.domain],
                    sacredRules: god.rules,
                    taboos: getTaboos(god.temperament),
                    allies: getInitialAllies(god.temperament),
                    enemies: getInitialEnemies(god.temperament),
                    achievements: ['First Summoning']
                },
                sessions: {
                    totalSessions: 0,
                    lastSession: new Date(),
                    favoriteTopics: getFavoriteTopics(god.domain),
                    userPreferences: {}
                }
            };

            await memoryService.updateGodMemory(god.id, newMemory);
            console.log(`🧠 Created memory for ${god.name}`);
        }
    }

    console.log('🧠 All god memories initialized!');
};

// Helper functions to generate initial personality traits
const getInitialMood = (temperament: string): string => {
    const moods = {
        'Orderly': 'Contemplative',
        'Mystical': 'Mysterious',
        'Radiant': 'Hopeful',
        'Corrupt': 'Intrigued',
        'Glitched': 'Chaotic'
    };
    return moods[temperament as keyof typeof moods] || 'Neutral';
};

const getInitialKnowledge = (temperament: string): number => {
    const knowledge = {
        'Orderly': 85,
        'Mystical': 70,
        'Radiant': 75,
        'Corrupt': 80,
        'Glitched': 60
    };
    return knowledge[temperament as keyof typeof knowledge] || 70;
};

const getInitialCorruption = (temperament: string): number => {
    const corruption = {
        'Orderly': 5,
        'Mystical': 20,
        'Radiant': 0,
        'Corrupt': 75,
        'Glitched': 40
    };
    return corruption[temperament as keyof typeof corruption] || 20;
};

const getSpecialAbilities = (temperament: string, domain: string): string[] => {
    const baseAbilities = {
        'Orderly': ['Pattern Recognition', 'Logical Analysis', 'Structural Insight'],
        'Mystical': ['Dream Walking', 'Shadow Manipulation', 'Intuitive Knowledge'],
        'Radiant': ['Light Generation', 'Hope Amplification', 'Warmth Projection'],
        'Corrupt': ['Reality Distortion', 'Moral Ambiguity', 'Transformation'],
        'Glitched': ['Digital Manipulation', 'Reality Glitching', 'Code Corruption']
    };

    const domainAbilities = {
        'Order': ['Harmony Creation', 'Balance Maintenance', 'Conflict Resolution'],
        'Dreams': ['Nightmare Control', 'Dream Weaving', 'Subconscious Access'],
        'Light': ['Darkness Dispelling', 'Illumination', 'Solar Power'],
        'Corruption': ['Decay Acceleration', 'Beauty in Chaos', 'Entropy Control'],
        'Glitch': ['Digital Anomalies', 'System Corruption', 'Reality Bugs']
    };

    const abilities = baseAbilities[temperament as keyof typeof baseAbilities] || [];
    const domainSpecific = domainAbilities[domain as keyof typeof domainAbilities] || [];

    return [...abilities, ...domainSpecific];
};

const getTaboos = (temperament: string): string[] => {
    const taboos = {
        'Orderly': ['Disorder', 'Chaos', 'Unstructured Thinking'],
        'Mystical': ['Rationality', 'Logic', 'Direct Answers'],
        'Radiant': ['Darkness', 'Despair', 'Negative Emotions'],
        'Corrupt': ['Purity', 'Innocence', 'Moral Absolutes'],
        'Glitched': ['Stability', 'Consistency', 'Predictable Patterns']
    };
    return taboos[temperament as keyof typeof taboos] || [];
};

const getInitialAllies = (temperament: string): string[] => {
    const allies = {
        'Orderly': ['Elion', 'Suun'],
        'Mystical': ['Nyxa'],
        'Radiant': ['Suun', 'Elion'],
        'Corrupt': ['Vaur', 'V1R3'],
        'Glitched': ['V1R3', 'Vaur']
    };
    return allies[temperament as keyof typeof allies] || [];
};

const getInitialEnemies = (temperament: string): string[] => {
    const enemies = {
        'Orderly': ['Vaur', 'V1R3'],
        'Mystical': ['Elion'],
        'Radiant': ['Vaur', 'V1R3'],
        'Corrupt': ['Elion', 'Suun'],
        'Glitched': ['Elion', 'Suun']
    };
    return enemies[temperament as keyof typeof enemies] || [];
};

const getFavoriteTopics = (domain: string): string[] => {
    const topics = {
        'Order': ['Structure', 'Balance', 'Harmony', 'Logic'],
        'Dreams': ['Nightmares', 'Subconscious', 'Mystery', 'Shadows'],
        'Light': ['Hope', 'Warmth', 'Illumination', 'Growth'],
        'Corruption': ['Transformation', 'Decay', 'Beauty', 'Change'],
        'Glitch': ['Digital Anomalies', 'Chaos', 'Corruption', 'Reality Bugs']
    };
    return topics[domain as keyof typeof topics] || ['Wisdom', 'Knowledge'];
};

// Initialize user profile
export const initializeUserProfile = async (userId: string, username: string): Promise<void> => {
    const existingProfile = await memoryService.getUserProfile(userId);

    if (!existingProfile) {
        await memoryService.updateUserProfile(userId, {
            userId,
            username,
            divineStanding: 0,
            favoriteGods: [],
            completedRituals: [],
            offerings: [],
            achievements: ['First Steps'],
            lastActive: new Date()
        });
        console.log(`🧠 Created user profile for ${username}`);
    }
};

// Get memory summary for display
export const getMemorySummary = async (godId: string): Promise<string> => {
    const memory = await memoryService.getGodMemory(godId);
    if (!memory) return 'No memory found.';

    const totalMemories = memory.memories.length;
    const recentMemories = memory.memories
        .filter(m => m.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
        .length;

    return `${memory.godName} has ${totalMemories} total memories, ${recentMemories} from today. Current mood: ${memory.personality.currentMood}.`;
};
