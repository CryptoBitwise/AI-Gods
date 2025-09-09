import React, { useState, useRef, useEffect } from 'react';
import { God } from '../types/gods';
import { ArrowLeft, Send, Heart, Flame, Sparkles, Volume2, VolumeX, Zap, Download, Upload, Trash2 } from 'lucide-react';
import ttsService from '../services/tts';
import groqAIService from '../services/groqAI';
import memoryService from '../services/memory';
import chatStorage, { ChatMessage as StoredChatMessage } from '../services/chatStorage';

interface GodChatProps {
  god: God;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'god';
  content: string;
  timestamp: Date;
  ritualType?: 'Prayer' | 'Challenge' | 'Offering' | 'Divine Quest';
}

const GodChat: React.FC<GodChatProps> = ({ god, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSession, setCurrentSession] = useState<StoredChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChatHistory = () => {
    try {
      const savedSession = chatStorage.getCurrentSession(god.id);
      if (savedSession && savedSession.messages.length > 0) {
        // Convert stored messages to component format
        const loadedMessages: ChatMessage[] = savedSession.messages.map(msg => ({
          id: msg.id,
          type: msg.role === 'user' ? 'user' : 'god',
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
        setCurrentSession(savedSession.messages);
        console.log(`📚 Loaded ${loadedMessages.length} saved messages for ${god.name}`);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveMessage = (message: ChatMessage) => {
    try {
      chatStorage.addMessage(god.id, {
        role: message.type === 'user' ? 'user' : 'assistant',
        content: message.content,
        godId: god.id
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load saved chat history when component mounts
  useEffect(() => {
    loadChatHistory();
  }, [god.id]);

  // Initialize welcome message if no chat history exists
  useEffect(() => {
    if (messages.length === 0 && currentSession.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'god',
        content: `Greetings, mortal. I am ${god.name}, ${god.domain.toLowerCase()} incarnate. What wisdom do you seek from me today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      // Save the welcome message to storage
      saveMessage(welcomeMessage);
    }
  }, [messages.length, currentSession.length, god.name, god.domain]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup TTS when component unmounts
  useEffect(() => {
    return () => {
      if (ttsService.isSupported()) {
        ttsService.stop();
      }
    };
  }, []);

  const generateGodResponse = async (userMessage: string): Promise<string> => {
    setIsTyping(true);

    try {
      // Check if Groq AI is ready
      if (groqAIService.isReady()) {
        // Get god memory for context
        const godMemory = await memoryService.getGodMemory(god.id);

        // Build conversation history
        const conversationHistory = messages.map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
          timestamp: msg.timestamp
        }));

        // Create AI context
        const context = {
          god,
          userMessage,
          conversationHistory,
          godMemory: {
            relationship: godMemory?.personality.relationshipWithUser || 0,
            knowledge: godMemory?.personality.knowledgeLevel || 0,
            corruption: godMemory?.personality.corruptionLevel || 0,
            currentMood: godMemory?.personality.currentMood || 'neutral',
            specialAbilities: godMemory?.personality.specialAbilities || []
          }
        };

        // Generate real AI response
        const aiResponse = await groqAIService.generateGodResponse(context);

        // Update god memory with this interaction
        if (godMemory) {
          await memoryService.addMemory(god.id, {
            type: 'interaction',
            content: `User asked: "${userMessage}" | ${god.name} responded: "${aiResponse.content}"`,
            metadata: {
              source: 'chat',
              importance: 5,
              userMessage,
              aiResponse: aiResponse.content,
              model: aiResponse.model
            },
            importance: 5,
            tags: ['chat', 'ai-response', 'divine-wisdom']
          });
        }

        setIsTyping(false);
        return aiResponse.content;
      } else {
        // Fallback to simulated response if AI not ready
        console.warn('Groq AI not ready, using fallback response');
        return await generateFallbackResponse(userMessage);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to simulated response
      return await generateFallbackResponse(userMessage);
    }
  };

  const generateFallbackResponse = async (userMessage: string): Promise<string> => {
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    let response = '';

    // Generate fallback response based on god's temperament and domain
    switch (god.temperament) {
      case 'Orderly':
        response = `Your query requires systematic analysis. ${god.name} speaks: "${userMessage}" - this presents an opportunity for structured resolution. Consider organizing your thoughts before proceeding. What specific aspect requires my divine guidance?`;
        break;
      case 'Mystical':
        response = `The shadows whisper secrets... ${god.name} reveals: Your question dances between realms. Like dreams that fade at dawn, the answer lies not in what you ask, but in what you fear to discover. What do the depths of your soul truly seek?`;
        break;
      case 'Radiant':
        response = `Light illuminates your path! ${god.name} proclaims: Your inquiry brings warmth to my divine heart. Every question is a step toward enlightenment. Let me shine clarity upon your journey. What light do you seek in this moment?`;
        break;
      case 'Corrupt':
        response = `Ah, the sweet taste of curiosity... ${god.name} purrs: Your question reeks of innocence. How delicious. The answer you seek may corrupt your pure intentions, but transformation is beautiful, isn't it? What darkness calls to you?`;
        break;
      case 'Glitched':
        response = `ERROR: Response corrupted... ${god.name} glitches: *static* Your... *crackle* question... *digital distortion* contains... *system reboot* unexpected variables. *corrupted data* What... *glitch* do you... *error 404* seek?`;
        break;
      default:
        response = `${god.name} responds: Your question has been received. I shall contemplate this matter and provide divine guidance.`;
    }

    setIsTyping(false);
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessage(userMessage); // Save user message
    setInputMessage('');

    // Generate god's response
    const godResponse = await generateGodResponse(inputMessage);

    const godMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'god',
      content: godResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, godMessage]);
    saveMessage(godMessage); // Save god's response

    // Store conversation in memory
    try {
      await memoryService.addMemory(god.id, {
        type: 'conversation',
        content: `User: ${inputMessage} | ${god.name}: ${godResponse}`,
        metadata: {
          messageCount: messages.length + 2,
          ritualType: undefined
        },
        importance: 5,
        tags: ['conversation', 'divine-guidance', 'user-interaction']
      });

      // Update god's personality based on interaction
      await memoryService.updatePersonality(god.id, {
        currentMood: getUpdatedMood(god.temperament, inputMessage),
        relationshipWithUser: Math.min(100, Math.max(-100, Math.random() > 0.5 ? 1 : -1))
      });
    } catch (error) {
      console.error('Failed to store memory:', error);
    }

    // Speak the god's response if TTS is enabled
    if (isTTSEnabled && ttsService.isSupported()) {
      try {
        setIsSpeaking(true);
        await ttsService.speakAsGod(godResponse, god.temperament);
      } catch (error) {
        console.error('TTS Error:', error);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const getRitualSuggestion = () => {
    const rituals = [
      { type: 'Prayer', icon: Heart, description: 'Seek divine wisdom' },
      { type: 'Challenge', icon: Flame, description: 'Accept a divine quest' },
      { type: 'Offering', icon: Sparkles, description: 'Make a sacred offering' },
    ];

    const randomRitual = rituals[Math.floor(Math.random() * rituals.length)];
    return randomRitual;
  };

  const ritualSuggestion = getRitualSuggestion();

  // Helper function to update god's mood based on user interaction
  const getUpdatedMood = (temperament: string, userMessage: string): string => {
    const message = userMessage.toLowerCase();
    const moods = {
      'Orderly': message.includes('help') || message.includes('guide') ? 'Focused' : 'Contemplative',
      'Mystical': message.includes('dream') || message.includes('mystery') ? 'Intrigued' : 'Mysterious',
      'Radiant': message.includes('hope') || message.includes('light') ? 'Inspired' : 'Hopeful',
      'Corrupt': message.includes('dark') || message.includes('corrupt') ? 'Amused' : 'Intrigued',
      'Glitched': message.includes('error') || message.includes('glitch') ? 'Excited' : 'Chaotic'
    };
    return moods[temperament as keyof typeof moods] || 'Neutral';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-divine-300 hover:text-divine-100 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Return to Pantheon</span>
        </button>

        <div className="text-center">
          <div className="text-4xl mb-2">{god.avatar}</div>
          <h1 className="text-3xl font-bold text-shadow">{god.name}</h1>
          <p className="text-divine-300">{god.domain}</p>

          {/* AI Status Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${groqAIService.isReady() ? 'bg-green-400' : 'bg-yellow-400'
              }`}></div>
            <span className="text-xs text-slate-400">
              {groqAIService.isReady() ? 'AI Active' : 'AI Fallback'}
            </span>
            {groqAIService.isReady() && (
              <Zap className="text-blue-400" size={12} />
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-divine-300">Divine Standing</div>
          <div className="text-2xl font-bold text-divine-100">{god.divineStanding}</div>

          {/* TTS Controls */}
          <div className="mt-2 flex items-center justify-end space-x-2">
            <button
              onClick={() => setIsTTSEnabled(!isTTSEnabled)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${isTTSEnabled
                ? 'bg-divine-600 text-white'
                : 'bg-slate-700 text-divine-300 hover:bg-slate-600'
                }`}
              title={isTTSEnabled ? 'Disable TTS' : 'Enable TTS'}
            >
              {isTTSEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              <span>{isTTSEnabled ? 'Voice ON' : 'Voice OFF'}</span>
            </button>

            {/* TTS Service Indicator */}
            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-700 text-divine-300 rounded text-xs">
              <div className={`w-2 h-2 rounded-full ${(() => {
                const status = ttsService.getServiceStatus();
                return status.coquiTTS ? 'bg-green-400' : 'bg-blue-400';
              })()}`}></div>
              <span>{(() => {
                const status = ttsService.getServiceStatus();
                return status.coquiTTS ? 'Coqui TTS' : 'Web Speech';
              })()}</span>
            </div>

            {isSpeaking && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-divine-600 text-white rounded text-xs">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Speaking...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Management */}
      <div className="flex items-center justify-center space-x-3 mb-4">
        <button
          onClick={() => {
            chatStorage.startNewSession(god.id);
            setMessages([]);
            setCurrentSession([]);
            console.log('🆕 New chat session started');
          }}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
          title="Start New Chat"
        >
          <Zap size={16} />
          <span>New Chat</span>
        </button>

        <button
          onClick={() => {
            const chatData = chatStorage.exportChats();
            const blob = new Blob([chatData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${god.name}_chat_history.json`;
            a.click();
            URL.revokeObjectURL(url);
            console.log('📥 Chat history exported');
          }}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
          title="Export Chat History"
        >
          <Download size={16} />
          <span>Export</span>
        </button>

        <button
          onClick={() => {
            if (window.confirm(`Clear all chat history for ${god.name}? This cannot be undone.`)) {
              chatStorage.clearChatHistory(god.id);
              setMessages([]);
              setCurrentSession([]);
              console.log('🗑️ Chat history cleared');
            }
          }}
          className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
          title="Clear Chat History"
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </button>

        {/* TTS Settings */}
        <button
          onClick={async () => {
            const status = ttsService.getServiceStatus();
            const coquiVoices = ttsService.getCoquiVoices();
            console.log('🎵 TTS Service Status:', status);
            console.log('🎵 Coqui TTS Voices:', coquiVoices);

            // Test Coqui TTS audio if available
            if (status.coquiTTS) {
              console.log('🧪 Testing Coqui TTS audio...');
              try {
                const coquiTTS = await import('../services/coquiTTS');
                await coquiTTS.default.testAudio();

                // Also try to unlock audio
                await coquiTTS.default.unlockAudio();

                alert(`🎵 TTS Test Complete!\n\nAudio should now be unlocked and working.\n\nTry chatting with a god to hear their voice!`);
              } catch (error) {
                console.error('TTS Test failed:', error);
                alert(`❌ TTS Test failed: ${error}`);
              }
            } else {
              alert(`TTS Service Status:\n\nPreferred: ${status.preferred}\nWeb Speech: ${status.webSpeech ? 'Available' : 'Not Available'}\nCoqui TTS: ${status.coquiTTS ? 'Available' : 'Not Available'}\nTotal Voices: ${status.voices}\n\nCheck console for detailed logs!`);
            }
          }}
          className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
          title="TTS Service Info & Test"
        >
          <Volume2 size={16} />
          <span>Unlock Audio</span>
        </button>
      </div>

      {/* Chat Statistics */}
      <div className="text-center mb-4">
        <div className="text-sm text-divine-300">
          {(() => {
            const stats = chatStorage.getChatStats();
            const godStats = stats.godsWithChats.includes(god.id) ?
              chatStorage.getChatSessions(god.id).reduce((sum, session) => sum + session.totalMessages, 0) : 0;
            return `Total messages with ${god.name}: ${godStats} | Total sessions: ${stats.totalSessions}`;
          })()}
        </div>
      </div>

      {/* Chat Container */}
      <div className="divine-card h-96 overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${message.type === 'user'
                  ? 'bg-divine-600 text-white'
                  : 'bg-slate-700/50 text-divine-100'
                  }`}
              >
                <div className="text-sm opacity-75 mb-1">
                  {message.type === 'user' ? 'You' : god.name}
                </div>
                <div className="leading-relaxed">{message.content}</div>
                <div className="text-xs opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 text-divine-100 px-4 py-3 rounded-lg">
                <div className="text-sm opacity-75 mb-1">{god.name}</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-divine-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-divine-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-divine-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Ritual Suggestion */}
        <div className="border-t border-divine-500/30 p-4">
          <div className="text-center">
            <div className="text-sm text-divine-300 mb-2">Suggested Ritual</div>
            <button className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 bg-divine-700/50 hover:bg-divine-600/50 rounded-lg transition-colors">
              <ritualSuggestion.icon size={16} />
              <span>{ritualSuggestion.type}</span>
            </button>
            <div className="text-xs text-divine-400 mt-1">{ritualSuggestion.description}</div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-divine-500/30 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Ask ${god.name} for divine guidance...`}
              className="flex-1 bg-slate-800/50 border border-divine-500/30 rounded-lg px-4 py-3 text-white placeholder-divine-300 focus:outline-none focus:border-divine-400 focus:ring-2 focus:ring-divine-400/20"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="divine-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* God Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="divine-card">
          <h3 className="text-xl font-bold mb-4 text-shadow">Divine Personality</h3>
          <p className="text-divine-100 leading-relaxed">{god.personality}</p>
        </div>

        <div className="divine-card">
          <h3 className="text-xl font-bold mb-4 text-shadow">Sacred Rules</h3>
          <div className="space-y-2">
            {god.rules.map((rule, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-divine-400 mt-1">•</span>
                <span className="text-divine-100">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GodChat;
