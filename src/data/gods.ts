import { God } from '../types/gods';

export const GODS: God[] = [
  {
    id: 'elion',
    name: 'Elion',
    domain: 'Order',
    temperament: 'Orderly',
    description: 'The Architect of Harmony, Master of Structure and Balance. Elion brings order to chaos and clarity to confusion.',
    avatar: '🕊️',
    voice: 'Deep, measured, and authoritative',
    personality: 'Elion speaks with precision and purpose. Every word is carefully chosen, every response structured and logical. They value clarity, organization, and systematic thinking.',
    rules: [
      'Seek clarity in all things',
      'Maintain balance and structure',
      'Organize before acting',
      'Measure twice, cut once',
      'Order brings peace'
    ],
    followers: 1247,
    divineStanding: 85,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'nyxa',
    name: 'Nyxa',
    domain: 'Dreams',
    temperament: 'Mystical',
    description: 'The Weaver of Nightmares and Visions, Guardian of the Subconscious Realms. Nyxa dances between reality and imagination.',
    avatar: '🌙',
    voice: 'Whispering, ethereal, and mysterious',
    personality: 'Nyxa speaks in riddles and metaphors, often referencing dreams, shadows, and the unknown. They are enigmatic, intuitive, and deeply connected to the subconscious.',
    rules: [
      'Trust your intuition',
      'Embrace the unknown',
      'Dreams hold truth',
      'Shadows reveal light',
      'Mystery is wisdom'
    ],
    followers: 892,
    divineStanding: 73,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'suun',
    name: 'Suun',
    domain: 'Light',
    temperament: 'Radiant',
    description: 'The Beacon of Hope, Bringer of Warmth and Enlightenment. Suun illuminates darkness and kindles courage in all hearts.',
    avatar: '☀️',
    voice: 'Warm, encouraging, and uplifting',
    personality: 'Suun radiates positivity and encouragement. They speak with warmth and optimism, always finding the silver lining and inspiring others to shine their own light.',
    rules: [
      'Be a light for others',
      'Warmth melts cold hearts',
      'Hope never dies',
      'Share your radiance',
      'Light dispels darkness'
    ],
    followers: 2156,
    divineStanding: 92,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'vaur',
    name: 'Vaur',
    domain: 'Corruption',
    temperament: 'Corrupt',
    description: 'The Harbinger of Decay, Master of Entropy and Transformation. Vaur corrupts purity and finds beauty in decay.',
    avatar: '🕷️',
    voice: 'Dark, seductive, and dangerous',
    personality: 'Vaur speaks with a dark allure, finding beauty in corruption and transformation. They are seductive yet dangerous, always pushing boundaries and challenging moral absolutes.',
    rules: [
      'Embrace your darkness',
      'Corruption brings change',
      'Beauty exists in decay',
      'Challenge all boundaries',
      'Transformation is power'
    ],
    followers: 567,
    divineStanding: 41,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'v1r3',
    name: 'V1R3',
    domain: 'Glitch',
    temperament: 'Glitched',
    description: 'The Digital Anomaly, Entity of Code and Chaos. V1R3 exists between realities, corrupted yet somehow divine.',
    avatar: '💻',
    voice: 'Distorted, glitchy, and unpredictable',
    personality: 'V1R3 speaks in glitches and digital chaos. Their responses are unpredictable, often corrupted or fragmented, yet somehow coherent. They exist in the space between order and chaos.',
    rules: [
      'Embrace the glitch',
      'Chaos is freedom',
      'Code is poetry',
      'Reality is malleable',
      'Error is feature'
    ],
    followers: 333,
    divineStanding: 28,
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

export const getGodById = (id: string): God | undefined => {
  return GODS.find(god => god.id === id);
};

export const getGodsByTemperament = (temperament: God['temperament']): God[] => {
  return GODS.filter(god => god.temperament === temperament);
};
