import React, { useState } from 'react';
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
import { useAppStore } from '../../../store';
import Input from '../../ui/Input';
import './therapists-list.css';
import { TherapistSpecialty } from '../../../types';

const specialties: TherapistSpecialty[] = [
  'relationships',
  'communication',
  'conflict',
  'family',
  'general',
];


const TherapistsList: React.FC = () => {
  const navigate = useNavigate();
  const therapists = useAppStore((state) => state.therapists);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<TherapistSpecialty | null>(
    null
  );

  const filteredTherapists = therapists.filter((therapist) => {
    const matchesSearch =
      searchTerm === '' ||
      therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      !selectedSpecialty || therapist.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

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
