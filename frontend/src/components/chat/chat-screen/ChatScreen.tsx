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
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import './chat-screen.css';
import { rephraseMessage } from '../../../api/rephraseMessage';
import { useAudioRecording } from '../../../utils/liveMicRecorder';

const ChatScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [skipAI, setSkipAI] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { recording, startRecording, stopRecording, getAudioBlob } = useAudioRecording();

  const [conversation, setConversation] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    if (!userId || !userName) {
      navigate('/login');
      return;
    }
    setCurrentUser({ id: userId, name: userName });

    fetch(`http://localhost:8000/chat/chats/${userId}/chat/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setConversation(data))
      .catch(() => navigate('/home'));
  }, [id, navigate]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  if (!currentUser || !conversation) return null;

  const otherParticipant =
    currentUser.id === conversation.user1.id ? conversation.user2 : conversation.user1;

  const handleSendMessage = async () => {
    if (!message.trim() || !id || !currentUser) return;
    let finalMessage = message.trim();

    if (!skipAI) {
      try {
        const aiMessage = await rephraseMessage(finalMessage);
        if (aiMessage !== finalMessage) finalMessage = aiMessage;
      } catch (e) {
        console.error('AI error, sending original:', e);
      }
    }

    await fetch(`http://localhost:8000/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: currentUser.id,
        chat_id: Number(id),
        content: finalMessage,
      }),
    });

    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicClick = async () => {
    if (!recording) {
      await startRecording();
      setIsRecording(true);
    } else {
      stopRecording();
      setIsRecording(false);
      const audioBlob = await getAudioBlob();
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.wav');

      try {
        const res = await fetch('http://localhost:8000/ai/stt', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        setMessage((prev) => prev + ' ' + data.text);
      } catch (err) {
        console.error('STT Error:', err);
      }
    }
  };

  const groupedMessages = (conversation.messages || []).reduce((groups: any, msg: any) => {
    const date = format(new Date(msg.timestamp), 'yyyy-MM-dd');
    (groups[date] = groups[date] || []).push(msg);
    return groups;
  }, {});

  const getStatusClass = () => {
    if (conversation.conflict_status === 'active') return 'status-active';
    if (conversation.conflict_status === 'paused') return 'status-paused';
    return 'status-resolved';
  };

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <div className="chat-header-left">
          <button className="chat-back-button" onClick={() => navigate('/home')}>
            <ArrowLeft size={22} />
          </button>
          <div className="chat-avatar-fallback">
            {otherParticipant.name.charAt(0).toUpperCase()}
          </div>
          <div className="chat-header-info">
            <h2>{otherParticipant.name}</h2>
            <div className="chat-status">
              <span className={`chat-status-indicator ${getStatusClass()}`} />
              <span>
                {conversation.conflict_status === 'active'
                  ? 'Active discussion'
                  : conversation.conflict_status === 'paused'
                  ? 'Paused'
                  : 'Online'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="chat-main">
        {Object.entries(groupedMessages).map(([date, messages]: any) => (
          <div key={date}>
            <div className="chat-date-label">{format(new Date(date), 'MMMM d, yyyy')}</div>
            {messages.map((msg: any) => {
              const isUser = msg.sender_id === currentUser.id;
              return (
                <div key={msg.id} className={`message-wrapper ${isUser ? 'user' : 'partner'}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`message-bubble ${isUser ? 'message-user' : 'message-partner'}`}
                  >
                    {msg.is_ai_modified && <div className="message-ai-tag">AI rewrote this message</div>}
                    <p>{msg.content}</p>
                    {msg.original_content && (
                      <details className="message-original">
                        <summary>Show original message</summary>
                        <p>{msg.original_content}</p>
                      </details>
                    )}
                    <div className="message-time">{format(new Date(msg.timestamp), 'h:mm a')}</div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messageEndRef} />
      </main>

      <footer className="chat-footer">
        <div className="footer-row">
          <div className="footer-toggle">
            <span>AI Rewording:</span>
            <button onClick={() => setSkipAI(!skipAI)}>
              {skipAI ? <ToggleLeft size={22} /> : <ToggleRight size={22} className="toggle-active" />}
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
          <button className={`footer-icon-btn ${isRecording ? 'recording' : ''}`} onClick={handleMicClick}>
            <Mic size={22} />
          </button>
          <button className="footer-send-btn" disabled={!message.trim()} onClick={handleSendMessage}>
            <Send size={22} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatScreen;
