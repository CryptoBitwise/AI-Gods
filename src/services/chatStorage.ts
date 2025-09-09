// Chat storage service for persisting conversations
// import { God } from '../types/gods';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    godId: string;
}

export interface ChatSession {
    id: string;
    godId: string;
    messages: ChatMessage[];
    lastUpdated: Date;
    totalMessages: number;
}

class ChatStorageService {
    private readonly STORAGE_KEY = 'ai_gods_chats';
    private readonly MAX_SESSIONS_PER_GOD = 10; // Keep last 10 sessions per god

    // Get all chat sessions for a specific god
    public getChatSessions(godId: string): ChatSession[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return [];

            const allSessions: ChatSession[] = JSON.parse(stored);
            return allSessions
                .filter(session => session.godId === godId)
                .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            return [];
        }
    }

    // Get the most recent chat session for a god
    public getCurrentSession(godId: string): ChatSession | null {
        const sessions = this.getChatSessions(godId);
        return sessions.length > 0 ? sessions[0] : null;
    }

    // Add a new message to the current session
    public addMessage(godId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            let allSessions: ChatSession[] = stored ? JSON.parse(stored) : [];

            // Find or create current session
            let currentSession = allSessions.find(session => session.godId === godId);

            if (!currentSession) {
                currentSession = {
                    id: this.generateSessionId(),
                    godId,
                    messages: [],
                    lastUpdated: new Date(),
                    totalMessages: 0
                };
                allSessions.push(currentSession);
            }

            // Add the new message
            const newMessage: ChatMessage = {
                ...message,
                id: this.generateMessageId(),
                timestamp: new Date()
            };

            currentSession.messages.push(newMessage);
            currentSession.lastUpdated = new Date();
            currentSession.totalMessages = currentSession.messages.length;

            // Clean up old sessions if we have too many
            this.cleanupOldSessions(allSessions, godId);

            // Save back to localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSessions));

            console.log(`💾 Chat saved: ${currentSession.messages.length} messages for ${godId}`);
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    }

    // Start a new chat session for a god
    public startNewSession(godId: string): ChatSession {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            let allSessions: ChatSession[] = stored ? JSON.parse(stored) : [];

            const newSession: ChatSession = {
                id: this.generateSessionId(),
                godId,
                messages: [],
                lastUpdated: new Date(),
                totalMessages: 0
            };

            allSessions.push(newSession);
            this.cleanupOldSessions(allSessions, godId);

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSessions));

            console.log(`🆕 New chat session started for ${godId}`);
            return newSession;
        } catch (error) {
            console.error('Error starting new session:', error);
            return {
                id: this.generateSessionId(),
                godId,
                messages: [],
                lastUpdated: new Date(),
                totalMessages: 0
            };
        }
    }

    // Clear all chat sessions for a specific god
    public clearChatHistory(godId: string): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return;

            let allSessions: ChatSession[] = JSON.parse(stored);
            allSessions = allSessions.filter(session => session.godId !== godId);

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSessions));
            console.log(`🗑️ Chat history cleared for ${godId}`);
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    }

    // Clear all chat history
    public clearAllChats(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('🗑️ All chat history cleared');
        } catch (error) {
            console.error('Error clearing all chats:', error);
        }
    }

    // Get chat statistics
    public getChatStats(): { totalSessions: number; totalMessages: number; godsWithChats: string[] } {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return { totalSessions: 0, totalMessages: 0, godsWithChats: [] };

            const allSessions: ChatSession[] = JSON.parse(stored);
            const godsWithChats = Array.from(new Set(allSessions.map(session => session.godId)));
            const totalMessages = allSessions.reduce((sum, session) => sum + session.totalMessages, 0);

            return {
                totalSessions: allSessions.length,
                totalMessages,
                godsWithChats
            };
        } catch (error) {
            console.error('Error getting chat stats:', error);
            return { totalSessions: 0, totalMessages: 0, godsWithChats: [] };
        }
    }

    // Export chat data for backup
    public exportChats(): string {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored || '[]';
        } catch (error) {
            console.error('Error exporting chats:', error);
            return '[]';
        }
    }

    // Import chat data from backup
    public importChats(chatData: string): boolean {
        try {
            const parsed = JSON.parse(chatData);
            if (Array.isArray(parsed)) {
                localStorage.setItem(this.STORAGE_KEY, chatData);
                console.log('📥 Chat data imported successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing chats:', error);
            return false;
        }
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private cleanupOldSessions(allSessions: ChatSession[], godId: string): void {
        const godSessions = allSessions.filter(session => session.godId === godId);
        if (godSessions.length > this.MAX_SESSIONS_PER_GOD) {
            // Remove oldest sessions beyond the limit
            const sessionsToRemove = godSessions
                .sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime())
                .slice(0, godSessions.length - this.MAX_SESSIONS_PER_GOD);

            sessionsToRemove.forEach(session => {
                const index = allSessions.findIndex(s => s.id === session.id);
                if (index > -1) {
                    allSessions.splice(index, 1);
                }
            });
        }
    }
}

const chatStorage = new ChatStorageService();
export default chatStorage;
