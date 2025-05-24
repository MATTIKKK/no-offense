import { create } from 'zustand';
import { 
  User, 
  SharedConnection, 
  Conversation, 
  Message, 
  Conflict, 
  Therapist, 
  ReconciliationItem,
  Course
} from '../types';
import { mockUsers, mockConnections, mockConversations, mockConflicts, 
  mockTherapists, mockReconciliationItems, mockCourses } from './mockData';

interface AppState {
  currentUser: User | null;
  connections: SharedConnection[];
  conversations: Conversation[];
  conflicts: Conflict[];
  therapists: Therapist[];
  reconciliationItems: ReconciliationItem[];
  courses: Course[];
  isAIModeratorEnabled: boolean;
  
  // Auth actions
  login: (userId: string) => void;
  logout: () => void;
  createOrConnectSharedId: (sharedId: string, type: SharedConnection['type']) => Promise<boolean>;
  
  // Conversation actions
  sendMessage: (conversationId: string, content: string, skipAI: boolean) => void;
  getConversation: (id: string) => Conversation | undefined;
  getConversationsForUser: () => Conversation[];
  
  // Settings actions
  toggleAIModerator: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  connections: mockConnections,
  conversations: mockConversations,
  conflicts: mockConflicts,
  therapists: mockTherapists,
  reconciliationItems: mockReconciliationItems,
  courses: mockCourses,
  isAIModeratorEnabled: true,
  
  login: (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      set({ currentUser: user });
    }
  },
  
  logout: () => {
    set({ currentUser: null });
  },
  
  createOrConnectSharedId: async (sharedId: string, type) => {
    // In a real app, this would connect to an API
    // For now, we'll simulate with a timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingConnection = get().connections.find(c => c.id === sharedId);
        
        if (existingConnection) {
          // Connect to existing
          const updatedConnections = get().connections.map(c => {
            if (c.id === sharedId && get().currentUser) {
              return {
                ...c,
                users: [...c.users, get().currentUser!]
              };
            }
            return c;
          });
          set({ connections: updatedConnections });
        } else if (get().currentUser) {
          // Create new
          const newConnection: SharedConnection = {
            id: sharedId,
            type,
            users: [get().currentUser!],
            createdAt: new Date()
          };
          set({ connections: [...get().connections, newConnection] });
        }
        
        resolve(true);
      }, 800);
    });
  },
  
  sendMessage: (conversationId, content, skipAI) => {
    if (!get().currentUser) return;
    
    let processedContent = content;
    let isAIModified = false;
    
    // If AI moderation is enabled and not skipped, process the message
    if (get().isAIModeratorEnabled && !skipAI) {
      // This is where we'd call an actual AI service
      // For now, we'll do a simple mock replacement of aggressive language
      const aggressiveWords = ['stupid', 'hate', 'idiot', 'never', 'always'];
      const hasAggressiveWords = aggressiveWords.some(word => 
        content.toLowerCase().includes(word)
      );
      
      if (hasAggressiveWords) {
        // Mock AI processing - in a real app, this would use an AI API
        processedContent = content
          .replace(/stupid/gi, "challenging")
          .replace(/hate/gi, "strongly dislike")
          .replace(/idiot/gi, "frustrating")
          .replace(/never/gi, "rarely")
          .replace(/always/gi, "often");
        isAIModified = true;
      }
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: get().currentUser!.id,
      content: processedContent,
      originalContent: isAIModified ? content : undefined,
      timestamp: new Date(),
      status: 'sent',
      isAIModified
    };
    
    const updatedConversations = get().conversations.map(conv => {
      if (conv.id === conversationId) {
        // Check for conflict based on AI modification
        let conflictStatus = conv.conflictStatus;
        if (isAIModified && conflictStatus === 'none') {
          conflictStatus = 'active';
        }
        
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessageAt: new Date(),
          conflictStatus
        };
      }
      return conv;
    });
    
    set({ conversations: updatedConversations });
    
    // If this message created a new conflict, track it
    const conversation = updatedConversations.find(c => c.id === conversationId);
    if (conversation?.conflictStatus === 'active' && isAIModified) {
      const existingConflict = get().conflicts.find(
        c => c.conversationId === conversationId && !c.resolvedAt
      );
      
      if (!existingConflict) {
        const newConflict: Conflict = {
          id: Date.now().toString(),
          connectionId: conversation.connectionId,
          conversationId,
          startedAt: new Date(),
          tags: ['communication'],
          isRecurring: false
        };
        
        set({ conflicts: [...get().conflicts, newConflict] });
      }
    }
  },
  
  getConversation: (id) => {
    return get().conversations.find(c => c.id === id);
  },
  
  getConversationsForUser: () => {
    if (!get().currentUser) return [];
    return get().conversations.filter(conv => 
      conv.participants.some(p => p.id === get().currentUser?.id)
    );
  },
  
  toggleAIModerator: () => {
    set({ isAIModeratorEnabled: !get().isAIModeratorEnabled });
  }
}));