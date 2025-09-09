import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX,
  Settings,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Key
} from 'lucide-react';
import { God } from '../types/gods';
import ttsService from '../services/tts';

interface CinematicAltarProps {
  god: God;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'divine' | 'corruption' | 'glitch' | 'mystical';
}

const CinematicAltar: React.FC<CinematicAltarProps> = ({ god, onClose }) => {
  const [isAltarActive, setIsAltarActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showControls, setShowControls] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [currentRitual, setCurrentRitual] = useState<string>('');
  const [ritualProgress, setRitualProgress] = useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particleIdRef = useRef(0);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          toggleAltar();
          break;
        case 'Escape':
          onClose();
          break;
        case 'h':
        case 'H':
          setShowControls(prev => !prev);
          break;
        case 'k':
        case 'K':
          setShowKeyboardShortcuts(prev => !prev);
          break;
        case 't':
        case 'T':
          setIsTTSEnabled(prev => !prev);
          break;
        case 'ArrowUp':
          e.preventDefault();
          performRitual('ascension');
          break;
        case 'ArrowDown':
          e.preventDefault();
          performRitual('descent');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          performRitual('purification');
          break;
        case 'ArrowRight':
          e.preventDefault();
          performRitual('corruption');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  // Particle system
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      setParticles(prevParticles => {
        const updatedParticles = prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            size: particle.size * 0.99
          }))
          .filter(particle => particle.life > 0 && particle.size > 0.1);

        // Draw particles
        updatedParticles.forEach(particle => {
          ctx.globalAlpha = particle.life / particle.maxLife;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });

        return updatedParticles;
      });

      // Generate new particles
      if (isAltarActive) {
        generateParticles();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAltarActive]);

  // Generate particles based on god temperament
  const generateParticles = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const newParticles: Particle[] = [];

    for (let i = 0; i < 3; i++) {
      const particle: Particle = {
        id: particleIdRef.current++,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * 100 + 50,
        maxLife: 150,
        size: Math.random() * 3 + 1,
        type: getParticleType(god.temperament),
        color: getParticleColor(god.temperament)
      };
      newParticles.push(particle);
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, [god.temperament]);

  const getParticleType = (temperament: God['temperament']): Particle['type'] => {
    switch (temperament) {
      case 'Orderly': return 'divine';
      case 'Mystical': return 'mystical';
      case 'Radiant': return 'divine';
      case 'Corrupt': return 'corruption';
      case 'Glitched': return 'glitch';
      default: return 'divine';
    }
  };

  const getParticleColor = (temperament: God['temperament']): string => {
    switch (temperament) {
      case 'Orderly': return '#60a5fa'; // Blue
      case 'Mystical': return '#a78bfa'; // Purple
      case 'Radiant': return '#fbbf24'; // Yellow
      case 'Corrupt': return '#ef4444'; // Red
      case 'Glitched': return '#10b981'; // Green
      default: return '#60a5fa';
    }
  };

  const toggleAltar = () => {
    setIsAltarActive(prev => !prev);
    if (isAltarActive) {
      setCurrentRitual('');
      setRitualProgress(0);
    } else {
      setCurrentRitual('Altar Activated');
      speakAltarActivation();
    }
  };

  const performRitual = (ritualType: string) => {
    if (!isAltarActive) return;

    setCurrentRitual(`${ritualType.charAt(0).toUpperCase() + ritualType.slice(1)} Ritual`);
    setRitualProgress(0);

    // Simulate ritual progress
    const interval = setInterval(() => {
      setRitualProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCurrentRitual('Ritual Complete');
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    speakRitual(ritualType);
  };

  const speakAltarActivation = async () => {
    if (!isTTSEnabled) return;
    
    try {
      await ttsService.speakAsGod(
        `The altar of ${god.name} is now active. The divine energies flow freely.`,
        god.temperament
      );
    } catch (error) {
      console.error('TTS failed:', error);
    }
  };

  const speakRitual = async (ritualType: string) => {
    if (!isTTSEnabled) return;
    
    try {
      await ttsService.speakAsGod(
        `The ${ritualType} ritual begins. Feel the power of ${god.name} flow through you.`,
        god.temperament
      );
    } catch (error) {
      console.error('TTS failed:', error);
    }
  };

  const getAltarStyle = () => {
    if (!isAltarActive) return 'opacity-50';
    
    switch (god.temperament) {
      case 'Orderly': return 'divine-glow';
      case 'Mystical': return 'mystical-glow';
      case 'Radiant': return 'radiant-glow';
      case 'Corrupt': return 'corruption-glow';
      case 'Glitched': return 'glitch-glow';
      default: return 'divine-glow';
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* Main Altar */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* God Avatar */}
        <div className={`text-center mb-8 transition-all duration-1000 ${getAltarStyle()}`}>
          <div className={`text-9xl mb-6 animate-float ${isAltarActive ? 'animate-pulse' : ''}`}>
            {god.avatar}
          </div>
          <h1 className={`text-5xl font-bold mb-4 text-shadow ${isAltarActive ? 'animate-pulse' : ''}`}>
            {god.name}
          </h1>
          <div className="text-2xl text-divine-300 font-medium">
            {god.domain}
          </div>
        </div>

        {/* Altar Circle */}
        <div className={`relative w-96 h-96 rounded-full border-4 transition-all duration-1000 ${
          isAltarActive 
            ? 'border-divine-400 shadow-2xl shadow-divine-400/50 animate-pulse' 
            : 'border-slate-600'
        }`}>
          {/* Inner Circle */}
          <div className={`absolute inset-8 rounded-full border-2 transition-all duration-1000 ${
            isAltarActive 
              ? 'border-corruption-400 shadow-lg shadow-corruption-400/50' 
              : 'border-slate-500'
          }`}>
            {/* Center Altar */}
            <div className={`absolute inset-16 rounded-full flex items-center justify-center transition-all duration-1000 ${
              isAltarActive 
                ? 'bg-gradient-to-br from-divine-600/30 to-corruption-600/30 shadow-inner' 
                : 'bg-slate-700/30'
            }`}>
              <div className="text-6xl">🔮</div>
            </div>
          </div>

          {/* Ritual Progress Ring */}
          {isAltarActive && ritualProgress > 0 && (
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 0.45}`}
                strokeDashoffset={`${2 * Math.PI * 0.45 * (1 - ritualProgress / 100)}`}
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        {/* Current Ritual Display */}
        {currentRitual && (
          <div className="mt-8 text-center">
            <div className="text-2xl font-bold text-divine-100 mb-2">
              {currentRitual}
            </div>
            {ritualProgress > 0 && ritualProgress < 100 && (
              <div className="text-lg text-divine-300">
                Progress: {ritualProgress}%
              </div>
            )}
          </div>
        )}

        {/* Altar Controls */}
        <div className="mt-12 flex space-x-6">
          <button
            onClick={toggleAltar}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
              isAltarActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-divine-600 hover:bg-divine-700 text-white'
            }`}
          >
            {isAltarActive ? 'Deactivate Altar' : 'Activate Altar'}
          </button>
          
          <button
            onClick={() => setShowControls(prev => !prev)}
            className="px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 transition-colors"
          >
            <Settings size={20} className="inline mr-2" />
            Controls
          </button>
        </div>

        {/* Status Bar */}
        <div className="fixed bottom-4 left-4 right-4 flex justify-between items-center text-sm text-divine-300">
          <div className="flex items-center space-x-4">
            <span>Altar: {isAltarActive ? 'ACTIVE' : 'INACTIVE'}</span>
            <span>TTS: {isTTSEnabled ? 'ON' : 'OFF'}</span>
            <span>Particles: {particles.length}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Press H for controls</span>
            <span>Press K for shortcuts</span>
            <span>Press SPACE to toggle altar</span>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div className="fixed top-4 right-4 bg-slate-800 border border-divine-500/30 rounded-lg p-6 max-w-sm z-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-divine-100">Altar Controls</h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-divine-300 hover:text-divine-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-divine-200">
                <input
                  type="checkbox"
                  checked={isTTSEnabled}
                  onChange={(e) => setIsTTSEnabled(e.target.checked)}
                  className="rounded"
                />
                <span>Enable TTS</span>
                {isTTSEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </label>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-divine-300 mb-2">Quick Rituals</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => performRitual('ascension')}
                  disabled={!isAltarActive}
                  className="px-3 py-2 bg-divine-600 hover:bg-divine-700 disabled:bg-slate-600 rounded text-sm text-white transition-colors"
                >
                  ↑ Ascension
                </button>
                <button
                  onClick={() => performRitual('descent')}
                  disabled={!isAltarActive}
                  className="px-3 py-2 bg-corruption-600 hover:bg-corruption-700 disabled:bg-slate-600 rounded text-sm text-white transition-colors"
                >
                  ↓ Descent
                </button>
                <button
                  onClick={() => performRitual('purification')}
                  disabled={!isAltarActive}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 rounded text-sm text-white transition-colors"
                >
                  ← Purify
                </button>
                <button
                  onClick={() => performRitual('corruption')}
                  disabled={!isAltarActive}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 rounded text-sm text-white transition-colors"
                >
                  → Corrupt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {showKeyboardShortcuts && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-divine-500/30 rounded-lg p-6 max-w-md z-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-divine-100">Keyboard Shortcuts</h3>
            <button
              onClick={() => setShowKeyboardShortcuts(false)}
              className="text-divine-300 hover:text-divine-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-divine-200">Toggle Altar</span>
              <div className="flex items-center space-x-1">
                <Key size={14} className="text-divine-400" />
                <span className="text-divine-300">SPACE</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-divine-200">Ascension Ritual</span>
              <div className="flex items-center space-x-1">
                <ArrowUp size={14} className="text-divine-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-divine-200">Descent Ritual</span>
              <div className="flex items-center space-x-1">
                <ArrowDown size={14} className="text-divine-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-divine-200">Purification</span>
              <div className="flex items-center space-x-1">
                <ArrowLeft size={14} className="text-divine-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-divine-200">Corruption</span>
              <div className="flex items-center space-x-1">
                <ArrowRight size={14} className="text-divine-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-divine-200">Toggle TTS</span>
              <div className="flex items-center space-x-1">
                <Key size={14} className="text-divine-400" />
                <span className="text-divine-300">T</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-divine-200">Show Controls</span>
              <div className="flex items-center space-x-1">
                <Key size={14} className="text-divine-400" />
                <span className="text-divine-300">H</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-divine-200">Show Shortcuts</span>
              <div className="flex items-center space-x-1">
                <Key size={14} className="text-divine-400" />
                <span className="text-divine-300">K</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-divine-200">Close Altar</span>
              <div className="flex items-center space-x-1">
                <Key size={14} className="text-divine-400" />
                <span className="text-divine-300">ESC</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-20 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-divine-100 transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default CinematicAltar;
