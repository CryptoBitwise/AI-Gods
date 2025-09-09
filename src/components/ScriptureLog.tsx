import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Share2, Eye, EyeOff } from 'lucide-react';
import { GODS } from '../data/gods';
import chatStorage, { ChatSession } from '../services/chatStorage';

interface ScriptureLogProps {
  onBack: () => void;
}

interface ScriptureEntry {
  id: string;
  godId: string;
  title: string;
  content: string;
  type: 'Prayer' | 'Gospel' | 'Prophecy' | 'Commandment';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptureLog: React.FC<ScriptureLogProps> = ({ onBack }) => {
  const [scriptures, setScriptures] = useState<ScriptureEntry[]>([]);
  const [, setAllChatSessions] = useState<ChatSession[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'Prayer' | 'Gospel' | 'Prophecy' | 'Commandment'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load chat sessions and convert to scriptures
  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = () => {
    try {
      const allSessions: ChatSession[] = [];

      // Get sessions for each god
      GODS.forEach(god => {
        const godSessions = chatStorage.getChatSessions(god.id);
        allSessions.push(...godSessions);
      });

      setAllChatSessions(allSessions);

      // Convert chat sessions to scriptures
      const convertedScriptures: ScriptureEntry[] = allSessions.map(session => {
        const god = GODS.find(g => g.id === session.godId);
        const godName = god?.name || 'Unknown God';

        // Create a conversation summary
        const conversation = session.messages
          .map(msg => `${msg.role === 'user' ? 'You' : godName}: ${msg.content}`)
          .join('\n\n');

        // Determine scripture type based on god temperament
        let type: 'Prayer' | 'Gospel' | 'Prophecy' | 'Commandment' = 'Prayer';
        if (god?.temperament === 'Mystical') type = 'Prophecy';
        else if (god?.temperament === 'Radiant') type = 'Gospel';
        else if (god?.temperament === 'Orderly') type = 'Commandment';

        return {
          id: session.id,
          godId: session.godId,
          title: `Conversation with ${godName}`,
          content: conversation,
          type,
          isPublic: true,
          createdAt: new Date(session.lastUpdated),
          updatedAt: new Date(session.lastUpdated)
        };
      });

      // Sort by most recent first
      convertedScriptures.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setScriptures(convertedScriptures);
      console.log(`📚 Loaded ${convertedScriptures.length} scriptures from chat history`);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const filteredScriptures = scriptures.filter(scripture => {
    const matchesType = selectedType === 'all' || scripture.type === selectedType;
    const matchesSearch = scripture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scripture.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getGodById = (godId: string) => {
    return GODS.find(god => god.id === godId);
  };

  const togglePublic = (scriptureId: string) => {
    setScriptures(prev => prev.map(s =>
      s.id === scriptureId ? { ...s, isPublic: !s.isPublic } : s
    ));
  };

  const downloadScripture = (scripture: ScriptureEntry) => {
    const content = `${scripture.title}\n\n${scripture.content}\n\nGenerated on: ${scripture.createdAt.toLocaleDateString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scripture.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareScripture = (scripture: ScriptureEntry) => {
    if (navigator.share) {
      navigator.share({
        title: scripture.title,
        text: scripture.content,
        url: window.location.href
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${scripture.title}\n\n${scripture.content}`);
      alert('Scripture copied to clipboard!');
    }
  };

  const refreshScriptures = () => {
    loadChatSessions();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
          <h1 className="text-4xl font-bold text-shadow mb-2">📖 Scripture Log</h1>
          <p className="text-divine-300">Your divine conversations and revelations</p>
        </div>

        <div className="text-right">
          <div className="text-sm text-divine-300">Total Scriptures</div>
          <div className="text-2xl font-bold text-divine-100">{scriptures.length}</div>
          <button
            onClick={refreshScriptures}
            className="mt-2 px-3 py-1 text-xs bg-divine-600 hover:bg-divine-500 text-divine-100 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="divine-card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-divine-300 mb-2">Scripture Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-slate-800/50 border border-divine-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-divine-400"
            >
              <option value="all">All Types</option>
              <option value="Prayer">Prayers</option>
              <option value="Gospel">Gospels</option>
              <option value="Prophecy">Prophecies</option>
              <option value="Commandment">Commandments</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-divine-300 mb-2">Search Scriptures</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or content..."
              className="w-full bg-slate-800/50 border border-divine-500/30 rounded-lg px-4 py-3 text-white placeholder-divine-300 focus:outline-none focus:border-divine-400"
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredScriptures.length === 0 && (
        <div className="divine-card text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-2xl font-bold text-shadow mb-4">No Scriptures Yet</h3>
          <p className="text-divine-300 mb-6">
            {scriptures.length === 0
              ? "Start chatting with the gods to create your first scripture!"
              : "No scriptures match your current filters. Try adjusting your search or type filter."
            }
          </p>
          {scriptures.length === 0 && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-divine-600 hover:bg-divine-500 text-divine-100 rounded-lg transition-colors"
            >
              Visit the Pantheon
            </button>
          )}
        </div>
      )}

      {/* Scriptures Grid */}
      {filteredScriptures.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredScriptures.map((scripture) => {
            const god = getGodById(scripture.godId);
            if (!god) return null;

            return (
              <div key={scripture.id} className="divine-card">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{god.avatar}</div>
                    <div>
                      <h3 className="text-lg font-bold text-shadow">{scripture.title}</h3>
                      <div className="text-sm text-divine-300">{god.name} • {scripture.type}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePublic(scripture.id)}
                      className={`p-2 rounded-lg transition-colors ${scripture.isPublic
                        ? 'bg-divine-600/50 text-divine-100'
                        : 'bg-slate-700/50 text-slate-400'
                        }`}
                      title={scripture.isPublic ? 'Make Private' : 'Make Public'}
                    >
                      {scripture.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <p className="text-divine-100 leading-relaxed line-clamp-4">
                    {scripture.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-divine-400">
                    {scripture.createdAt.toLocaleDateString()}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadScripture(scripture)}
                      className="p-2 bg-divine-700/50 hover:bg-divine-600/50 rounded-lg transition-colors text-divine-100"
                      title="Download Scripture"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={() => shareScripture(scripture)}
                      className="p-2 bg-divine-700/50 hover:bg-divine-600/50 rounded-lg transition-colors text-divine-100"
                      title="Share Scripture"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScriptureLog;
