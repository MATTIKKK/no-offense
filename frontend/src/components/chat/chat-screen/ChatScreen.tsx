import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone,
  User,
  Pause,
  ArrowLeft,
  Send,
  Mic,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import './chat-screen.css';
import { useAppStore } from '../../../store';
import { rephraseMessage } from '../../../services/rephraseMessage';

const ChatScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [skipAI, setSkipAI] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useAppStore((state) => state.currentUser);
  const conversation = useAppStore((state) => state.getConversation(id || ''));
  const sendMessage = useAppStore((state) => state.sendMessage);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (conversation?.conflictStatus === 'active') {
      const timer = setTimeout(() => setShowSuggestion(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [conversation?.messages, conversation?.conflictStatus]);

  if (!currentUser || !conversation) {
    navigate('/home');
    return null;
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUser.id
  );
  if (!otherParticipant) {
    navigate('/home');
    return null;
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !id) return;

    let finalMessage = message.trim();
    let originalContent: string | undefined;

    if (!skipAI) {
      try {
        const aiMessage = await rephraseMessage(finalMessage);
        console.log('[AI] Sending for rephrase:', finalMessage); 
        if (aiMessage !== finalMessage) {
          console.log('[AI] Got response:', aiMessage); 
          originalContent = finalMessage;
          finalMessage = aiMessage;
        }
      } catch (e) {
        console.error('AI error, sending original:', e);
      }
    }

    sendMessage(id, finalMessage, skipAI);
    setMessage('');
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const groupedMessages = conversation.messages.reduce((groups, msg) => {
    const date = format(new Date(msg.timestamp), 'yyyy-MM-dd');
    (groups[date] = groups[date] || []).push(msg);
    return groups;
  }, {} as Record<string, typeof conversation.messages>);

  const getStatusClass = () => {
    if (conversation.conflictStatus === 'active') return 'status-active';
    if (conversation.conflictStatus === 'paused') return 'status-paused';
    return 'status-resolved';
  };

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <div className="chat-header-left">
          <button
            className="chat-back-button"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft size={22} />
          </button>

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

          <div className="chat-header-info">
            <h2>{otherParticipant.name}</h2>
            <div className="chat-status">
              <span className={`chat-status-indicator ${getStatusClass()}`} />
              <span>
                {conversation.conflictStatus === 'active'
                  ? 'Active discussion'
                  : conversation.conflictStatus === 'paused'
                  ? 'Paused'
                  : 'Online'}
              </span>
            </div>
          </div>
        </div>

        <div className="chat-header-right">
          <button className="chat-header-button">
            <Phone size={20} />
          </button>
          <button className="chat-header-button">
            <User size={20} />
          </button>
          <button className="chat-header-button">
            <Pause size={20} />
          </button>
        </div>
      </header>

      <main className="chat-main">
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            <div className="chat-date-label">
              {format(new Date(date), 'MMMM d, yyyy')}
            </div>
            {messages.map((msg) => {
              const isUser = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`message-wrapper ${isUser ? 'user' : 'partner'}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`message-bubble ${
                      isUser ? 'message-user' : 'message-partner'
                    }`}
                  >
                    {msg.isAIModified && (
                      <div className="message-ai-tag">
                        AI rewrote this message
                      </div>
                    )}
                    <p>{msg.content}</p>
                    {msg.originalContent && (
                      <details className="message-original">
                        <summary>Show original message</summary>
                        <p>{msg.originalContent}</p>
                      </details>
                    )}
                    <div className="message-time">
                      {format(new Date(msg.timestamp), 'h:mm a')}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        ))}

        <AnimatePresence>
          {showSuggestion && (
            <motion.div
              className="conflict-suggestion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="conflict-suggestion-inner">
                <AlertCircle size={20} />
                <div>
                  <h3>This seems to be a recurring topic</h3>
                  <p>
                    A therapist could help navigate this discussion more
                    effectively.
                  </p>
                  <div className="suggestion-actions">
                    <button onClick={() => navigate('/therapists')}>
                      Find a Therapist
                    </button>
                    <button onClick={() => setShowSuggestion(false)}>
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {conversation.conflictStatus === 'active' && (
          <motion.div
            className="reconciliation-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="reconciliation-inner">
              <Heart size={20} />
              <div>
                <h3>Reconciliation suggestion</h3>
                <p>
                  Consider a gesture to help resolve this discussion positively.
                </p>
                <div className="reconciliation-actions">
                  <button onClick={() => navigate('/reconciliation')}>
                    View Options
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messageEndRef} />
      </main>

      <footer className="chat-footer">
        <div className="footer-row">
          <div className="footer-toggle">
            <span>AI Rewording:</span>
            <button onClick={() => setSkipAI(!skipAI)}>
              {skipAI ? (
                <ToggleLeft size={22} />
              ) : (
                <ToggleRight size={22} className="toggle-active" />
              )}
            </button>
          </div>
          <div className="footer-ai-hint">
            {skipAI ? 'Messages sent as-is' : 'AI helps reword messages'}
          </div>
        </div>

        <div className="footer-input-row">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="footer-textarea"
            rows={1}
          />
          <button className="footer-icon-btn">
            <Mic size={22} />
          </button>
          <button
            className="footer-send-btn"
            disabled={!message.trim()}
            onClick={handleSendMessage}
          >
            <Send size={22} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatScreen;
