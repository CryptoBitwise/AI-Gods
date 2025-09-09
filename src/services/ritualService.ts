// import { God } from '../types/gods';
import memoryService from './memory';
// import { RitualMemory } from './memory';

export interface Ritual {
    id: string;
    type: 'offering' | 'summoning' | 'divine-quest' | 'purification' | 'corruption' | 'glitch';
    name: string;
    description: string;
    requirements: string[];
    duration: number; // in minutes
    difficulty: 1 | 2 | 3 | 4 | 5;
    rewards: string[];
    risks: string[];
    godAffinity: string[]; // which gods prefer this ritual
    icon: string;
    color: string;
}

export interface RitualOffer {
    id: string;
    type: 'material' | 'spiritual' | 'digital' | 'sacred' | 'corrupt';
    name: string;
    description: string;
    value: number; // 1-100, how valuable this offering is
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    effects: string[];
    icon: string;
}

export interface RitualOutcome {
    success: boolean;
    message: string;
    effects: string[];
    rewards: string[];
    penalties: string[];
    godResponse: string;
    relationshipChange: number;
    memoryContent: string;
    importance: number;
}

export interface ActiveRitual {
    id: string;
    ritual: Ritual;
    godId: string;
    startTime: Date;
    endTime: Date;
    offerings: RitualOffer[];
    status: 'preparing' | 'active' | 'completed' | 'failed';
    progress: number; // 0-100
    participants: string[];
}

class RitualService {
    private rituals: Ritual[] = [];
    private offerings: RitualOffer[] = [];
    private activeRituals: Map<string, ActiveRitual> = new Map();

    constructor() {
        this.initializeRituals();
        this.initializeOfferings();
    }

    private initializeRituals() {
        this.rituals = [
            {
                id: 'divine-offering',
                type: 'offering',
                name: 'Divine Offering',
                description: 'Present sacred gifts to gain divine favor and wisdom',
                requirements: ['Sacred space', 'Pure intentions', 'Valuable offering'],
                duration: 15,
                difficulty: 2,
                rewards: ['Divine favor', 'Wisdom insights', 'Relationship boost'],
                risks: ['Minor divine displeasure', 'Wasted offerings'],
                godAffinity: ['Elion', 'Suun', 'Nyxa'],
                icon: '🎁',
                color: 'bg-yellow-500'
            },
            {
                id: 'god-summoning',
                type: 'summoning',
                name: 'God Summoning',
                description: 'Call forth a deity for direct communion and guidance',
                requirements: ['Ritual circle', 'True name', 'Sacred incantations'],
                duration: 30,
                difficulty: 4,
                rewards: ['Direct divine contact', 'Powerful insights', 'Major favor'],
                risks: ['Divine wrath', 'Reality distortion', 'Mental strain'],
                godAffinity: ['all'],
                icon: '🌟',
                color: 'bg-blue-500'
            },
            {
                id: 'divine-quest',
                type: 'divine-quest',
                name: 'Divine Quest',
                description: 'Accept a sacred mission from the gods themselves',
                requirements: ['Pure heart', 'Courage', 'Divine calling'],
                duration: 60,
                difficulty: 5,
                rewards: ['Divine power', 'Sacred knowledge', 'Immortality chance'],
                risks: ['Death', 'Madness', 'Eternal damnation'],
                godAffinity: ['Elion', 'Suun'],
                icon: '⚔️',
                color: 'bg-purple-500'
            },
            {
                id: 'purification-rite',
                type: 'purification',
                name: 'Purification Rite',
                description: 'Cleanse your soul and gain divine protection',
                requirements: ['Pure water', 'Sacred herbs', 'Meditation'],
                duration: 20,
                difficulty: 1,
                rewards: ['Soul cleansing', 'Divine protection', 'Inner peace'],
                risks: ['Temporary weakness', 'Vulnerability'],
                godAffinity: ['Elion', 'Suun'],
                icon: '💧',
                color: 'bg-cyan-500'
            },
            {
                id: 'corruption-embrace',
                type: 'corruption',
                name: 'Corruption Embrace',
                description: 'Embrace the dark side for forbidden power',
                requirements: ['Dark heart', 'Corrupt offerings', 'Sacrifice'],
                duration: 45,
                difficulty: 4,
                rewards: ['Dark power', 'Forbidden knowledge', 'Reality control'],
                risks: ['Soul corruption', 'Eternal darkness', 'Divine punishment'],
                godAffinity: ['Vaur', 'V1R3'],
                icon: '🖤',
                color: 'bg-red-500'
            },
            {
                id: 'glitch-ritual',
                type: 'glitch',
                name: 'Glitch Ritual',
                description: 'Exploit reality bugs for chaotic power',
                requirements: ['Digital artifacts', 'Chaos mindset', 'Error tolerance'],
                duration: 25,
                difficulty: 3,
                rewards: ['Reality manipulation', 'Digital powers', 'Chaos control'],
                risks: ['Reality corruption', 'Digital infection', 'System crash'],
                godAffinity: ['V1R3'],
                icon: '🌀',
                color: 'bg-green-500'
            }
        ];
    }

    private initializeOfferings() {
        this.offerings = [
            // Material Offerings
            {
                id: 'golden-apple',
                type: 'material',
                name: 'Golden Apple',
                description: 'A fruit of pure gold, symbolizing knowledge and immortality',
                value: 85,
                rarity: 'legendary',
                effects: ['Knowledge boost', 'Immortality chance', 'Divine favor'],
                icon: '🍎'
            },
            {
                id: 'sacred-crystal',
                type: 'material',
                name: 'Sacred Crystal',
                description: 'A crystal that resonates with divine energy',
                value: 70,
                rarity: 'epic',
                effects: ['Energy amplification', 'Divine connection', 'Protection'],
                icon: '💎'
            },
            {
                id: 'ancient-scroll',
                type: 'material',
                name: 'Ancient Scroll',
                description: 'Forgotten knowledge written in divine script',
                value: 60,
                rarity: 'rare',
                effects: ['Wisdom gain', 'Historical insight', 'Divine language'],
                icon: '📜'
            },
            // Spiritual Offerings
            {
                id: 'pure-prayer',
                type: 'spiritual',
                name: 'Pure Prayer',
                description: 'A prayer spoken from the depths of your soul',
                value: 50,
                rarity: 'uncommon',
                effects: ['Soul cleansing', 'Divine connection', 'Inner peace'],
                icon: '🙏'
            },
            {
                id: 'meditation-essence',
                type: 'spiritual',
                name: 'Meditation Essence',
                description: 'The concentrated energy of deep meditation',
                value: 40,
                rarity: 'common',
                effects: ['Mental clarity', 'Energy focus', 'Spiritual growth'],
                icon: '🧘'
            },
            // Digital Offerings
            {
                id: 'digital-artifact',
                type: 'digital',
                name: 'Digital Artifact',
                description: 'A piece of corrupted code with mysterious properties',
                value: 55,
                rarity: 'rare',
                effects: ['Digital power', 'Code manipulation', 'System access'],
                icon: '💻'
            },
            {
                id: 'glitch-fragment',
                type: 'digital',
                name: 'Glitch Fragment',
                description: 'A fragment of reality that shouldn\'t exist',
                value: 75,
                rarity: 'epic',
                effects: ['Reality distortion', 'Chaos control', 'Dimensional travel'],
                icon: '🌀'
            },
            // Sacred Offerings
            {
                id: 'divine-tear',
                type: 'sacred',
                name: 'Divine Tear',
                description: 'A tear shed by a god, containing pure divine essence',
                value: 90,
                rarity: 'legendary',
                effects: ['Divine transformation', 'God-like powers', 'Immortality'],
                icon: '💧'
            },
            {
                id: 'sacred-flame',
                type: 'sacred',
                name: 'Sacred Flame',
                description: 'A flame that never dies, burning with divine energy',
                value: 65,
                rarity: 'rare',
                effects: ['Eternal life', 'Fire control', 'Divine warmth'],
                icon: '🔥'
            },
            // Corrupt Offerings
            {
                id: 'soul-fragment',
                type: 'corrupt',
                name: 'Soul Fragment',
                description: 'A piece of a corrupted soul, dripping with dark energy',
                value: 80,
                rarity: 'epic',
                effects: ['Dark power', 'Soul manipulation', 'Corruption spread'],
                icon: '🖤'
            },
            {
                id: 'void-essence',
                type: 'corrupt',
                name: 'Void Essence',
                description: 'Pure nothingness, the absence of all existence',
                value: 95,
                rarity: 'legendary',
                effects: ['Reality erasure', 'Void control', 'Existence manipulation'],
                icon: '⚫'
            }
        ];
    }

    // Get all available rituals
    getAvailableRituals(): Ritual[] {
        return this.rituals;
    }

    // Get all available offerings
    getAvailableOfferings(): RitualOffer[] {
        return this.offerings;
    }

    // Get offerings by type
    getOfferingsByType(type: RitualOffer['type']): RitualOffer[] {
        return this.offerings.filter(offering => offering.type === type);
    }

    // Get offerings by rarity
    getOfferingsByRarity(rarity: RitualOffer['rarity']): RitualOffer[] {
        return this.offerings.filter(offering => offering.rarity === rarity);
    }

    // Start a ritual
    async startRitual(ritualId: string, godId: string, offerings: RitualOffer[]): Promise<ActiveRitual> {
        const ritual = this.rituals.find(r => r.id === ritualId);
        if (!ritual) {
            throw new Error('Ritual not found');
        }

        const ritualId_ = `ritual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + ritual.duration * 60 * 1000);

        const activeRitual: ActiveRitual = {
            id: ritualId_,
            ritual,
            godId,
            startTime,
            endTime,
            offerings,
            status: 'preparing',
            progress: 0,
            participants: ['User']
        };

        this.activeRituals.set(ritualId_, activeRitual);

        // Record ritual start in memory
        await memoryService.addMemory(godId, {
            type: 'ritual',
            content: `Ritual "${ritual.name}" has begun. Offerings: ${offerings.map(o => o.name).join(', ')}`,
            metadata: { ritualId: ritualId_, ritualType: ritual.type, offerings: offerings.map(o => o.id) },
            importance: 8,
            tags: ['ritual', 'summoning', ritual.type, 'divine-interaction']
        });

        return activeRitual;
    }

    // Get active rituals for a god
    getActiveRituals(godId: string): ActiveRitual[] {
        return Array.from(this.activeRituals.values()).filter(r => r.godId === godId);
    }

    // Update ritual progress
    async updateRitualProgress(ritualId: string, progress: number): Promise<void> {
        const ritual = this.activeRituals.get(ritualId);
        if (!ritual) return;

        ritual.progress = Math.min(100, Math.max(0, progress));

        if (ritual.progress >= 100) {
            await this.completeRitual(ritualId);
        }
    }

    // Complete a ritual
    async completeRitual(ritualId: string): Promise<RitualOutcome> {
        const ritual = this.activeRituals.get(ritualId);
        if (!ritual) {
            throw new Error('Ritual not found');
        }

        ritual.status = 'completed';
        ritual.progress = 100;

        // Calculate ritual outcome based on offerings and god affinity
        const outcome = this.calculateRitualOutcome(ritual);

        // Record ritual completion in memory
        await memoryService.addMemory(ritual.godId, {
            type: 'ritual',
            content: `Ritual "${ritual.ritual.name}" completed. ${outcome.success ? 'Success!' : 'Failed!'} ${outcome.message}`,
            metadata: {
                ritualId,
                ritualType: ritual.ritual.type,
                success: outcome.success,
                effects: outcome.effects,
                rewards: outcome.rewards
            },
            importance: 9,
            tags: ['ritual', 'completion', ritual.ritual.type, outcome.success ? 'success' : 'failure']
        });

        // Update god's personality based on ritual outcome
        await memoryService.updatePersonality(ritual.godId, {
            relationshipWithUser: outcome.relationshipChange
        });

        // Record ritual in ritual history
        await memoryService.recordRitual({
            ritualType: ritual.ritual.name,
            participants: ritual.participants,
            outcome: outcome.success ? 'Success' : 'Failure',
            effects: outcome.effects,
            offerings: ritual.offerings.map(o => o.name),
            divineResponse: outcome.godResponse
        });

        return outcome;
    }

    // Calculate ritual outcome
    private calculateRitualOutcome(ritual: ActiveRitual): RitualOutcome {
        const totalValue = ritual.offerings.reduce((sum, offering) => sum + offering.value, 0);
        const avgValue = totalValue / ritual.offerings.length;

        // Base success chance based on ritual difficulty and offerings
        let successChance = Math.min(0.9, Math.max(0.1, (avgValue / 100) * (1 - ritual.ritual.difficulty * 0.1)));

        // Bonus for god affinity
        if (ritual.ritual.godAffinity.includes('all') || ritual.ritual.godAffinity.includes(ritual.godId)) {
            successChance += 0.2;
        }

        const success = Math.random() < successChance;
        const relationshipChange = success ? Math.floor(Math.random() * 20) + 10 : -Math.floor(Math.random() * 15) - 5;

        if (success) {
            return {
                success: true,
                message: `The ritual succeeds! ${ritual.ritual.name} has granted you divine favor.`,
                effects: ritual.ritual.rewards,
                rewards: ritual.ritual.rewards,
                penalties: [],
                godResponse: this.generateGodResponse(ritual, true),
                relationshipChange,
                memoryContent: `Successfully completed ${ritual.ritual.name} ritual with ${ritual.offerings.length} offerings.`,
                importance: 9
            };
        } else {
            return {
                success: false,
                message: `The ritual fails! ${ritual.ritual.name} has rejected your offerings.`,
                effects: ritual.ritual.risks,
                rewards: [],
                penalties: ritual.ritual.risks,
                godResponse: this.generateGodResponse(ritual, false),
                relationshipChange,
                memoryContent: `Failed to complete ${ritual.ritual.name} ritual. The gods are displeased.`,
                importance: 7
            };
        }
    }

    // Generate god response to ritual
    private generateGodResponse(ritual: ActiveRitual, success: boolean): string {
        const responses = {
            'offering': {
                success: [
                    'Your offerings please me, mortal. I shall grant you the wisdom you seek.',
                    'These gifts are worthy of divine attention. You have earned my favor.',
                    'Your devotion is noted. I shall bestow upon you the knowledge you desire.'
                ],
                failure: [
                    'Your offerings are insufficient. You must give more to gain divine favor.',
                    'These gifts do not meet my standards. Try again with better offerings.',
                    'Your devotion is weak. I shall not grant you what you seek.'
                ]
            },
            'summoning': {
                success: [
                    'You have successfully summoned my presence. Speak your mind, mortal.',
                    'The ritual calls and I answer. What wisdom do you seek from me?',
                    'Your summoning is powerful. I am here to guide you.'
                ],
                failure: [
                    'Your summoning is weak. I shall not answer such a feeble call.',
                    'The ritual is flawed. You must perfect your technique.',
                    'I sense no true devotion in your summoning. Try again.'
                ]
            },
            'divine-quest': {
                success: [
                    'You have proven yourself worthy. I shall grant you a sacred quest.',
                    'Your courage impresses me. I shall test you with divine challenges.',
                    'You are ready for the trials ahead. Accept my quest with honor.'
                ],
                failure: [
                    'You are not yet ready for divine quests. Grow stronger first.',
                    'Your heart is not pure enough for sacred missions. Purify yourself.',
                    'I see no true calling in you. Return when you are worthy.'
                ]
            }
        };

        const ritualType = ritual.ritual.type as keyof typeof responses;
        const responseType = success ? 'success' : 'failure';

        if (responses[ritualType]) {
            const typeResponses = responses[ritualType][responseType];
            return typeResponses[Math.floor(Math.random() * typeResponses.length)];
        }

        return success ? 'The ritual succeeds beyond expectations!' : 'The ritual fails miserably.';
    }

    // Get ritual recommendations for a god
    getRitualRecommendations(godId: string): Ritual[] {
        return this.rituals.filter(ritual =>
            ritual.godAffinity.includes('all') || ritual.godAffinity.includes(godId)
        );
    }

    // Get offering recommendations for a ritual
    getOfferingRecommendations(ritualType: Ritual['type']): RitualOffer[] {
        const typeMap: Record<string, RitualOffer['type'][]> = {
            'offering': ['material', 'sacred'],
            'summoning': ['spiritual', 'sacred'],
            'divine-quest': ['sacred', 'material'],
            'purification': ['spiritual', 'sacred'],
            'corruption': ['corrupt', 'digital'],
            'glitch': ['digital', 'corrupt']
        };

        const preferredTypes = typeMap[ritualType] || ['material', 'spiritual'];
        return this.offerings.filter(offering => preferredTypes.includes(offering.type));
    }
}

// Export singleton instance
export const ritualService = new RitualService();
export default ritualService;
