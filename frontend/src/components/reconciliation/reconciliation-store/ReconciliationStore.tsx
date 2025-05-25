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

  const filteredItems = activeFilter
    ? items.filter((item) => item.type === activeFilter)
    : items;

  useEffect(() => {
    setItems([
      {
        id: '1',
        name: 'Red Roses',
        description: 'A classic bouquet of red roses to show your affection.',
        price: 29.99,
        imageUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQId9f25aKFA_kIMrT44hsuY21QvPY_GdaWEQ&s',
        type: 'flowers',
      },
      {
        id: '2',
        name: 'Sorry Card',
        description: 'Express your feelings with a heartfelt message.',
        price: 4.99,
        imageUrl:
          'https://i.pinimg.com/736x/72/0a/0b/720a0b1cc8c2fa2cf18d9424c6c74893.jpg',
        type: 'card',
      },
      {
        id: '3',
        name: 'Spa Voucher',
        description: 'Give the gift of relaxation with a day spa certificate.',
        price: 59.99,
        imageUrl:
          'https://www.ragdalehall.co.uk/app/uploads/2024/09/Ragdale-Vouchers.jpg',
        type: 'certificate',
      },
      {
        id: '4',
        name: 'Chocolate Box',
        description: 'A sweet treat to melt any heart.',
        price: 14.99,
        imageUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5N4uK8uWDM01Tw0ViJcRZjBdWeIcapY7u_Q&s',
        type: 'gift',
      },
      {
        id: '5',
        name: 'Personalized Mug',
        description: 'Remind them every day how much you care.',
        price: 12.49,
        imageUrl:
          'https://cms.cloudinary.vpsvc.com/images/c_scale,dpr_auto,f_auto,q_auto:best,t_productPageHeroGalleryTransformation_v2,w_auto/legacy_dam/en-us/S001683929/NPIB-8347-Mugs-Lifestyle-Callouts-Business-Consumer-PDP-Hero-001?cb=21b1a464ee1896c60a41e5b29e152e769309c0d7',
        type: 'gift',
      },
      {
        id: '6',
        name: 'Weekend Getaway Certificate',
        description:
          'A surprise weekend away for two — peace and smiles guaranteed.',
        price: 199.99,
        imageUrl:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        type: 'certificate',
      },
      {
        id: '7',
        name: 'Sunflower Bouquet',
        description: 'Brighten their day with cheerful sunflowers.',
        price: 24.99,
        imageUrl:
          'https://freshknots.in/wp-content/uploads/2022/12/2-540x540.jpg',
        type: 'flowers',
      },
      {
        id: '8',
        name: 'Handwritten Poem Card',
        description: 'A poetic apology that comes from the heart.',
        price: 6.49,
        imageUrl:
          'https://i.etsystatic.com/51989611/r/il/5ed09d/5994199139/il_570xN.5994199139_14t1.jpg',
        type: 'card',
      },
    ]);
  }, []);

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
