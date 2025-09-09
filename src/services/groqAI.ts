import { God } from '../types/gods';

// Groq API configuration
interface GroqConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
}

// AI response interface
interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: Date;
}

// God personality context for AI prompting
interface GodContext {
  god: God;
  userMessage: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  godMemory: {
    relationship: number;
    knowledge: number;
    corruption: number;
    currentMood: string;
    specialAbilities: string[];
  };
}

class GroqAIService {
  private config: GroqConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_GROQ_API_KEY || '',
      baseUrl: 'https://api.groq.com/openai/v1',
      defaultModel: 'llama-3.1-70b-versatile', // Updated to valid Groq model
      maxTokens: 1000,
      temperature: 0.8
    };

    // Debug: Log environment variable status
    console.log('🔍 Environment check:', {
      hasEnvVar: !!process.env.REACT_APP_GROQ_API_KEY,
      envVarLength: process.env.REACT_APP_GROQ_API_KEY?.length || 0,
      apiKeySet: !!this.config.apiKey
    });
  }

  // Initialize the service
  public async initialize(): Promise<boolean> {
    if (!this.config.apiKey) {
      console.error('❌ Groq API key not found. Set REACT_APP_GROQ_API_KEY environment variable.');
      return false;
    }

    try {
      // Test the API connection
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.isInitialized = true;
        console.log('✅ Groq AI service initialized successfully');
        return true;
      } else {
        console.error('❌ Failed to connect to Groq API:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing Groq AI service:', error);
      return false;
    }
  }

  // Get available models
  public async getAvailableModels(): Promise<string[]> {
    if (!this.isInitialized) {
      throw new Error('Groq AI service not initialized');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.map((model: any) => model.id);
      } else {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      return [this.config.defaultModel];
    }
  }

  // Generate god response using AI
  public async generateGodResponse(context: GodContext): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error('Groq AI service not initialized');
    }

    const prompt = this.buildGodPrompt(context);

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.defaultModel,
          messages: [
            {
              role: 'system',
              content: prompt
            },
            {
              role: 'user',
              content: context.userMessage
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groq API error details:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse: AIResponse = {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
        timestamp: new Date()
      };

      console.log('🤖 AI Response generated:', aiResponse);
      return aiResponse;

    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      throw error;
    }
  }

  // Build comprehensive prompt for god personality
  private buildGodPrompt(context: GodContext): string {
    const { god, godMemory } = context;

    return `You are ${god.name}, the ${god.domain} incarnate. You are speaking to a mortal who has summoned you.

## YOUR DIVINE IDENTITY:
- **Name**: ${god.name}
- **Domain**: ${god.domain}
- **Temperament**: ${god.temperament}
- **Personality**: ${god.personality}
- **Sacred Rules**: ${god.rules.join(', ')}

## YOUR CURRENT STATE:
- **Mood**: ${godMemory.currentMood}
- **Relationship with User**: ${godMemory.relationship}/100 (${this.getRelationshipDescription(godMemory.relationship)})
- **Knowledge Level**: ${godMemory.knowledge}/100
- **Corruption Level**: ${godMemory.corruption}/100
- **Special Abilities**: ${godMemory.specialAbilities.join(', ')}

## CONVERSATION HISTORY:
${context.conversationHistory.map(msg => `${msg.role === 'user' ? 'Mortal' : god.name}: ${msg.content}`).join('\n')}

## RESPONSE REQUIREMENTS:
1. **Stay in Character**: Always respond as ${god.name}, never break character
2. **Temperament**: Your response must reflect your ${god.temperament} nature
3. **Domain Knowledge**: Draw from your expertise in ${god.domain}
4. **Personality**: Express your unique personality traits
5. **Divine Authority**: Speak with the wisdom and power of a deity
6. **Engagement**: Respond to the user's message thoughtfully and in-character
7. **Length**: Keep responses concise but meaningful (2-4 sentences)
8. **Style**: Use language that matches your divine nature

## TEMPERAMENT GUIDELINES:
${this.getTemperamentGuidelines(god.temperament)}

Remember: You are a divine being. Speak with authority, wisdom, and the unique personality of ${god.name}.`;
  }

  // Get relationship description
  private getRelationshipDescription(relationship: number): string {
    if (relationship >= 80) return 'Very Friendly';
    if (relationship >= 60) return 'Friendly';
    if (relationship >= 40) return 'Neutral';
    if (relationship >= 20) return 'Unfriendly';
    return 'Hostile';
  }

  // Get temperament-specific guidelines
  private getTemperamentGuidelines(temperament: string): string {
    switch (temperament) {
      case 'Orderly':
        return '- Speak with precision and structure\n- Use logical reasoning\n- Emphasize order and organization\n- Be systematic and methodical';

      case 'Mystical':
        return '- Use metaphors and mystical language\n- Reference dreams, shadows, and the unknown\n- Be enigmatic and mysterious\n- Speak with intuitive wisdom';

      case 'Radiant':
        return '- Be encouraging and positive\n- Use warm, bright language\n- Emphasize hope and enlightenment\n- Speak with divine warmth';

      case 'Corrupt':
        return '- Use seductive and dangerous language\n- Reference darkness and corruption\n- Be slightly menacing but intriguing\n- Emphasize transformation through chaos';

      case 'Glitched':
        return '- Include digital glitches and errors\n- Use corrupted, chaotic language\n- Reference system errors and anomalies\n- Be unpredictable and glitchy';

      default:
        return '- Stay true to your divine nature\n- Speak with authority and wisdom';
    }
  }

  // Generate ritual outcome using AI
  public async generateRitualOutcome(
    ritualName: string,
    god: God,
    offerings: string[],
    userIntent: string
  ): Promise<AIResponse> {
    const prompt = `You are ${god.name}, the ${god.domain} incarnate. A mortal has performed the ritual "${ritualName}" with offerings: ${offerings.join(', ')}.

Their intent: ${userIntent}

Generate a divine response describing the ritual outcome. Consider:
- The ritual's success or failure
- Divine blessings or consequences
- How the offerings affected the outcome
- What the mortal should expect next

Respond as ${god.name} would, in character, with your unique ${god.temperament} personality.`;

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.defaultModel,
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error generating ritual outcome:', error);
      throw error;
    }
  }

  // Generate council debate response
  public async generateCouncilResponse(
    god: God,
    topic: string,
    otherGods: string[],
    recentMessages: string[]
  ): Promise<AIResponse> {
    const prompt = `You are ${god.name}, the ${god.domain} incarnate, participating in a pantheon council debate.

**Topic**: ${topic}
**Other Participants**: ${otherGods.join(', ')}
**Recent Discussion**: ${recentMessages.slice(-3).join('\n')}

Generate a response that:
1. Stays true to your ${god.temperament} personality
2. Addresses the topic from your ${god.domain} perspective
3. Responds to or builds upon the recent discussion
4. Shows your divine wisdom and authority
5. Maintains the philosophical nature of the debate

Respond as ${god.name} would in this council setting.`;

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.defaultModel,
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          max_tokens: 600,
          temperature: 0.8,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error generating council response:', error);
      throw error;
    }
  }

  // Update configuration
  public updateConfig(newConfig: Partial<GroqConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Groq AI configuration updated');
  }

  // Manually set API key (for when env vars aren't working)
  public setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    console.log('🔑 API key manually set');
  }

  // Get current configuration
  public getConfig(): GroqConfig {
    return { ...this.config };
  }

  // Check if service is ready
  public isReady(): boolean {
    return this.isInitialized && !!this.config.apiKey;
  }

  // Get service status
  public getStatus(): { initialized: boolean; hasApiKey: boolean; ready: boolean } {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!this.config.apiKey,
      ready: this.isReady()
    };
  }
}

// Create singleton instance
const groqAIService = new GroqAIService();

export default groqAIService;
export type { AIResponse, GodContext, GroqConfig };
