import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Star,
  GraduationCap,
  Clock,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../ui/button/Button';
import './therapist-profile.css';

type Therapist = {
  id: string;
  name: string;
  city: string;
  rating: number;
  avatar: string;
  specialties: string[];
  education: string;
  experience: string;
};

const TherapistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('therapists');
    if (!stored) {
      navigate('/therapists');
      return;
    }

    const therapists: Therapist[] = JSON.parse(stored);
    const found = therapists.find((t) => t.id === id);
    if (!found) {
      navigate('/therapists');
      return;
    }

    setTherapist(found);
  }, [id, navigate]);

  if (!therapist) return null;

  return (
    <div className="therapist-profile-page">
      <header className="therapist-profile-header">
        <div className="header-inner">
          <button className="back-button" onClick={() => navigate('/therapists')}>
            <ArrowLeft size={22} />
          </button>
          <h1 className="header-title">Therapist Profile</h1>
        </div>
      </header>

      <main className="therapist-profile-main">
        <div className="therapist-profile-card">
          <div className="therapist-profile-banner">
            <div className="therapist-profile-banner-overlay">
              <h2 className="therapist-profile-name">{therapist.name}</h2>
              <div className="therapist-profile-location">
                <MapPin size={16} />
                <span>{therapist.city}</span>
                <div className="therapist-profile-rating">
                  <Star size={16} />
                  <span>{therapist.rating}</span>
                </div>
              </div>
            </div>

            <motion.div
              className="therapist-profile-avatar"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img src={therapist.avatar} alt={therapist.name} />
            </motion.div>
          </div>

          <div className="therapist-profile-content">
            <div className="therapist-profile-tags">
              {therapist.specialties.map((specialty) => (
                <span key={specialty} className="tag">
                  {specialty}
                </span>
              ))}
            </div>

            <div className="therapist-profile-sections">
              <div className="therapist-profile-section">
                <h3 className="section-title">
                  <GraduationCap size={20} /> Education & Experience
                </h3>
                <div className="section-box">
                  <p>{therapist.education}</p>
                  <p>{therapist.experience}</p>
                </div>
              </div>

              <div className="therapist-profile-section">
                <h3 className="section-title">
                  <Clock size={20} /> Availability
                </h3>
                <div className="section-box">
                  <div className="availability-grid">
                    {['Mon', 'Wed', 'Fri'].map((day) => (
                      <div key={day} className="availability-box">
                        <p className="day">{day}</p>
                        <p className="hours">9 AM - 5 PM</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="therapist-profile-buttons">
              <Button fullWidth size="lg" leftIcon={<Calendar size={18} />}>
                Schedule Appointment
              </Button>

              <Button fullWidth variant="outline" className="message-button">
                Message
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapistProfile;
