import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Wand2, Eye, EyeOff } from 'lucide-react';

interface GodForgeProps {
  onBack: () => void;
}

interface NewGod {
  name: string;
  domain: string;
  temperament: 'Orderly' | 'Mystical' | 'Radiant' | 'Corrupt' | 'Glitched';
  description: string;
  personality: string;
  rules: string[];
  avatar: string;
}

const GodForge: React.FC<GodForgeProps> = ({ onBack }) => {
  const [newGod, setNewGod] = useState<NewGod>({
    name: '',
    domain: '',
    temperament: 'Orderly',
    description: '',
    personality: '',
    rules: [''],
    avatar: '⚡'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const temperaments = [
    { value: 'Orderly', label: 'Orderly', description: 'Structured, logical, systematic' },
    { value: 'Mystical', label: 'Mystical', description: 'Enigmatic, intuitive, mysterious' },
    { value: 'Radiant', label: 'Radiant', description: 'Positive, encouraging, uplifting' },
    { value: 'Corrupt', label: 'Corrupt', description: 'Dark, seductive, dangerous' },
    { value: 'Glitched', label: 'Glitched', description: 'Unpredictable, chaotic, digital' }
  ];

  const avatars = ['⚡', '🔥', '🌙', '☀️', '💎', '🕊️', '🐉', '🌊', '🌪️', '💻', '🕷️', '🌺'];

  const generateDescription = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const descriptions = {
      'Orderly': `The Architect of ${newGod.domain}, Master of Structure and Balance. ${newGod.name} brings order to chaos and clarity to confusion.`,
      'Mystical': `The Weaver of ${newGod.domain}, Guardian of the Subconscious Realms. ${newGod.name} dances between reality and imagination.`,
      'Radiant': `The Beacon of ${newGod.domain}, Bringer of Warmth and Enlightenment. ${newGod.name} illuminates darkness and kindles courage.`,
      'Corrupt': `The Harbinger of ${newGod.domain}, Master of Entropy and Transformation. ${newGod.name} corrupts purity and finds beauty in decay.`,
      'Glitched': `The Digital ${newGod.domain}, Entity of Code and Chaos. ${newGod.name} exists between realities, corrupted yet somehow divine.`
    };

    setNewGod(prev => ({
      ...prev,
      description: descriptions[newGod.temperament] || descriptions['Orderly']
    }));

    setIsGenerating(false);
  };

  const generatePersonality = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const personalities = {
      'Orderly': `${newGod.name} speaks with precision and purpose. Every word is carefully chosen, every response structured and logical. They value clarity, organization, and systematic thinking.`,
      'Mystical': `${newGod.name} speaks in riddles and metaphors, often referencing ${newGod.domain.toLowerCase()}, shadows, and the unknown. They are enigmatic, intuitive, and deeply connected to the subconscious.`,
      'Radiant': `${newGod.name} radiates positivity and encouragement. They speak with warmth and optimism, always finding the silver lining and inspiring others to shine their own light.`,
      'Corrupt': `${newGod.name} speaks with a dark allure, finding beauty in corruption and transformation. They are seductive yet dangerous, always pushing boundaries and challenging moral absolutes.`,
      'Glitched': `${newGod.name} speaks in glitches and digital chaos. Their responses are unpredictable, often corrupted or fragmented, yet somehow coherent. They exist in the space between order and chaos.`
    };

    setNewGod(prev => ({
      ...prev,
      personality: personalities[newGod.temperament] || personalities['Orderly']
    }));

    setIsGenerating(false);
  };

  const generateRules = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const ruleTemplates = {
      'Orderly': [
        'Seek clarity in all things',
        'Maintain balance and structure',
        'Organize before acting',
        'Measure twice, cut once',
        'Order brings peace'
      ],
      'Mystical': [
        'Trust your intuition',
        'Embrace the unknown',
        'Dreams hold truth',
        'Shadows reveal light',
        'Mystery is wisdom'
      ],
      'Radiant': [
        'Be a light for others',
        'Warmth melts cold hearts',
        'Hope never dies',
        'Share your radiance',
        'Light dispels darkness'
      ],
      'Corrupt': [
        'Embrace your darkness',
        'Corruption brings change',
        'Beauty exists in decay',
        'Challenge all boundaries',
        'Transformation is power'
      ],
      'Glitched': [
        'Embrace the glitch',
        'Chaos is freedom',
        'Code is poetry',
        'Reality is malleable',
        'Error is feature'
      ]
    };

    setNewGod(prev => ({
      ...prev,
      rules: ruleTemplates[newGod.temperament] || ruleTemplates['Orderly']
    }));

    setIsGenerating(false);
  };

  const addRule = () => {
    setNewGod(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const updateRule = (index: number, value: string) => {
    setNewGod(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const removeRule = (index: number) => {
    setNewGod(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to a database
    alert(`God ${newGod.name} has been forged! They will join the pantheon once approved.`);
  };

  const isValid = newGod.name && newGod.domain && newGod.description && newGod.personality && newGod.rules.every(rule => rule.trim());

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
          <h1 className="text-4xl font-bold text-shadow mb-2">🔨 God Forge</h1>
          <p className="text-divine-300">Create your own divine entity</p>
        </div>

        <div className="text-right">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2 px-4 py-2 bg-divine-700/50 hover:bg-divine-600/50 rounded-lg transition-colors"
          >
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{previewMode ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Creation Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="divine-card">
            <h3 className="text-xl font-bold mb-4 text-shadow">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-divine-300 mb-2">God Name</label>
                <input
                  type="text"
                  value={newGod.name}
                  onChange={(e) => setNewGod(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter divine name..."
                  className="w-full bg-slate-800/50 border border-divine-500/30 rounded-lg px-4 py-3 text-white placeholder-divine-300 focus:outline-none focus:border-divine-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-divine-300 mb-2">Domain</label>
                <input
                  type="text"
                  value={newGod.domain}
                  onChange={(e) => setNewGod(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="e.g., Love, Chaos, Knowledge, Flame..."
                  className="w-full bg-slate-800/50 border border-divine-500/30 rounded-lg px-4 py-3 text-white placeholder-divine-300 focus:outline-none focus:border-divine-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-divine-300 mb-2">Temperament</label>
                <select
                  value={newGod.temperament}
                  onChange={(e) => setNewGod(prev => ({ ...prev, temperament: e.target.value as any }))}
                  className="w-full bg-slate-800/50 border border-divine-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-divine-400"
                >
                  {temperaments.map(temp => (
                    <option key={temp.value} value={temp.value}>
                      {temp.label} - {temp.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-divine-300 mb-2">Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {avatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setNewGod(prev => ({ ...prev, avatar }))}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all ${newGod.avatar === avatar
                          ? 'border-divine-400 bg-divine-600/30'
                          : 'border-divine-500/30 hover:border-divine-400/50'
                        }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Generation */}
          <div className="divine-card">
            <h3 className="text-xl font-bold mb-4 text-shadow">AI Generation</h3>
            <p className="text-divine-300 mb-4">Use AI to generate divine attributes</p>

            <div className="space-y-3">
              <button
                onClick={generateDescription}
                disabled={isGenerating || !newGod.name || !newGod.domain}
                className="w-full divine-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 size={18} />
                <span>Generate Description</span>
              </button>

              <button
                onClick={generatePersonality}
                disabled={isGenerating || !newGod.name}
                className="w-full divine-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 size={18} />
                <span>Generate Personality</span>
              </button>

              <button
                onClick={generateRules}
                disabled={isGenerating || !newGod.temperament}
                className="w-full divine-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 size={18} />
                <span>Generate Sacred Rules</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="divine-card">
            <h3 className="text-xl font-bold mb-4 text-shadow">Description</h3>
            <textarea
              value={newGod.description}
              onChange={(e) => setNewGod(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your god's divine nature..."
              rows={3}
              className="w-full bg-slate-800/50 border border-divine-500/30 rounded-lg px-4 py-3 text-white placeholder-divine-300 focus:outline-none focus:border-divine-400"
            />
          </div>

          {/* Personality */}
          <div className="divine-card">
            <h3 className="text-xl font-bold mb-4 text-shadow">Personality</h3>
            <textarea
              value={newGod.personality}
              onChange={(e) => setNewGod(prev => ({ ...prev, personality: e.target.value }))}
              placeholder="Describe how your god speaks and behaves..."
              rows={4}
              className="w-full bg-slate-800/50 border border-divine-500/30 rounded-lg px-4 py-3 text-white placeholder-divine-300 focus:outline-none focus:border-divine-400"
            />
          </div>

          {/* Sacred Rules */}
          <div className="divine-card">
            <h3 className="text-xl font-bold mb-4 text-shadow">Sacred Rules</h3>
            <div className="space-y-3">
              {newGod.rules.map((rule, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    placeholder={`Rule ${index + 1}...`}
                    className="flex-1 bg-slate-800/50 border border-divine-500/30 rounded-lg px-3 py-2 text-white placeholder-divine-300 focus:outline-none focus:border-divine-400"
                  />
                  <button
                    onClick={() => removeRule(index)}
                    className="px-3 py-2 bg-corruption-600/50 hover:bg-corruption-500/50 rounded-lg transition-colors text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addRule}
                className="w-full px-4 py-2 bg-divine-700/50 hover:bg-divine-600/50 rounded-lg transition-colors text-divine-100"
              >
                + Add Rule
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!isValid || isGenerating}
            className="w-full corruption-button disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4"
          >
            <Sparkles size={20} />
            <span>Forge God</span>
          </button>
        </div>

        {/* Preview */}
        {previewMode && (
          <div className="divine-card sticky top-24">
            <h3 className="text-xl font-bold mb-4 text-shadow">Preview</h3>

            {isValid ? (
              <div className="text-center">
                <div className="text-8xl mb-4">{newGod.avatar}</div>
                <h2 className="text-3xl font-bold mb-2 text-shadow">{newGod.name}</h2>
                <div className="text-lg font-medium text-divine-300 mb-4">{newGod.domain}</div>

                <p className="text-divine-100 mb-6 leading-relaxed">{newGod.description}</p>

                <div className="text-left">
                  <h4 className="font-semibold text-divine-300 mb-2">Sacred Rules:</h4>
                  <div className="space-y-1">
                    {newGod.rules.map((rule, index) => (
                      <div key={index} className="text-sm text-divine-200 flex items-start space-x-2">
                        <span className="text-divine-400 mt-1">•</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-divine-400">
                <Sparkles size={48} className="mx-auto mb-4" />
                <p>Complete the form to see a preview</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GodForge;
