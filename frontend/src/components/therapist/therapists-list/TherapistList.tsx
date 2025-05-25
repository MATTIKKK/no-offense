import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  MapPin,
  Star,
  Filter,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../ui/Input';
import './therapists-list.css';
import { TherapistSpecialty } from '../../../types';

type Therapist = {
  id: string;
  name: string;
  city: string;
  avatar: string;
  rating: number;
  specialties: TherapistSpecialty[];
  education: string;
};

const specialties: TherapistSpecialty[] = [
  'relationships',
  'communication',
  'conflict',
  'family',
  'general',
];

const TherapistsList: React.FC = () => {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<TherapistSpecialty | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('therapists');
    if (stored) {
      setTherapists(JSON.parse(stored));
    }
  }, []);

  const filteredTherapists = therapists.filter((therapist) => {
    const matchesSearch =
      searchTerm === '' ||
      therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      !selectedSpecialty || therapist.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  useEffect(() => {
    const stored = localStorage.getItem('therapists');
    if (!stored) {
      const exampleTherapists: Therapist[] = [
        {
          id: 'T001',
          name: 'Dr. Aisulu K.',
          city: 'Almaty',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          rating: 4.8,
          specialties: ['relationships', 'conflict'],
          education: 'Ph.D. in Psychology, KazNU',
        },
        {
          id: 'T002',
          name: 'Nursultan B.',
          city: 'Astana',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          rating: 4.6,
          specialties: ['communication', 'general'],
          education: 'MSc in Counseling, Nazarbayev University',
        },
        {
          id: 'T003',
          name: 'Zarina T.',
          city: 'Shymkent',
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
          rating: 4.9,
          specialties: ['family', 'relationships'],
          education: 'MA in Clinical Psychology, KIMEP University',
        },
        {
          id: 'T004',
          name: 'Yerbol S.',
          city: 'Karaganda',
          avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
          rating: 4.7,
          specialties: ['conflict', 'general'],
          education: 'Certified Mediator, Bolashak Program Graduate',
        },
      ];

      localStorage.setItem('therapists', JSON.stringify(exampleTherapists));
      setTherapists(exampleTherapists);
    } else {
      setTherapists(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="therapists-page">
      <header className="therapists-header">
        <div className="therapists-header-inner">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 className="page-title">Find a Therapist</h1>
        </div>
      </header>

      <main className="therapists-main">
        <div className="filter-box">
          <Input
            placeholder="Search by name or city..."
            leftIcon={<Search size={18} className="text-neutral-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />

          <div className="specialty-filter">
            <div className="specialty-title">
              <Filter size={16} />
              <span>Specialty:</span>
            </div>

            <div className="specialty-tags">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  className={`specialty-tag ${
                    selectedSpecialty === specialty ? 'active' : ''
                  }`}
                  onClick={() =>
                    setSelectedSpecialty(
                      selectedSpecialty === specialty ? null : specialty
                    )
                  }
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="therapist-list">
          {filteredTherapists.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={40} />
              <p>No therapists found</p>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredTherapists.map((therapist) => (
              <motion.div
                key={therapist.id}
                className="therapist-card"
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                onClick={() => navigate(`/therapist/${therapist.id}`)}
              >
                <div className="therapist-card-content">
                  <div className="therapist-top">
                    <div className="therapist-avatar">
                      <img src={therapist.avatar} alt={therapist.name} />
                    </div>

                    <div className="therapist-info">
                      <div className="therapist-name-rating">
                        <h3 className="therapist-name">{therapist.name}</h3>
                        <div className="therapist-rating">
                          <Star size={16} />
                          <span>{therapist.rating}</span>
                        </div>
                      </div>

                      <div className="therapist-location">
                        <MapPin size={14} />
                        <span>{therapist.city}</span>
                      </div>

                      <div className="therapist-specialties">
                        {therapist.specialties.map((specialty) => (
                          <span key={specialty}>{specialty}</span>
                        ))}
                      </div>

                      <p className="therapist-description">
                        {therapist.education}
                      </p>
                    </div>
                  </div>

                  <div className="view-profile">
                    <button>View Profile</button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default TherapistsList;
