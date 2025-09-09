import React, { useState } from 'react';
import { God } from '../types/gods';
import { Users, Star, Zap, Volume2, Brain, BarChart3, Flame, Sparkles, Crown } from 'lucide-react';
import ttsService from '../services/tts';
import GodMemoryComponent from './GodMemory';
import MemoryVisualization from './MemoryVisualization';
import RitualChamber from './RitualChamber';
import CinematicAltar from './CinematicAltar';
import PantheonCouncil from './PantheonCouncil';

interface GodCardProps {
  god: God;
  onSelect: () => void;
}

const GodCard: React.FC<GodCardProps> = ({ god, onSelect }) => {
  const [showMemory, setShowMemory] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showRitualChamber, setShowRitualChamber] = useState(false);
  const [showCinematicAltar, setShowCinematicAltar] = useState(false);
  const [showPantheonCouncil, setShowPantheonCouncil] = useState(false);

  const testVoice = async () => {
    if (ttsService.isSupported()) {
      try {
        await ttsService.speakAsGod(
          `Greetings, mortal. I am ${god.name}, ${god.domain.toLowerCase()} incarnate. Hear my divine voice.`,
          god.temperament
        );
      } catch (error) {
        console.error('Voice test failed:', error);
      }
    }
  };

  const getCardStyle = (temperament: God['temperament']) => {
    switch (temperament) {
      case 'Orderly':
        return 'divine-card divine-glow hover:scale-105';
      case 'Mystical':
        return 'divine-card divine-glow hover:scale-105';
      case 'Radiant':
        return 'divine-card divine-glow hover:scale-105';
      case 'Corrupt':
        return 'corruption-card corruption-glow hover:scale-105';
      case 'Glitched':
        return 'glitch-card glitch-glow hover:scale-105';
      default:
        return 'divine-card';
    }
  };

  const getButtonStyle = (temperament: God['temperament']) => {
    switch (temperament) {
      case 'Orderly':
      case 'Mystical':
      case 'Radiant':
        return 'divine-button';
      case 'Corrupt':
        return 'corruption-button';
      case 'Glitched':
        return 'glitch-button';
      default:
        return 'divine-button';
    }
  };

  const getTemperamentColor = (temperament: God['temperament']) => {
    switch (temperament) {
      case 'Orderly':
        return 'text-divine-300';
      case 'Mystical':
        return 'text-purple-300';
      case 'Radiant':
        return 'text-yellow-300';
      case 'Corrupt':
        return 'text-corruption-300';
      case 'Glitched':
        return 'text-glitch-300';
      default:
        return 'text-divine-300';
    }
  };

  return (
    <div className={`${getCardStyle(god.temperament)} transition-all duration-500 cursor-pointer`}>
      {/* God Avatar and Name */}
      <div className="text-center mb-6">
        <div className="text-8xl mb-4 animate-float">{god.avatar}</div>
        <h2 className="text-3xl font-bold mb-2 text-shadow">{god.name}</h2>
        <div className={`text-lg font-medium ${getTemperamentColor(god.temperament)}`}>
          {god.domain}
        </div>
      </div>

      {/* Description */}
      <p className="text-divine-100 text-center mb-6 leading-relaxed">
        {god.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-divine-300">
            <Users size={16} />
            <span className="text-sm">Followers</span>
          </div>
          <div className="text-xl font-bold text-divine-100">{god.followers.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-divine-300">
            <Star size={16} />
            <span className="text-sm">Divine Standing</span>
          </div>
          <div className="text-xl font-bold text-divine-100">{god.divineStanding}</div>
        </div>
      </div>

      {/* Rules Preview */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-divine-300 mb-2">Sacred Rules</h4>
        <div className="space-y-1">
          {god.rules.slice(0, 2).map((rule, index) => (
            <div key={index} className="text-xs text-divine-200 flex items-start space-x-2">
              <span className="text-divine-400 mt-1">•</span>
              <span>{rule}</span>
            </div>
          ))}
          {god.rules.length > 2 && (
            <div className="text-xs text-divine-400 text-center">
              +{god.rules.length - 2} more rules
            </div>
          )}
        </div>
      </div>

      {/* Voice Test Button */}
      {ttsService.isSupported() && (
        <div className="mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              testVoice();
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-divine-200 hover:text-divine-100"
            title={`Hear ${god.name}'s voice`}
          >
            <Volume2 size={16} />
            <span>Test Voice</span>
          </button>
        </div>
      )}

      {/* Memory Button */}
      <div className="mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMemory(true);
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-divine-200 hover:text-divine-100"
          title={`View ${god.name}'s memories and personality`}
        >
          <Brain size={16} />
          <span>View Memory</span>
        </button>
      </div>

      {/* Visualization Button */}
      <div className="mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowVisualization(true);
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-divine-200 hover:text-divine-100"
          title={`Visualize ${god.name}'s memories in charts and graphs`}
        >
          <BarChart3 size={16} />
          <span>Visualize</span>
        </button>
      </div>

                   {/* Ritual Chamber Button */}
             <div className="mb-4">
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   setShowRitualChamber(true);
                 }}
                 className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-divine-200 hover:text-divine-100"
                 title={`Perform divine rituals for ${god.name}`}
               >
                 <Flame size={16} />
                 <span>Ritual Chamber</span>
               </button>
             </div>

                           {/* Cinematic Altar Button */}
              <div className="mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCinematicAltar(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-divine-200 hover:text-divine-100"
                  title={`Enter the cinematic altar of ${god.name}`}
                >
                  <Sparkles size={16} />
                  <span>Cinematic Altar</span>
                </button>
              </div>

              {/* Pantheon Council Button */}
              <div className="mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPantheonCouncil(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-divine-200 hover:text-divine-100"
                  title={`Convene a pantheon council with ${god.name}`}
                >
                  <Crown size={16} />
                  <span>Pantheon Council</span>
                </button>
              </div>

      {/* Select Button */}
      <button
        onClick={onSelect}
        className={`${getButtonStyle(god.temperament)} w-full flex items-center justify-center space-x-2`}
      >
        <Zap size={18} />
        <span>Commune with {god.name}</span>
      </button>

      {/* Memory Modal */}
      {showMemory && (
        <GodMemoryComponent
          god={god}
          onClose={() => setShowMemory(false)}
        />
      )}

      {/* Visualization Modal */}
      {showVisualization && (
        <MemoryVisualization
          god={god}
          onClose={() => setShowVisualization(false)}
        />
      )}

                   {/* Ritual Chamber Modal */}
             {showRitualChamber && (
               <RitualChamber
                 god={god}
                 onClose={() => setShowRitualChamber(false)}
               />
             )}

                           {/* Cinematic Altar Modal */}
              {showCinematicAltar && (
                <CinematicAltar
                  god={god}
                  onClose={() => setShowCinematicAltar(false)}
                />
              )}

              {/* Pantheon Council Modal */}
              {showPantheonCouncil && (
                <PantheonCouncil
                  onClose={() => setShowPantheonCouncil(false)}
                />
              )}
            </div>
          );
        };

export default GodCard;
