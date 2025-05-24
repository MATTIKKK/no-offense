import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, XCircle, CheckCircle, Users, ArrowLeft } from 'lucide-react';
import './notifications.css';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) setUserId(id);
    else navigate('/login');
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:8000/chat/invites/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInvites(data);
        } else {
          setInvites([]);
        }
      })
      .catch(err => console.error('Failed to load invites:', err));
  }, [userId]);

  const respond = async (inviteId: number, accept: boolean) => {
    try {
      await fetch(`http://localhost:8000/chat/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: inviteId, accept }),
      });
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch (err) {
      console.error('Failed to respond to invite:', err);
    }
  };

  return (
    <div className="notifications-container">
      <header className="notifications-header">
        <div className="notifications-header-inner">
          <button
            className="chats-list-action-btn"
            onClick={() => navigate('/home')}
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="notifications-title">
            <Bell />
            Invitations
          </div>
        </div>
      </header>

      <main className="notifications-main">
        <div className="notifications-section-header">
          <h2>Pending Invitations</h2>
        </div>

        <div className="notifications-list">
          {invites.length === 0 ? (
            <div className="notifications-empty">
              <Users size={40} className="notifications-empty-icon" />
              <p>No invites yet</p>
              <p className="text-sm">
                When someone invites you, it’ll show up here.
              </p>
            </div>
          ) : (
            invites.map((invite) => (
              <div key={invite.id} className="notification-card">
                <p>
                  <strong>{invite.from_user_name}</strong> invited you as{' '}
                  <em>{invite.relationship_type}</em>
                </p>
                <div className="notification-actions">
                  <button onClick={() => respond(invite.id, true)} className="accept-btn">
                    <CheckCircle size={16} /> Accept
                  </button>
                  <button onClick={() => respond(invite.id, false)} className="reject-btn">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
