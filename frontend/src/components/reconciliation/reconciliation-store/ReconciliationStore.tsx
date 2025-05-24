import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Filter, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import './reconciliation-store.css';
import Button from '../../ui/button/Button';

type StoreItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  type: 'flowers' | 'card' | 'gift' | 'certificate';
};

const ReconciliationStore: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    // Mock fetch or replace with real API call
    setItems([
      {
        id: '1',
        name: 'Red Roses',
        description: 'A classic bouquet of red roses to show your affection.',
        price: 29.99,
        imageUrl: 'https://placehold.co/300x200?text=Roses',
        type: 'flowers',
      },
      {
        id: '2',
        name: 'Sorry Card',
        description: 'Express your feelings with a heartfelt message.',
        price: 4.99,
        imageUrl: 'https://placehold.co/300x200?text=Card',
        type: 'card',
      },
      {
        id: '3',
        name: 'Spa Voucher',
        description: 'Give the gift of relaxation with a day spa certificate.',
        price: 59.99,
        imageUrl: 'https://placehold.co/300x200?text=Spa',
        type: 'certificate',
      },
    ]);
  }, []);

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
            {filteredItems.length === 0 ? (
              <div className="store-empty">No items match this filter.</div>
            ) : (
              filteredItems.map((item) => (
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
                      <span className="store-price">
                        ${item.price.toFixed(2)}
                      </span>
                      <Button size="sm" rightIcon={<Send size={14} />}>
                        Send Gift
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReconciliationStore;
