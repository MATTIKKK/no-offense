export type RelationshipType = 'partner' | 'spouse' | 'friend' | 'family';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  name?: string;
  message?: string;
}

export type User = {
  id: string;
  name: string;
  avatar?: string;
};

export type SharedConnection = {
  id: string;
  type: RelationshipType;
  users: User[];
  createdAt: Date;
};

export type MessageStatus = 'sent' | 'delivered' | 'read';

export type ConflictStatus = 'none' | 'active' | 'resolved' | 'paused';

export type Message = {
  id: string;
  senderId: string;
  content: string;
  originalContent?: string; // If AI modified
  timestamp: Date;
  status: MessageStatus;
  isAIModified: boolean;
};

export type Conversation = {
  id: string;
  connectionId: string;
  participants: User[];
  messages: Message[];
  conflictStatus: ConflictStatus;
  conflictTopic?: string;
  lastMessageAt: Date;
};

export type Conflict = {
  id: string;
  connectionId: string;
  conversationId: string;
  startedAt: Date;
  resolvedAt?: Date;
  topic?: string;
  tags: string[];
  isRecurring: boolean;
};

export type TherapistSpecialty = 'relationships' | 'communication' | 'conflict' | 'family' | 'general';

export type Therapist = {
  id: string;
  name: string;
  avatar: string;
  city: string;
  specialties: TherapistSpecialty[];
  education: string;
  experience: string;
  rating: number;
};

export type ReconciliationItem = {
  id: string;
  type: 'flowers' | 'card' | 'gift' | 'certificate';
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string; // e.g., "10 min"
  progress: number; // 0-100
};


export type CustomRecorder = {
  stop: () => void;
};