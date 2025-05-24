import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Settings, PlusCircle, Bell } from 'lucide-react';
import './chats-list.css';

interface User {
  id: string;
  name: string;
}

interface Chat {
  id: number;
  created_at: string;
  user1: User;
  user2: User;
}

const ChatsList: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Chat[]>([]);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    if (id && name) {
      setCurrentUser({ id, name });
    } else {
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch(`http://localhost:8000/chat/chats/${currentUser.id}`);
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };

    fetchConversations();
  }, [currentUser?.id]);

  return (
    <div className="chat-list-container">
      <header className="chats-list-header">
        <div className="chats-list-header-inner">
          <div className="chats-list-title">
            <MessageSquare />
            noOffense
          </div>
          <div className="chats-list-actions">
            <button onClick={() => navigate('/notifications')} className="chats-list-action-btn">
              <Bell size={22} />
            </button>
            <button onClick={() => navigate('/settings')} className="chats-list-action-btn">
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="chats-list-main">
        <div className="chat-connections-header">
          <h2>Connections</h2>
          <button onClick={() => navigate('/create-shared-id')}>
            <PlusCircle size={18} />
            <span>Add New</span>
          </button>
        </div>

        <div className="chat-list">
          {conversations.length === 0 ? (
            <div className="chat-empty">
              <Users size={40} className="chat-empty-icon" />
              <p>No connections yet</p>
              <p className="text-sm">Create a Shared ID to connect with someone</p>
            </div>
          ) : (
            conversations.map((chat) => {
              const other =
                currentUser?.id === chat.user1.id ? chat.user2 : chat.user1;

              return (
                <motion.div
                  key={chat.id}
                  className="chat-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                >
                  <div className="chat-card-inner">
                    <div className="chat-user-row">
                      <div className="chat-user-left">
                        <div className="chat-avatar-fallback">
                          {other.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="chat-user-info">
                          <h3>{other.name}</h3>
                          <div className="chat-status">
                            <span className="chat-status-indicator status-default" />
                            <span>Connected</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs text-neutral-500">
                        {new Date(chat.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="chat-last-message text-sm text-neutral-500 italic">
                      No messages yet
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatsList;
