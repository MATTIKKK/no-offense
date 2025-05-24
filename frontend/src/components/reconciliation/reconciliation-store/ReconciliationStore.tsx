import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Filter, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import './reconciliation-store.css';
import { useAppStore } from '../../../store';
import Button from '../../ui/button/Button';

const ReconciliationStore: React.FC = () => {
  const navigate = useNavigate();
  const items = useAppStore((state) => state.reconciliationItems);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredItems = activeFilter
    ? items.filter((item) => item.type === activeFilter)
    : items;

  return (
    <div className="store-page">
      <header className="store-header">
        <div className="store-header-inner">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 className="store-title">Reconciliation Store</h1>
        </div>
      </header>

      <main className="store-main">
        <div className="store-filter-section">
          <div className="store-filter-header">
            <h2 className="store-subtitle">
              <ShoppingBag className="icon" size={18} /> Gifts & Gestures
            </h2>

            <div className="store-filter-control">
              <Filter size={16} />
              <span>Filter:</span>
              <div className="store-filters">
                {['flowers', 'card', 'gift', 'certificate'].map((type) => (
                  <button
                    key={type}
                    className={`store-filter-btn ${
                      activeFilter === type ? 'active' : ''
                    }`}
                    onClick={() =>
                      setActiveFilter(activeFilter === type ? null : type)
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="store-grid">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                className="store-card"
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <div className="store-card-img">
                  <img src={item.imageUrl} alt={item.name} />
                </div>

                <div className="store-card-body">
                  <div className="store-card-header">
                    <h3>{item.name}</h3>
                    <span className="store-tag">{item.type}</span>
                  </div>

                  <p className="store-description">{item.description}</p>

                  <div className="store-footer">
                    <span className="store-price">${item.price.toFixed(2)}</span>
                    <Button size="sm" rightIcon={<Send size={14} />}>Send Gift</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReconciliationStore;