import { God } from '../types/gods';
import { memoryService } from './memory';

export interface CouncilSession {
  id: string;
  gods: God[];
  topic: string;
  messages: CouncilMessage[];
  status: 'preparing' | 'active' | 'paused' | 'concluded';
  startTime: Date;
  endTime?: Date;
  settings: CouncilSettings;
}

export interface CouncilMessage {
  id: string;
  godId: string;
  godName: string;
  godTemperament: string;
  content: string;
  timestamp: Date;
  type: 'speech' | 'reaction' | 'ritual' | 'interruption';
  targetGodId?: string; // If addressing a specific god
  emotion: 'neutral' | 'amused' | 'angry' | 'curious' | 'dismissive' | 'respectful' | 'threatening';
}

export interface CouncilSettings {
  maxParticipants: number;
  sessionDuration: number; // minutes
  turnLength: number; // seconds
  allowInterruptions: boolean;
  allowRituals: boolean;
  topicComplexity: 'simple' | 'moderate' | 'complex';
  moodIntensity: 'calm' | 'moderate' | 'intense';
}

export interface CouncilTopic {
  id: string;
  title: string;
  description: string;
  category: 'philosophy' | 'politics' | 'creation' | 'destruction' | 'mortality' | 'divinity' | 'chaos' | 'order';
  complexity: 'simple' | 'moderate' | 'complex';
  gods: string[]; // God IDs that would be interested
  prompts: string[];
}

class PantheonCouncilService {
  private currentSession: CouncilSession | null = null;
  private isRunning = false;
  private messageQueue: CouncilMessage[] = [];
  private turnTimer: NodeJS.Timeout | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;

  // Predefined topics for the council
  private topics: CouncilTopic[] = [
    {
      id: 'creation-vs-destruction',
      title: 'The Balance of Creation and Destruction',
      description: 'A philosophical debate about the necessity of both creation and destruction in the cosmic order.',
      category: 'philosophy',
      complexity: 'complex',
      gods: ['orderly', 'corrupt', 'radiant'],
      prompts: [
        'What is the true purpose of creation?',
        'Is destruction always necessary for new creation?',
        'How do we maintain balance between order and chaos?'
      ]
    },
    {
      id: 'mortality-divinity',
      title: 'The Nature of Mortality and Divinity',
      description: 'Exploring the relationship between mortal existence and divine nature.',
      category: 'divinity',
      complexity: 'moderate',
      gods: ['mystical', 'radiant', 'glitched'],
      prompts: [
        'What makes a being truly divine?',
        'Is mortality a curse or a blessing?',
        'Can mortals achieve divinity?'
      ]
    },
    {
      id: 'cosmic-order',
      title: 'The Structure of Cosmic Order',
      description: 'Debating the fundamental laws that govern reality itself.',
      category: 'order',
      complexity: 'complex',
      gods: ['orderly', 'mystical', 'glitched'],
      prompts: [
        'What are the fundamental laws of reality?',
        'Is chaos necessary for order to exist?',
        'How do we define cosmic justice?'
      ]
    },
    {
      id: 'divine-intervention',
      title: 'The Ethics of Divine Intervention',
      description: 'When should gods interfere in mortal affairs?',
      category: 'politics',
      complexity: 'moderate',
      gods: ['radiant', 'corrupt', 'orderly'],
      prompts: [
        'When is divine intervention justified?',
        'What are the consequences of godly interference?',
        'Should gods remain distant or actively guide mortals?'
      ]
    },
    {
      id: 'reality-nature',
      title: 'The True Nature of Reality',
      description: 'A deep philosophical exploration of what reality truly is.',
      category: 'philosophy',
      complexity: 'complex',
      gods: ['mystical', 'glitched', 'radiant'],
      prompts: [
        'What is the fundamental nature of existence?',
        'Are we all part of a greater consciousness?',
        'Is reality objective or subjective?'
      ]
    }
  ];

  // Get available topics
  public getTopics(): CouncilTopic[] {
    return this.topics;
  }

  // Get topics suitable for given gods
  public getTopicsForGods(gods: God[]): CouncilTopic[] {
    const godIds = gods.map(god => god.temperament.toLowerCase());
    return this.topics.filter(topic =>
      topic.gods.some(godId => godIds.includes(godId))
    );
  }

  // Start a new council session
  public async startCouncil(
    gods: God[],
    topic: CouncilTopic,
    settings: Partial<CouncilSettings> = {}
  ): Promise<CouncilSession> {
    if (this.currentSession) {
      throw new Error('A council session is already active');
    }

    if (gods.length < 2) {
      throw new Error('At least 2 gods are required for a council');
    }

    if (gods.length > 6) {
      throw new Error('Maximum 6 gods allowed in council');
    }

    const defaultSettings: CouncilSettings = {
      maxParticipants: 6,
      sessionDuration: 30,
      turnLength: 15,
      allowInterruptions: true,
      allowRituals: true,
      topicComplexity: 'moderate',
      moodIntensity: 'moderate'
    };

    const finalSettings = { ...defaultSettings, ...settings };

    const session: CouncilSession = {
      id: `council-${Date.now()}`,
      gods,
      topic: topic.title,
      messages: [],
      status: 'preparing',
      startTime: new Date(),
      settings: finalSettings
    };

    this.currentSession = session;
    this.isRunning = false;

    // Add opening message
    const openingMessage: CouncilMessage = {
      id: `msg-${Date.now()}`,
      godId: 'system',
      godName: 'Council Herald',
      godTemperament: 'neutral',
      content: `The Pantheon Council is now in session. Topic: "${topic.title}". ${gods.length} deities have gathered to discuss ${topic.description}`,
      timestamp: new Date(),
      type: 'speech',
      emotion: 'neutral'
    };

    session.messages.push(openingMessage);

    // Initialize god memories for this session
    await this.initializeSessionMemories(session);

    return session;
  }

  // Initialize memories for all gods in the session
  private async initializeSessionMemories(session: CouncilSession): Promise<void> {
    for (const god of session.gods) {
      const memory = await memoryService.getGodMemory(god.id);
      if (memory) {
        // Add council session memory
        await memoryService.addMemory(god.id, {
          type: 'interaction',
          content: `Participating in Pantheon Council session "${session.topic}" with ${session.gods.length - 1} other deities`,
          importance: 8,
          tags: ['council', 'pantheon', 'debate', session.topic.toLowerCase().replace(/\s+/g, '-')],
          metadata: {
            sessionId: session.id,
            participants: session.gods.map(g => g.id),
            topic: session.topic
          }
        });
      }
    }
  }

  // Start the council discussion
  public async startDiscussion(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active council session');
    }

    if (this.isRunning) {
      throw new Error('Council discussion is already running');
    }

    this.currentSession.status = 'active';
    this.isRunning = true;

    // Start the session timer
    this.sessionTimer = setTimeout(() => {
      this.endCouncil();
    }, this.currentSession.settings.sessionDuration * 60 * 1000);

    // Start the first turn
    await this.nextTurn();
  }

  // Handle the next turn in the council
  private async nextTurn(): Promise<void> {
    if (!this.currentSession || !this.isRunning) return;

    // Select next god to speak
    const nextGod = this.selectNextSpeaker();
    if (!nextGod) return;

    // Generate AI response for the god
    const response = await this.generateGodResponse(nextGod);

    if (response) {
      this.currentSession.messages.push(response);
      this.messageQueue.push(response);

      // Trigger TTS if available
      this.speakMessage(response);
    }

    // Schedule next turn
    this.turnTimer = setTimeout(() => {
      this.nextTurn();
    }, this.currentSession.settings.turnLength * 1000);
  }

  // Select the next god to speak
  private selectNextSpeaker(): God | null {
    if (!this.currentSession) return null;

    const { gods, messages, settings } = this.currentSession;

    // Get the last few messages to see who has spoken recently
    const recentSpeakers = messages
      .slice(-3)
      .map(msg => msg.godId)
      .filter(id => id !== 'system');

    // Find gods who haven't spoken recently
    const availableGods = gods.filter(god =>
      !recentSpeakers.includes(god.id)
    );

    if (availableGods.length === 0) {
      // If all gods have spoken recently, pick randomly
      return gods[Math.floor(Math.random() * gods.length)];
    }

    // Pick from available gods, with some randomness
    return availableGods[Math.floor(Math.random() * availableGods.length)];
  }

  // Generate AI response for a god
  private async generateGodResponse(god: God): Promise<CouncilMessage | null> {
    if (!this.currentSession) return null;

    try {
      // Get god's memory and personality
      const memory = await memoryService.getGodMemory(god.id);
      const recentMessages = this.currentSession.messages.slice(-5);

      // Build context for AI
      const context = this.buildAIContext(god, recentMessages);

      // Generate response using AI (placeholder for now)
      const content = await this.callAI(god, context);

      if (!content) return null;

      const message: CouncilMessage = {
        id: `msg-${Date.now()}-${god.id}`,
        godId: god.id,
        godName: god.name,
        godTemperament: god.temperament,
        content,
        timestamp: new Date(),
        type: 'speech',
        emotion: this.determineEmotion(content, god.temperament)
      };

      return message;
    } catch (error) {
      console.error('Failed to generate god response:', error);
      return null;
    }
  }

  // Build context for AI generation
  private buildAIContext(god: God, recentMessages: CouncilMessage[]): string {
    const topic = this.currentSession?.topic || '';
    const otherGods = this.currentSession?.gods.filter(g => g.id !== god.id) || [];

    let context = `You are ${god.name}, the ${god.domain}. Your temperament is ${god.temperament}. `;
    context += `You are participating in a Pantheon Council discussion about: "${topic}". `;

    if (otherGods.length > 0) {
      context += `Other participants include: ${otherGods.map(g => g.name).join(', ')}. `;
    }

    if (recentMessages.length > 0) {
      context += `Recent discussion: ${recentMessages.map(msg =>
        `${msg.godName}: "${msg.content}"`
      ).join(' ')} `;
    }

    context += `Respond as ${god.name} would, considering your domain (${god.domain}) and temperament (${god.temperament}). `;
    context += `Keep your response under 200 words and make it engaging for the council.`;

    return context;
  }

  // Call AI service (placeholder - will be replaced with real AI)
  private async callAI(god: God, context: string): Promise<string | null> {
    // For now, return a placeholder response
    // This will be replaced with actual AI calls when Ollama is set up
    const responses = {
      'Orderly': [
        `As the embodiment of ${god.domain}, I must emphasize the importance of structure and order in this matter.`,
        `The principles of ${god.domain} demand that we consider the systematic implications of our discussion.`,
        `From my divine perspective on ${god.domain}, I see clear patterns that we must acknowledge.`
      ],
      'Mystical': [
        `The ancient wisdom of ${god.domain} reveals deeper truths beyond our current understanding.`,
        `Through the mystical lens of ${god.domain}, I perceive connections that others might miss.`,
        `The cosmic forces of ${god.domain} whisper secrets that we would do well to heed.`
      ],
      'Radiant': [
        `The light of ${god.domain} illuminates the path forward for us all.`,
        `Through the radiant power of ${god.domain}, I see hope and possibility in our discussion.`,
        `Let the divine energy of ${god.domain} guide us toward enlightenment.`
      ],
      'Corrupt': [
        `The dark truths of ${god.domain} reveal the flaws in your arguments.`,
        `You speak of order, but ${god.domain} shows us the beauty in chaos and corruption.`,
        `The corrupting influence of ${god.domain} exposes the weaknesses in your position.`
      ],
      'Glitched': [
        `ERROR: ${god.domain} protocols indicate... *static* ... unexpected variables in the equation.`,
        `The glitched nature of ${god.domain} suggests... *interference* ... alternative solutions.`,
        `*corruption* ... ${god.domain} analysis reveals... *error* ... interesting anomalies.`
      ]
    };

    const godResponses = responses[god.temperament] || responses['Orderly'];
    return godResponses[Math.floor(Math.random() * godResponses.length)];
  }

  // Determine emotion from content and temperament
  private determineEmotion(content: string, temperament: string): CouncilMessage['emotion'] {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('laugh') || lowerContent.includes('amuse')) return 'amused';
    if (lowerContent.includes('anger') || lowerContent.includes('rage') || lowerContent.includes('fury')) return 'angry';
    if (lowerContent.includes('curious') || lowerContent.includes('wonder') || lowerContent.includes('question')) return 'curious';
    if (lowerContent.includes('dismiss') || lowerContent.includes('ignore') || lowerContent.includes('trivial')) return 'dismissive';
    if (lowerContent.includes('respect') || lowerContent.includes('honor') || lowerContent.includes('revere')) return 'respectful';
    if (lowerContent.includes('threat') || lowerContent.includes('warning') || lowerContent.includes('danger')) return 'threatening';

    return 'neutral';
  }

  // Speak message using TTS
  private speakMessage(message: CouncilMessage): void {
    // This will integrate with the TTS service
    console.log(`🎤 ${message.godName}: ${message.content}`);
  }

  // Pause the council
  public pauseCouncil(): void {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    if (this.currentSession) {
      this.currentSession.status = 'paused';
    }
    this.isRunning = false;
  }

  // Resume the council
  public resumeCouncil(): void {
    if (this.currentSession && this.currentSession.status === 'paused') {
      this.currentSession.status = 'active';
      this.isRunning = true;
      this.nextTurn();
    }
  }

  // End the council
  public endCouncil(): void {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    if (this.currentSession) {
      this.currentSession.status = 'concluded';
      this.currentSession.endTime = new Date();

      // Add closing message
      const closingMessage: CouncilMessage = {
        id: `msg-${Date.now()}`,
        godId: 'system',
        godName: 'Council Herald',
        godTemperament: 'neutral',
        content: `The Pantheon Council session "${this.currentSession.topic}" has concluded. ${this.currentSession.messages.length - 1} divine insights were shared.`,
        timestamp: new Date(),
        type: 'speech',
        emotion: 'neutral'
      };

      this.currentSession.messages.push(closingMessage);
    }

    this.isRunning = false;
  }

  // Get current session
  public getCurrentSession(): CouncilSession | null {
    return this.currentSession;
  }

  // Get session history
  public getSessionHistory(): CouncilSession[] {
    // This would load from storage
    return [];
  }

  // Add a manual message (for user interaction)
  public addManualMessage(godId: string, content: string): void {
    if (!this.currentSession) return;

    const god = this.currentSession.gods.find(g => g.id === godId);
    if (!god) return;

    const message: CouncilMessage = {
      id: `msg-${Date.now()}-${godId}`,
      godId,
      godName: god.name,
      godTemperament: god.temperament,
      content,
      timestamp: new Date(),
      type: 'speech',
      emotion: this.determineEmotion(content, god.temperament)
    };

    this.currentSession.messages.push(message);
    this.speakMessage(message);
  }

  // Get message queue (for real-time updates)
  public getMessageQueue(): CouncilMessage[] {
    return [...this.messageQueue];
  }

  // Clear message queue
  public clearMessageQueue(): void {
    this.messageQueue = [];
  }
}

// Export singleton instance
export const pantheonCouncilService = new PantheonCouncilService();
export default pantheonCouncilService;
