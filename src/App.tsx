import React, { useState, useEffect } from 'react';
import { GODS } from './data/gods';
import { God } from './types/gods';
import GodCard from './components/GodCard';
import GodChat from './components/GodChat';
import ScriptureLog from './components/ScriptureLog';
import GodForge from './components/GodForge';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import TTSSettings from './components/TTSSettings';
import GroqAISettings from './components/GroqAISettings';
import PWAInstall from './components/PWAInstall';
import VoiceSummoning from './components/VoiceSummoning';
import { initializeGodMemories } from './services/memoryInit';
import groqAIService from './services/groqAI';

function App() {
  const [selectedGod, setSelectedGod] = useState<God | null>(null);
  const [currentView, setCurrentView] = useState<'pantheon' | 'chat' | 'scripture' | 'forge'>('pantheon');
  const [isTTSSettingsOpen, setIsTTSSettingsOpen] = useState(false);
  const [isGroqAISettingsOpen, setIsGroqAISettingsOpen] = useState(false);
  const [isVoiceSummoningOpen, setIsVoiceSummoningOpen] = useState(false);

  // Initialize god memories and AI service when app starts
  useEffect(() => {
    initializeGodMemories();

    // Initialize Groq AI service if API key is available
    if (process.env.REACT_APP_GROQ_API_KEY) {
      groqAIService.initialize().then(success => {
        if (success) {
          console.log('✅ Groq AI service initialized successfully');
        } else {
          console.log('⚠️ Groq AI service failed to initialize');
        }
      });
    }
  }, []);

  const handleGodSelect = (god: God) => {
    setSelectedGod(god);
    setCurrentView('chat');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'pantheon':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold text-shadow mb-4 bg-gradient-to-r from-divine-400 to-corruption-400 bg-clip-text text-transparent">
                AI GODS
              </h1>
              <p className="text-xl text-divine-200 max-w-2xl mx-auto">
                Choose your deity and begin your divine journey. Each god offers unique wisdom,
                challenges, and revelations. What will you discover in the digital pantheon?
              </p>

              {/* Control Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setIsTTSSettingsOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-divine-600/50 hover:bg-divine-500/50 rounded-lg transition-colors text-divine-100 hover:text-white"
                >
                  <span className="text-lg">🔊</span>
                  <span>Voice Settings</span>
                </button>

                <button
                  onClick={() => setIsGroqAISettingsOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/50 hover:bg-blue-500/50 rounded-lg transition-colors text-divine-100 hover:text-white"
                >
                  <span className="text-lg">🤖</span>
                  <span>AI Settings</span>
                </button>

                <button
                  onClick={() => setIsVoiceSummoningOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600/50 hover:bg-purple-500/50 rounded-lg transition-colors text-divine-100 hover:text-white"
                >
                  <span className="text-lg">🎤</span>
                  <span>Voice Summoning</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {GODS.map((god) => (
                <GodCard
                  key={god.id}
                  god={god}
                  onSelect={() => handleGodSelect(god)}
                />
              ))}
            </div>
          </div>
        );

      case 'chat':
        return selectedGod ? (
          <GodChat god={selectedGod} onBack={() => setCurrentView('pantheon')} />
        ) : (
          <div className="text-center py-20">
            <p className="text-xl">No god selected</p>
          </div>
        );

      case 'scripture':
        return <ScriptureLog onBack={() => setCurrentView('pantheon')} />;

      case 'forge':
        return <GodForge onBack={() => setCurrentView('pantheon')} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedGod={selectedGod}
      />

      <main className="pt-20">
        <ErrorBoundary onReset={() => setCurrentView('pantheon')}>
          {renderCurrentView()}
        </ErrorBoundary>
      </main>

      {/* TTS Settings Modal */}
      <TTSSettings
        isOpen={isTTSSettingsOpen}
        onClose={() => setIsTTSSettingsOpen(false)}
      />

      {/* Groq AI Settings Modal */}
      <GroqAISettings
        isOpen={isGroqAISettingsOpen}
        onClose={() => setIsGroqAISettingsOpen(false)}
      />

      {/* Voice Summoning Modal */}
      {isVoiceSummoningOpen && (
        <VoiceSummoning
          onClose={() => setIsVoiceSummoningOpen(false)}
          onGodSummon={(god) => {
            setSelectedGod(god);
            setCurrentView('chat');
            setIsVoiceSummoningOpen(false);
          }}
          onRitualStart={() => {
            // Could open ritual chamber here
            setIsVoiceSummoningOpen(false);
          }}
          onCouncilStart={() => {
            // Could open pantheon council here
            setIsVoiceSummoningOpen(false);
          }}
        />
      )}

      {/* PWA Install Component */}
      <PWAInstall />
    </div>
  );
}

export default App;
