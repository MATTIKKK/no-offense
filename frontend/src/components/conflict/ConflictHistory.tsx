import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Settings, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './conflict-history.css';
import { API_URL } from '../../config';

const ChatsList: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    if (id && name) {
      setCurrentUser({ id, name });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchConversations = async () => {
      // try {
      //   const res = await fetch(`${API_URL}/conversations/${localStorage.getItem('userId')}`);
      //   const data = await res.json();
      //   setConversations(data);
      // } catch (err) {
      //   console.error('Failed to load conversations:', err);
      // }
    };

    fetchConversations();
  }, []);

  const getConflictStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'paused':
        return 'status-paused';
      case 'resolved':
        return 'status-resolved';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="chat-list-container">
      <header className="chats-list-header">
        <div className="chats-list-header-inner">
          <div className="chats-list-title">
            <MessageSquare />
            noOffense
          </div>
          <button
            className="chats-list-action-btn"
            onClick={() => navigate('/settings')}
            aria-label="Open settings"
          >
            <Settings size={22} />
          </button>
        </div>
      </header>

      <main className="chats-list-main">
        {/* <div className="chat-connections-header">
          <h2>Connections</h2>
          <button onClick={() => navigate('/create-shared-id')}>
            <PlusCircle size={18} />
            <span>Add New</span>
          </button>
        </div> */}

        <div className="chat-list">
          {conversations.length === 0 ? (
            <div className="chat-empty">
              <Users size={40} className="chat-empty-icon" />
              <p>No connections yet</p>
              <p className="text-sm">
                Create a Shared ID to connect with someone
              </p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (p: any) => p.id !== currentUser?.id
              );
              if (!otherParticipant) return null;

              const lastMessage =
                conversation.messages[conversation.messages.length - 1];

              return (
                <motion.div
                  key={conversation.id}
                  className="chat-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    y: -2,
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                >
                  <div className="chat-card-inner">
                    <div className="chat-user-row">
                      <div className="chat-user-left">
                        {otherParticipant.avatar ? (
                          <img
                            src={otherParticipant.avatar}
                            alt={otherParticipant.name}
                            className="chat-avatar"
                          />
                        ) : (
                          <div className="chat-avatar-fallback">
                            {otherParticipant.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="chat-user-info">
                          <h3>{otherParticipant.name}</h3>
                          <div className="chat-status">
                            <span
                              className={`chat-status-indicator ${getConflictStatusClass(
                                conversation.conflictStatus
                              )}`}
                            />
                            <span>
                              {conversation.conflictStatus === 'active'
                                ? 'Active discussion'
                                : conversation.conflictStatus === 'paused'
                                ? 'Paused'
                                : conversation.conflictStatus === 'resolved'
                                ? 'Resolved'
                                : 'No conflicts'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {lastMessage && (
                        <span className="text-xs text-neutral-500">
                          {formatDistanceToNow(new Date(lastMessage.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>

                    {lastMessage && (
                      <p className="chat-last-message">
                        {lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}

                    {conversation.conflictTopic && (
                      <div className="chat-topic">
                        <span>Topic: {conversation.conflictTopic}</span>
                      </div>
                    )}
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
