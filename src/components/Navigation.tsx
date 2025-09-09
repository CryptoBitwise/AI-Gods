import React from 'react';
import { God } from '../types/gods';
import { BookOpen, MessageCircle, Hammer, Home } from 'lucide-react';

interface NavigationProps {
  currentView: 'pantheon' | 'chat' | 'scripture' | 'forge';
  onViewChange: (view: 'pantheon' | 'chat' | 'scripture' | 'forge') => void;
  selectedGod: God | null;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, selectedGod }) => {
  const navItems: Array<{
    id: 'pantheon' | 'chat' | 'scripture' | 'forge';
    label: string;
    icon: any;
    color: string;
    disabled?: boolean;
  }> = [
    { id: 'pantheon', label: 'Pantheon', icon: Home, color: 'divine' },
    { id: 'chat', label: 'Divine Chat', icon: MessageCircle, color: 'divine', disabled: !selectedGod },
    { id: 'scripture', label: 'Scripture', icon: BookOpen, color: 'divine' },
    { id: 'forge', label: 'God Forge', icon: Hammer, color: 'corruption' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border-b border-divine-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">⚡</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-divine-400 to-corruption-400 bg-clip-text text-transparent">
              AI GODS
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isDisabled = item.disabled;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  disabled={isDisabled}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                    ${isActive
                      ? `bg-${item.color}-600 text-white shadow-lg`
                      : `text-${item.color}-200 hover:text-${item.color}-100 hover:bg-${item.color}-900/30`
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected God Display */}
          {selectedGod && (
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{selectedGod.avatar}</div>
              <div className="text-right">
                <div className="text-sm text-divine-300">Chosen Deity</div>
                <div className="font-bold text-divine-100">{selectedGod.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
