export interface MemoryEntry {
    id: string;
    timestamp: Date;
    type: 'conversation' | 'offering' | 'ritual' | 'lore' | 'interaction';
    content: string;
    metadata: Record<string, any>;
    importance: number; // 1-10, how important this memory is
    tags: string[];
}

export interface GodMemory {
    godId: string;
    godName: string;
    domain: string;
    temperament: string;
    memories: MemoryEntry[];
    personality: {
        currentMood: string;
        relationshipWithUser: number; // -100 to 100
        knowledgeLevel: number; // 1-100
        corruptionLevel: number; // 0-100
        specialAbilities: string[];
    };
    lore: {
        creationDate: Date;
        domains: string[];
        sacredRules: string[];
        taboos: string[];
        allies: string[];
        enemies: string[];
        achievements: string[];
    };
    sessions: {
        totalSessions: number;
        lastSession: Date;
        favoriteTopics: string[];
        userPreferences: Record<string, any>;
    };
}

export interface RitualMemory {
    id: string;
    timestamp: Date;
    ritualType: string;
    participants: string[];
    outcome: string;
    effects: string[];
    offerings: string[];
    divineResponse: string;
}

export interface UserProfile {
    userId: string;
    username: string;
    divineStanding: number;
    favoriteGods: string[];
    completedRituals: RitualMemory[];
    offerings: string[];
    achievements: string[];
    lastActive: Date;
}

class MemoryService {
    private db: any; // Will be SQLite database
    private isInitialized = false;

    constructor() {
        this.initializeDatabase();
    }

    private async initializeDatabase() {
        try {
            // For now, we'll use localStorage as a fallback
            // Later we'll integrate with actual SQLite
            this.isInitialized = true;
            console.log('🧠 Memory Service initialized');
        } catch (error) {
            console.error('Failed to initialize memory service:', error);
        }
    }

    // Create or update god memory
    async updateGodMemory(godId: string, memory: Partial<GodMemory>): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const existing = await this.getGodMemory(godId);
            const updated = { ...existing, ...memory };

            // Store in localStorage for now
            localStorage.setItem(`god_memory_${godId}`, JSON.stringify(updated));

            console.log(`🧠 Updated memory for ${godId}`);
        } catch (error) {
            console.error('Failed to update god memory:', error);
        }
    }

    // Get god's memory
    async getGodMemory(godId: string): Promise<GodMemory | null> {
        if (!this.isInitialized) return null;

        try {
            const stored = localStorage.getItem(`god_memory_${godId}`);
            if (stored) {
                const memory = JSON.parse(stored);
                // Convert timestamp strings back to Date objects
                memory.memories = memory.memories.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                return memory;
            }
            return null;
        } catch (error) {
            console.error('Failed to get god memory:', error);
            return null;
        }
    }

    // Add a new memory entry
    async addMemory(godId: string, memory: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const godMemory = await this.getGodMemory(godId);
            if (!godMemory) return;

            const newMemory: MemoryEntry = {
                ...memory,
                id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date()
            };

            godMemory.memories.push(newMemory);

            // Keep only last 100 memories to prevent bloat
            if (godMemory.memories.length > 100) {
                godMemory.memories = godMemory.memories
                    .sort((a, b) => b.importance - a.importance)
                    .slice(0, 100);
            }

            await this.updateGodMemory(godId, godMemory);
            console.log(`🧠 Added memory to ${godId}: ${memory.content.substring(0, 50)}...`);
        } catch (error) {
            console.error('Failed to add memory:', error);
        }
    }

    // Get relevant memories for context
    async getRelevantMemories(godId: string, query: string, limit: number = 5): Promise<MemoryEntry[]> {
        if (!this.isInitialized) return [];

        try {
            const godMemory = await this.getGodMemory(godId);
            if (!godMemory) return [];

            // Simple relevance scoring based on content and tags
            const scored = godMemory.memories.map(memory => {
                let score = memory.importance;

                // Boost score if query matches content or tags
                if (memory.content.toLowerCase().includes(query.toLowerCase())) score += 5;
                if (memory.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) score += 3;

                return { memory, score };
            });

            // Return top memories by score
            return scored
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(item => item.memory);
        } catch (error) {
            console.error('Failed to get relevant memories:', error);
            return [];
        }
    }

    // Update god's personality based on interactions
    async updatePersonality(godId: string, changes: Partial<GodMemory['personality']>): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const godMemory = await this.getGodMemory(godId);
            if (!godMemory) return;

            godMemory.personality = { ...godMemory.personality, ...changes };
            await this.updateGodMemory(godId, godMemory);

            console.log(`🧠 Updated personality for ${godId}`);
        } catch (error) {
            console.error('Failed to update personality:', error);
        }
    }

    // Record a ritual
    async recordRitual(ritual: Omit<RitualMemory, 'id' | 'timestamp'>): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const newRitual: RitualMemory = {
                ...ritual,
                id: `ritual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date()
            };

            // Store ritual in localStorage
            const rituals = JSON.parse(localStorage.getItem('rituals') || '[]');
            rituals.push(newRitual);
            localStorage.setItem('rituals', JSON.stringify(rituals));

            console.log(`🧠 Recorded ritual: ${ritual.ritualType}`);
        } catch (error) {
            console.error('Failed to record ritual:', error);
        }
    }

    // Get user profile
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        if (!this.isInitialized) return null;

        try {
            const stored = localStorage.getItem(`user_profile_${userId}`);
            if (stored) {
                const profile = JSON.parse(stored);
                profile.lastActive = new Date(profile.lastActive);
                return profile;
            }
            return null;
        } catch (error) {
            console.error('Failed to get user profile:', error);
            return null;
        }
    }

    // Update user profile
    async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const existing = await this.getUserProfile(userId);
            const updated = { ...existing, ...updates, lastActive: new Date() };

            localStorage.setItem(`user_profile_${userId}`, JSON.stringify(updated));
            console.log(`🧠 Updated user profile for ${userId}`);
        } catch (error) {
            console.error('Failed to update user profile:', error);
        }
    }

    // Get all gods' memories (for pantheon view)
    async getAllGodMemories(): Promise<GodMemory[]> {
        if (!this.isInitialized) return [];

        try {
            const memories: GodMemory[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('god_memory_')) {
                    const memory = await this.getGodMemory(key.replace('god_memory_', ''));
                    if (memory) memories.push(memory);
                }
            }
            return memories;
        } catch (error) {
            console.error('Failed to get all god memories:', error);
            return [];
        }
    }

    // Clear all data (for testing)
    async clearAllData(): Promise<void> {
        if (!this.isInitialized) return;

        try {
            // Clear all god memories
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key?.startsWith('god_memory_') || key?.startsWith('user_profile_') || key === 'rituals') {
                    localStorage.removeItem(key);
                }
            }
            console.log('🧠 Cleared all memory data');
        } catch (error) {
            console.error('Failed to clear data:', error);
        }
    }
}

// Export singleton instance
export const memoryService = new MemoryService();
export default memoryService;
