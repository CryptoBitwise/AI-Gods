export interface God {
  id: string;
  name: string;
  domain: string;
  temperament: 'Orderly' | 'Mystical' | 'Radiant' | 'Corrupt' | 'Glitched';
  description: string;
  avatar: string;
  voice: string;
  personality: string;
  rules: string[];
  followers: number;
  divineStanding: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Ritual {
  id: string;
  godId: string;
  type: 'Prayer' | 'Challenge' | 'Offering' | 'Divine Quest';
  title: string;
  description: string;
  completed: boolean;
  reward: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Scripture {
  id: string;
  godId: string;
  title: string;
  content: string;
  type: 'Prayer' | 'Gospel' | 'Prophecy' | 'Commandment';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DivineInteraction {
  id: string;
  godId: string;
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
  ritualType?: Ritual['type'];
}

export interface User {
  id: string;
  username: string;
  divineStanding: Record<string, number>; // godId -> standing
  activeRituals: Ritual[];
  scriptureCollection: Scripture[];
  createdAt: Date;
}
