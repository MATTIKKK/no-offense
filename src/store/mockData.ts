import { User, SharedConnection, Conversation, Message, ConflictStatus, 
  Conflict, Therapist, ReconciliationItem, Course } from '../types';

// Mock Users
export const mockUsers: User[] = [
  { id: 'user1', name: 'Alex', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
  { id: 'user2', name: 'Jordan', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
  { id: 'user3', name: 'Taylor', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
  { id: 'user4', name: 'Morgan', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' },
];

// Mock Connections
export const mockConnections: SharedConnection[] = [
  {
    id: 'conn1',
    type: 'partner',
    users: [mockUsers[0], mockUsers[1]],
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'conn2',
    type: 'friend',
    users: [mockUsers[0], mockUsers[2]],
    createdAt: new Date('2023-02-20')
  }
];

// Mock Messages
const createMockMessages = (conversationId: string, participants: User[]): Message[] => {
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  const thirtyMinutesAgo = new Date();
  thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
  
  const tenMinutesAgo = new Date();
  tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
  
  return [
    {
      id: `${conversationId}-msg1`,
      senderId: participants[0].id,
      content: 'Hey, how are you doing today?',
      timestamp: twoHoursAgo,
      status: 'read',
      isAIModified: false
    },
    {
      id: `${conversationId}-msg2`,
      senderId: participants[1].id,
      content: 'I\'m good, thanks! How about you?',
      timestamp: oneHourAgo,
      status: 'read',
      isAIModified: false
    },
    {
      id: `${conversationId}-msg3`,
      senderId: participants[0].id,
      content: 'I\'m a bit frustrated about the plans for this weekend.',
      timestamp: thirtyMinutesAgo,
      status: 'read',
      isAIModified: false
    },
    {
      id: `${conversationId}-msg4`,
      senderId: participants[1].id,
      content: 'I understand your frustration about the weekend plans.',
      originalContent: 'I don\'t care about your stupid weekend plans!',
      timestamp: tenMinutesAgo,
      status: 'read',
      isAIModified: true
    }
  ];
};

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    connectionId: 'conn1',
    participants: [mockUsers[0], mockUsers[1]],
    messages: createMockMessages('conv1', [mockUsers[0], mockUsers[1]]),
    conflictStatus: 'active',
    conflictTopic: 'weekend plans',
    lastMessageAt: new Date()
  },
  {
    id: 'conv2',
    connectionId: 'conn2',
    participants: [mockUsers[0], mockUsers[2]],
    messages: createMockMessages('conv2', [mockUsers[0], mockUsers[2]]),
    conflictStatus: 'none',
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  }
];

// Mock Conflicts
export const mockConflicts: Conflict[] = [
  {
    id: 'conflict1',
    connectionId: 'conn1',
    conversationId: 'conv1',
    startedAt: new Date(Date.now() - 30 * 60 * 1000),
    topic: 'weekend plans',
    tags: ['communication', 'planning'],
    isRecurring: true
  },
  {
    id: 'conflict2',
    connectionId: 'conn1',
    conversationId: 'conv1',
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    topic: 'finances',
    tags: ['money', 'priorities'],
    isRecurring: false
  }
];

// Mock Therapists
export const mockTherapists: Therapist[] = [
  {
    id: 'therapist1',
    name: 'Dr. Jamie Williams',
    avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg',
    city: 'New York',
    specialties: ['relationships', 'communication'],
    education: 'PhD in Psychology, Columbia University',
    experience: '12 years of relationship counseling',
    rating: 4.8
  },
  {
    id: 'therapist2',
    name: 'Dr. Sam Johnson',
    avatar: 'https://images.pexels.com/photos/5225463/pexels-photo-5225463.jpeg',
    city: 'Chicago',
    specialties: ['conflict', 'family'],
    education: 'PsyD in Clinical Psychology, University of Chicago',
    experience: '8 years specializing in conflict resolution',
    rating: 4.6
  },
  {
    id: 'therapist3',
    name: 'Dr. Riley Chen',
    avatar: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg',
    city: 'Los Angeles',
    specialties: ['communication', 'general'],
    education: 'PhD in Counseling Psychology, UCLA',
    experience: '15 years of practice',
    rating: 4.9
  }
];

// Mock Reconciliation Items
export const mockReconciliationItems: ReconciliationItem[] = [
  {
    id: 'item1',
    type: 'flowers',
    name: 'Peaceful Blooms Bouquet',
    description: 'A calming arrangement of white lilies and blue hydrangeas',
    price: 45.99,
    imageUrl: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg'
  },
  {
    id: 'item2',
    type: 'card',
    name: 'Heartfelt Apology Card',
    description: 'Express your feelings with this beautiful hand-designed card',
    price: 5.99,
    imageUrl: 'https://images.pexels.com/photos/1248583/pexels-photo-1248583.jpeg'
  },
  {
    id: 'item3',
    type: 'gift',
    name: 'Relaxation Gift Set',
    description: 'A perfect way to say "let\'s take a calm moment together"',
    price: 39.99,
    imageUrl: 'https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg'
  },
  {
    id: 'item4',
    type: 'certificate',
    name: 'Dinner for Two Certificate',
    description: 'Treat them to a special evening at a restaurant of their choice',
    price: 75.00,
    imageUrl: 'https://images.pexels.com/photos/1581554/pexels-photo-1581554.jpeg'
  }
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'course1',
    title: 'Effective Communication During Conflicts',
    description: 'Learn techniques to maintain healthy communication even when emotions run high',
    imageUrl: 'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg',
    duration: '25 min',
    progress: 0
  },
  {
    id: 'course2',
    title: 'Active Listening Skills',
    description: 'Discover how to truly hear your partner beyond just their words',
    imageUrl: 'https://images.pexels.com/photos/7176305/pexels-photo-7176305.jpeg',
    duration: '15 min',
    progress: 60
  },
  {
    id: 'course3',
    title: 'Empathy in Relationships',
    description: 'Build deeper connections through understanding your partner\'s perspective',
    imageUrl: 'https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg',
    duration: '20 min',
    progress: 25
  }
];