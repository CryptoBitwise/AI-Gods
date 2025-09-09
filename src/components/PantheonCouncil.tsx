import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Settings,
  MessageSquare,
  Clock,
  Volume2,
  VolumeX,
  X,
  ChevronDown,
  ChevronUp,
  Crown
} from 'lucide-react';
import { God } from '../types/gods';
import { GODS } from '../data/gods';
import pantheonCouncilService, {
  CouncilSession,
  CouncilMessage,
  CouncilTopic,
  CouncilSettings
} from '../services/pantheonCouncil';
// import ttsService from '../services/tts';

interface PantheonCouncilProps {
  onClose: () => void;
}

const PantheonCouncil: React.FC<PantheonCouncilProps> = ({ onClose }) => {
  const [currentSession, setCurrentSession] = useState<CouncilSession | null>(null);
  const [selectedGods, setSelectedGods] = useState<God[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<CouncilTopic | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Partial<CouncilSettings>>({});
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [showGodSelector, setShowGodSelector] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Get available topics for selected gods
  const availableTopics = selectedGods.length > 0
    ? pantheonCouncilService.getTopicsForGods(selectedGods)
    : pantheonCouncilService.getTopics();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, autoScroll]);

  // Check for current session on mount
  useEffect(() => {
    const session = pantheonCouncilService.getCurrentSession();
    if (session) {
      setCurrentSession(session);
    }
  }, []);

  // Handle god selection
  const handleGodSelect = (god: God) => {
    if (selectedGods.find(g => g.id === god.id)) {
      setSelectedGods(selectedGods.filter(g => g.id !== god.id));
    } else {
      if (selectedGods.length < 6) {
        setSelectedGods([...selectedGods, god]);
      }
    }
  };

  // Handle topic selection
  const handleTopicSelect = (topic: CouncilTopic) => {
    setSelectedTopic(topic);
    setShowTopicSelector(false);
  };

  // Start council session
  const handleStartCouncil = async () => {
    if (selectedGods.length < 2) {
      alert('Please select at least 2 gods for the council');
      return;
    }

    if (!selectedTopic) {
      alert('Please select a topic for discussion');
      return;
    }

    try {
      const session = await pantheonCouncilService.startCouncil(
        selectedGods,
        selectedTopic,
        settings
      );
      setCurrentSession(session);
      setShowGodSelector(false);
      setShowTopicSelector(false);
    } catch (error) {
      console.error('Failed to start council:', error);
      alert('Failed to start council session');
    }
  };

  // Start discussion
  const handleStartDiscussion = async () => {
    if (!currentSession) return;

    try {
      await pantheonCouncilService.startDiscussion();
      setCurrentSession({ ...currentSession, status: 'active' });
    } catch (error) {
      console.error('Failed to start discussion:', error);
      alert('Failed to start discussion');
    }
  };

  // Pause discussion
  const handlePauseDiscussion = () => {
    pantheonCouncilService.pauseCouncil();
    if (currentSession) {
      setCurrentSession({ ...currentSession, status: 'paused' });
    }
  };

  // Resume discussion
  const handleResumeDiscussion = () => {
    pantheonCouncilService.resumeCouncil();
    if (currentSession) {
      setCurrentSession({ ...currentSession, status: 'active' });
    }
  };

  // End council
  const handleEndCouncil = () => {
    pantheonCouncilService.endCouncil();
    if (currentSession) {
      setCurrentSession({ ...currentSession, status: 'concluded' });
    }
  };

  // Get emotion color
  const getEmotionColor = (emotion: CouncilMessage['emotion']) => {
    switch (emotion) {
      case 'angry': return 'text-red-400';
      case 'amused': return 'text-yellow-400';
      case 'curious': return 'text-blue-400';
      case 'dismissive': return 'text-gray-400';
      case 'respectful': return 'text-green-400';
      case 'threatening': return 'text-purple-400';
      default: return 'text-divine-200';
    }
  };

  // Get god avatar
  const getGodAvatar = (godId: string) => {
    const god = GODS.find(g => g.id === godId);
    return god?.avatar || '👤';
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get session duration
  const getSessionDuration = () => {
    if (!currentSession) return '0:00';

    const start = new Date(currentSession.startTime);
    const end = currentSession.endTime ? new Date(currentSession.endTime) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);

    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-divine-500/30 rounded-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-divine-500/30">
          <div className="flex items-center space-x-3">
            <Crown className="text-2xl text-divine-400" />
            <div>
              <h1 className="text-2xl font-bold text-divine-100">Pantheon Council</h1>
              <p className="text-divine-300">
                {currentSession
                  ? `Session: ${currentSession.topic}`
                  : 'Select gods and topic to begin'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* TTS Toggle */}
            <button
              onClick={() => setIsTTSEnabled(!isTTSEnabled)}
              className={`p-2 rounded-lg transition-colors ${isTTSEnabled
                  ? 'bg-divine-600/50 text-divine-100'
                  : 'bg-slate-700 text-slate-400'
                }`}
              title={isTTSEnabled ? 'Disable TTS' : 'Enable TTS'}
            >
              {isTTSEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 transition-colors"
              title="Council Settings"
            >
              <Settings size={20} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Gods and Topics */}
          <div className="w-80 bg-slate-800 border-r border-divine-500/30 flex flex-col">
            {/* Session Status */}
            {currentSession && (
              <div className="p-4 border-b border-divine-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-divine-300">Session Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${currentSession.status === 'active' ? 'bg-green-600/20 text-green-400' :
                      currentSession.status === 'paused' ? 'bg-yellow-600/20 text-yellow-400' :
                        currentSession.status === 'concluded' ? 'bg-red-600/20 text-red-400' :
                          'bg-blue-600/20 text-blue-400'
                    }`}>
                    {currentSession.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-divine-300">
                  <Clock size={14} />
                  <span>{getSessionDuration()}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-divine-300 mt-1">
                  <MessageSquare size={14} />
                  <span>{currentSession.messages.length} messages</span>
                </div>
              </div>
            )}

            {/* God Selection */}
            <div className="p-4 border-b border-divine-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-divine-100">Participants</h3>
                <button
                  onClick={() => setShowGodSelector(!showGodSelector)}
                  className="text-divine-400 hover:text-divine-100 transition-colors"
                >
                  {showGodSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {showGodSelector ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {GODS.map(god => (
                    <button
                      key={god.id}
                      onClick={() => handleGodSelect(god)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${selectedGods.find(g => g.id === god.id)
                          ? 'bg-divine-600/50 text-divine-100'
                          : 'bg-slate-700 hover:bg-slate-600 text-divine-200'
                        }`}
                    >
                      <span className="text-xl">{god.avatar}</span>
                      <div className="text-left">
                        <div className="font-medium">{god.name}</div>
                        <div className="text-xs text-divine-400">{god.domain}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedGods.map(god => (
                    <div
                      key={god.id}
                      className="flex items-center space-x-2 px-2 py-1 bg-divine-600/30 rounded-lg text-sm"
                    >
                      <span>{god.avatar}</span>
                      <span className="text-divine-100">{god.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Topic Selection */}
            <div className="p-4 border-b border-divine-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-divine-100">Discussion Topic</h3>
                <button
                  onClick={() => setShowTopicSelector(!showTopicSelector)}
                  className="text-divine-400 hover:text-divine-100 transition-colors"
                >
                  {showTopicSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {showTopicSelector ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableTopics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${selectedTopic?.id === topic.id
                          ? 'bg-divine-600/50 text-divine-100'
                          : 'bg-slate-700 hover:bg-slate-600 text-divine-200'
                        }`}
                    >
                      <div className="font-medium">{topic.title}</div>
                      <div className="text-xs text-divine-400 mt-1">{topic.description}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${topic.complexity === 'complex' ? 'bg-purple-600/20 text-purple-400' :
                            topic.complexity === 'moderate' ? 'bg-yellow-600/20 text-yellow-400' :
                              'bg-green-600/20 text-green-400'
                          }`}>
                          {topic.complexity}
                        </span>
                        <span className="text-xs text-divine-400">{topic.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                selectedTopic && (
                  <div className="p-3 bg-divine-600/30 rounded-lg">
                    <div className="font-medium text-divine-100">{selectedTopic.title}</div>
                    <div className="text-sm text-divine-400 mt-1">{selectedTopic.description}</div>
                  </div>
                )
              )}
            </div>

            {/* Controls */}
            <div className="p-4 mt-auto">
              {!currentSession ? (
                <button
                  onClick={handleStartCouncil}
                  disabled={selectedGods.length < 2 || !selectedTopic}
                  className="w-full divine-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Crown size={18} className="mr-2" />
                  Convene Council
                </button>
              ) : (
                <div className="space-y-2">
                  {currentSession.status === 'preparing' && (
                    <button
                      onClick={handleStartDiscussion}
                      className="w-full divine-button"
                    >
                      <Play size={18} className="mr-2" />
                      Begin Discussion
                    </button>
                  )}

                  {currentSession.status === 'active' && (
                    <button
                      onClick={handlePauseDiscussion}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      <Pause size={18} className="mr-2" />
                      Pause
                    </button>
                  )}

                  {currentSession.status === 'paused' && (
                    <button
                      onClick={handleResumeDiscussion}
                      className="w-full divine-button"
                    >
                      <Play size={18} className="mr-2" />
                      Resume
                    </button>
                  )}

                  {currentSession.status !== 'concluded' && (
                    <button
                      onClick={handleEndCouncil}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      <Square size={18} className="mr-2" />
                      End Council
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Messages */}
          <div className="flex-1 flex flex-col">
            {/* Messages Header */}
            <div className="p-4 border-b border-divine-500/30 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-divine-100">Council Discussion</h3>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 text-sm text-divine-300">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded"
                  />
                  <span>Auto-scroll</span>
                </label>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {currentSession?.messages.map(message => (
                <div
                  key={message.id}
                  className={`flex space-x-3 ${message.godId === 'system' ? 'justify-center' : ''
                    }`}
                >
                  {message.godId === 'system' ? (
                    <div className="bg-slate-700/50 border border-divine-500/30 rounded-lg px-4 py-2 text-center">
                      <div className="text-divine-300 text-sm">{message.content}</div>
                      <div className="text-divine-500 text-xs mt-1">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                          {getGodAvatar(message.godId)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-divine-100">
                            {message.godName}
                          </span>
                          <span className={`text-sm ${getEmotionColor(message.emotion)}`}>
                            {message.emotion}
                          </span>
                          <span className="text-divine-500 text-xs">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div className="bg-slate-800 border border-divine-500/30 rounded-lg p-3">
                          <p className="text-divine-200 leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-slate-800 border border-divine-500/30 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-divine-100 mb-4">Council Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-divine-300 mb-2">
                    Session Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.sessionDuration || 30}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessionDuration: parseInt(e.target.value)
                    })}
                    className="w-full bg-slate-700 border border-divine-500/30 rounded-lg px-3 py-2 text-divine-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-divine-300 mb-2">
                    Turn Length (seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={settings.turnLength || 15}
                    onChange={(e) => setSettings({
                      ...settings,
                      turnLength: parseInt(e.target.value)
                    })}
                    className="w-full bg-slate-700 border border-divine-500/30 rounded-lg px-3 py-2 text-divine-100"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-divine-300">
                    <input
                      type="checkbox"
                      checked={settings.allowInterruptions ?? true}
                      onChange={(e) => setSettings({
                        ...settings,
                        allowInterruptions: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span>Allow Interruptions</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-divine-300">
                    <input
                      type="checkbox"
                      checked={settings.allowRituals ?? true}
                      onChange={(e) => setSettings({
                        ...settings,
                        allowRituals: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span>Allow Rituals</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-divine-100 py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PantheonCouncil;
