import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '../../store';
import './conflict-history.css';

const ConflictHistory: React.FC = () => {
  const navigate = useNavigate();
  const conflicts = useAppStore(state => state.conflicts);
  const [activeFilter] = useState<string | null>(null);

  const filteredConflicts = activeFilter 
    ? conflicts.filter(conflict => conflict.tags.includes(activeFilter))
    : conflicts;

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'communication':
        return 'tag-communication';
      case 'money':
        return 'tag-money';
      case 'planning':
        return 'tag-planning';
      case 'priorities':
        return 'tag-priorities';
      default:
        return 'tag-default';
    }
  };

  return (
    <div className="conflict-page">
      <header className="conflict-header">
        <div className="conflict-header-inner">
          <button className="back-button" onClick={() => navigate('/home')}>
            <ArrowLeft size={22} />
          </button>
          <h1 className="conflict-title">Conflict History</h1>
        </div>
      </header>

      <main className="conflict-main">
        <div className="conflict-section">
          <div className="conflict-section-header">
            <h2 className="conflict-subtitle">
              <Calendar size={18} /> Recent Conflicts
            </h2>
          </div>

          <div className="conflict-list">
            {filteredConflicts.length === 0 ? (
              <div className="conflict-empty">
                <CheckCircle size={40} className="empty-icon" />
                <p className="empty-message">No conflicts found</p>
                <p className="empty-sub">
                  {activeFilter 
                    ? `No conflicts with the "${activeFilter}" tag`
                    : 'Enjoy your peaceful relationship'}
                </p>
              </div>
            ) : (
              filteredConflicts.map(conflict => (
                <div 
                  key={conflict.id}
                  className="conflict-card"
                  onClick={() => navigate(`/chat/${conflict.conversationId}`)}
                >
                  <div className="conflict-card-body">
                    <div className="conflict-card-header">
                      <div className="conflict-status">
                        {conflict.resolvedAt ? (
                          <div className="status-icon resolved">
                            <CheckCircle size={18} />
                          </div>
                        ) : (
                          <div className="status-icon unresolved">
                            <AlertCircle size={18} />
                          </div>
                        )}

                        <div>
                          <h3 className="conflict-topic">{conflict.topic || 'Untitled Conflict'}</h3>
                          <div className="conflict-date">
                            <Clock size={14} />
                            {format(new Date(conflict.startedAt), 'MMM d, yyyy')}
                            {conflict.resolvedAt && (
                              <span className="resolved-label">Resolved</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {conflict.isRecurring && (
                        <span className="recurring-badge">Recurring</span>
                      )}
                    </div>

                    <div className="conflict-tags">
                      {conflict.tags.map(tag => (
                        <span key={tag} className={`tag ${getTagColor(tag)}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConflictHistory;
