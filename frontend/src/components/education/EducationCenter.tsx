import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store';
import './education-center.css';

const EducationCenter: React.FC = () => {
  const navigate = useNavigate();
  const courses = useAppStore(state => state.courses);

  return (
    <div className="education-page">
      <header className="education-header">
        <div className="education-header-inner">
          <button className="back-button" onClick={() => navigate('/home')}>
            <ArrowLeft size={22} />
          </button>
          <h1 className="education-title">Education Center</h1>
        </div>
      </header>

      <main className="education-main">
        <div className="education-section">
          <div className="education-heading">
            <Book className="heading-icon" size={20} />
            <h2 className="heading-text">Courses & Guides</h2>
          </div>

          <div className="course-grid">
            {courses.map(course => (
              <motion.div
                key={course.id}
                className="course-card"
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <div className="course-thumbnail">
                  <img src={course.imageUrl} alt={course.title} />

                  <div className="thumbnail-overlay">
                    <div className="play-icon">
                      <Play size={24} className="text-white" />
                    </div>
                  </div>

                  <div className="course-duration">
                    <Clock size={12} className="duration-icon" />
                    {course.duration}
                  </div>
                </div>

                <div className="course-body">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>

                  <div className="course-progress-bar">
                    <div className="course-progress-fill" style={{ width: `${course.progress}%` }}></div>
                  </div>

                  <div className="course-progress-info">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>

                  <button className="course-button">
                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EducationCenter;
