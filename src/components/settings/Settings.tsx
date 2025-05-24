import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  LogOut,
  Languages as Language,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAppStore } from '../../store';
import './settings.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);
  const isAIModeratorEnabled = useAppStore(
    (state) => state.isAIModeratorEnabled
  );
  const toggleAIModerator = useAppStore((state) => state.toggleAIModerator);
  const logout = useAppStore((state) => state.logout);

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const settings = [
    {
      id: 'profile',
      icon: <User size={20} className="icon-primary" />,
      title: 'Profile',
      description: 'Update your personal information',
      action: () => {},
    },
    {
      id: 'notifications',
      icon: <Bell size={20} className="icon-warning" />,
      title: 'Notifications',
      description: 'Configure your notification preferences',
      action: () => {},
    },
    {
      id: 'privacy',
      icon: <Lock size={20} className="icon-secondary" />,
      title: 'Privacy & Security',
      description: 'Manage your privacy settings',
      action: () => {},
    },
    {
      id: 'language',
      icon: <Language size={20} className="icon-accent" />,
      title: 'Language',
      description: 'Change your language preferences',
      action: () => {},
    },
  ];

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="settings-header-inner">
          <button className="back-button" onClick={() => navigate('/home')}>
            <ArrowLeft size={22} />
          </button>
          <h1 className="settings-title">Settings</h1>
        </div>
      </header>

      <main className="settings-main">
        <div className="profile-card">
          <div className="profile-info">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-placeholder">
                <span>{currentUser.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className='profile-text'>
              <h2 className="profile-name">{currentUser.name}</h2>
              <p className="profile-id">User ID: {currentUser.id}</p>
            </div>
          </div>
        </div>

        <div className="toggle-card">
          <div className="toggle-row">
            <span>AI Message Moderation</span>
            <button className="toggle-button" onClick={toggleAIModerator}>
              {isAIModeratorEnabled ? (
                <ToggleRight size={28} className="toggle-on" />
              ) : (
                <ToggleLeft size={28} className="toggle-off" />
              )}
            </button>
          </div>
          <p className="toggle-description">
            When enabled, AI will help reword potentially hurtful messages to be
            more constructive.
          </p>
        </div>

        <div className="settings-list">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="setting-item"
              onClick={setting.action}
            >
              <div className="setting-icon">{setting.icon}</div>
              <div className="setting-content">
                <h3 className="setting-title">{setting.title}</h3>
                <p className="setting-description">{setting.description}</p>
              </div>
              <div className="setting-arrow">
                <ArrowLeft size={18} className="rotate-arrow" />
              </div>
            </div>
          ))}
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} className="logout-icon" />
          <span>Log Out</span>
        </button>
      </main>
    </div>
  );
};

export default Settings;
