import { create } from 'zustand';
import {
  User,
  SharedConnection,
  Conversation,
  Message,
  Conflict,
  Therapist,
  ReconciliationItem,
  Course,
} from '../types';

interface AppState {
  currentUser: User | null;
  connections: SharedConnection[];
  conversations: Conversation[];
  conflicts: Conflict[];
  therapists: Therapist[];
  reconciliationItems: ReconciliationItem[];
  courses: Course[];
  isAIModeratorEnabled: boolean;

  login: (user: User) => void;
  logout: () => void;
  createOrConnectSharedId: (sharedId: string, type: SharedConnection['type']) => Promise<boolean>;
  sendMessage: (conversationId: string, content: string, skipAI: boolean) => void;
  getConversation: (id: string) => Conversation | undefined;
  getConversationsForUser: () => Conversation[];
  toggleAIModerator: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  connections: JSON.parse(localStorage.getItem('connections') || '[]'),
  conversations: JSON.parse(localStorage.getItem('conversations') || '[]'),
  conflicts: JSON.parse(localStorage.getItem('conflicts') || '[]'),
  therapists: JSON.parse(localStorage.getItem('therapists') || '[]'),
  reconciliationItems: JSON.parse(localStorage.getItem('reconciliationItems') || '[]'),
  courses: JSON.parse(localStorage.getItem('courses') || '[]'),
  isAIModeratorEnabled: JSON.parse(localStorage.getItem('aiMod') || 'true'),

  login: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    set({ currentUser: user });
  },

  logout: () => {
    localStorage.removeItem('currentUser');
    set({ currentUser: null });
  },

  createOrConnectSharedId: async (sharedId, type) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const state = get();
        const existing = state.connections.find(c => c.id === sharedId);
        const user = state.currentUser;
        if (!user) return resolve(false);

        if (existing) {
          const updated = state.connections.map((c) =>
            c.id === sharedId ? { ...c, users: [...c.users, user] } : c
          );
          localStorage.setItem('connections', JSON.stringify(updated));
          set({ connections: updated });
        } else {
          const newConn: SharedConnection = {
            id: sharedId,
            type,
            users: [user],
            createdAt: new Date(),
          };
          const updated = [...state.connections, newConn];
          localStorage.setItem('connections', JSON.stringify(updated));
          set({ connections: updated });
        }
        resolve(true);
      }, 800);
    });
  },

  sendMessage: (conversationId, content, skipAI) => {
    const state = get();
    const user = state.currentUser;
    if (!user) return;

    let processedContent = content;
    let isAIModified = false;

    if (state.isAIModeratorEnabled && !skipAI) {
      const aggressiveWords = ['stupid', 'hate', 'idiot', 'never', 'always'];
      const hasAggression = aggressiveWords.some(w => content.toLowerCase().includes(w));
      if (hasAggression) {
        processedContent = content
          .replace(/stupid/gi, 'challenging')
          .replace(/hate/gi, 'dislike')
          .replace(/idiot/gi, 'frustrating')
          .replace(/never/gi, 'rarely')
          .replace(/always/gi, 'often');
        isAIModified = true;
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      content: processedContent,
      originalContent: isAIModified ? content : undefined,
      timestamp: new Date(),
      status: 'sent',
      isAIModified,
    };

    const updatedConversations = state.conversations.map((c) => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessageAt: new Date(),
          conflictStatus: isAIModified ? 'active' : c.conflictStatus,
        };
      }
      return c;
    });

    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    set({ conversations: updatedConversations });

    const conversation = updatedConversations.find(c => c.id === conversationId);
    if (conversation?.conflictStatus === 'active' && isAIModified) {
      const existing = state.conflicts.find(c => c.conversationId === conversationId && !c.resolvedAt);
      if (!existing) {
        const newConflict: Conflict = {
          id: Date.now().toString(),
          connectionId: conversation.connectionId,
          conversationId,
          startedAt: new Date(),
          tags: ['communication'],
          isRecurring: false,
        };
        const updatedConflicts = [...state.conflicts, newConflict];
        localStorage.setItem('conflicts', JSON.stringify(updatedConflicts));
        set({ conflicts: updatedConflicts });
      }
    }
  },

  getConversation: (id) => {
    return get().conversations.find(c => c.id === id);
  },

  getConversationsForUser: () => {
    const user = get().currentUser;
    if (!user) return [];
    return get().conversations.filter(c =>
      c.participants.some(p => p.id === user.id)
    );
  },

  toggleAIModerator: () => {
    const current = get().isAIModeratorEnabled;
    localStorage.setItem('aiMod', JSON.stringify(!current));
    set({ isAIModeratorEnabled: !current });
  },
}));
