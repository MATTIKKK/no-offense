import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus } from 'lucide-react';
import './create-shared-id.css';
import Button from '../../ui/button/Button';
import Input from '../../ui/Input';
import { RelationshipType } from '../../../types';

const CreateInvite: React.FC = () => {
  const navigate = useNavigate();
  const [label, setLabel] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [relationshipType, setRelationshipType] =
    useState<RelationshipType>('partner');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId || !label) return;

    setIsLoading(true);
    try {
      const fromUserId = localStorage.getItem('userId');
      if (!fromUserId) throw new Error('User not logged in');

      const res = await fetch(`http://localhost:8000/chat/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          relationship_type: relationshipType,
          label_for_partner: label,
        }),
      });

      if (!res.ok) throw new Error('Failed to send invite');

      alert('Invitation sent!');
      navigate('/home');
    } catch (err) {
      console.error('Error sending invite:', err);
      alert('Failed to send invitation.');
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="form-title">Send an Invitation</h1>
        <p className="form-subtitle">
          Enter the details of the person you want to start a conversation with.
        </p>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <Input
              label="Name"
              placeholder="e.g. John Doe"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              fullWidth
              required
            />
          </div>

          <div className="form-group">
            <Input
              label="ID"
              placeholder="e.g. ABC123"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value.toUpperCase())}
              leftIcon={<UserPlus size={18} />}
              required
              fullWidth
            />
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
            Send Invitation
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

export default CreateInvite;
