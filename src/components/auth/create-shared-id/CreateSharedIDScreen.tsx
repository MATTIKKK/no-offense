import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LinkIcon, Users, RefreshCw } from 'lucide-react';
import './create-shared-id.css'; // 👈 link to your CSS file
import Button from '../../ui/button/Button';
import Input from '../../ui/Input';
import { useAppStore } from '../../../store';
import { RelationshipType } from '../../../types';

const CreateSharedIDScreen: React.FC = () => {
  const navigate = useNavigate();
  const [sharedId, setSharedId] = useState('');
  const [relationshipType, setRelationshipType] =
    useState<RelationshipType>('partner');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const createOrConnectSharedId = useAppStore(
    (state) => state.createOrConnectSharedId
  );
  const login = useAppStore((state) => state.login);

  const generateRandomId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSharedId(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedId || !name) return;

    setIsLoading(true);
    login('user1');
    const success = await createOrConnectSharedId(sharedId, relationshipType);
    setIsLoading(false);

    if (success) navigate('/home');
  };

  const relationshipOptions = [
    { value: 'partner', label: 'Partner', icon: <Users size={20} /> },
    { value: 'spouse', label: 'Spouse', icon: <Users size={20} /> },
    { value: 'friend', label: 'Friend', icon: <Users size={20} /> },
    { value: 'family', label: 'Family', icon: <Users size={20} /> },
  ];

  return (
    <div className="shared-id-screen">
      <motion.div
        className="form-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="form-title">Create or Connect via Shared ID</h1>
        <p className="form-subtitle">
          This ID will link you with your relationship partner. Share it with
          them to connect.
        </p>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <Input
              label="Your Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Shared ID</label>
            <div className="input-row">
              <Input
                placeholder="ABCD12"
                value={sharedId}
                onChange={(e) => setSharedId(e.target.value.toUpperCase())}
                leftIcon={<LinkIcon size={18} />}
                className="input-half"
                maxLength={6}
                required
              />
              <Button
                type="button"
                size="sm"
                className="refresh-btn"
                onClick={generateRandomId}
              >
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Relationship Type</label>
            <div className="relationship-grid">
              {relationshipOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relationship-option ${
                    relationshipType === option.value ? 'selected' : ''
                  }`}
                  onClick={() =>
                    setRelationshipType(option.value as RelationshipType)
                  }
                >
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            {sharedId ? 'Connect' : 'Create'}
          </Button>

          <Button
            type="button"
            variant="text"
            fullWidth
            onClick={() => navigate('/')}
          >
            Back
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSharedIDScreen;
