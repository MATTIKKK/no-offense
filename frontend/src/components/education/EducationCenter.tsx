import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import './education-center.css';
import { API_URL } from '../../config';

type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  imageUrl: string;
};

const fallbackCourses: Course[] = [
  {
    id: '1',
    title: 'Динамика отношений',
    description: 'Изучите, как люди строят, разрушают и восстанавливают связи.',
    duration: '32 мин',
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Эффективное общение в паре',
    description: 'Освойте навыки выражения чувств и активного слушания без осуждения.',
    duration: '28 мин',
    progress: 20,
    imageUrl: 'https://images.unsplash.com/photo-1604697964156-4fdc02a7185b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Восстановление доверия после конфликта',
    description: 'Практические шаги к эмоциональной безопасности и взаимопониманию.',
    duration: '35 мин',
    progress: 60,
    imageUrl: 'https://images.unsplash.com/photo-1616596881936-e2bfc5741a61?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    title: 'Методы деэскалации конфликтов',
    description: 'Научитесь сохранять спокойствие и обсуждать проблемы конструктивно.',
    duration: '22 мин',
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1589571894960-20bbe2828a27?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    title: 'Ежедневные ритуалы для крепких отношений',
    description: 'Откройте для себя простые привычки, которые сближают.',
    duration: '18 мин',
    progress: 100,
    imageUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    title: 'Тренинг эмпатии для партнёров',
    description: 'Развивайте эмоциональную чувствительность и снижайте количество ссор.',
    duration: '26 мин',
    progress: 10,
    imageUrl: 'https://images.unsplash.com/photo-1530023367847-a683933f417c?auto=format&fit=crop&w=800&q=80',
  }
];
  

const EducationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/education/courses`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.warn('Unexpected response. Using fallback courses.');
          setCourses(fallbackCourses);
        }
      } catch (err) {
        console.error('Failed to load courses. Using fallback.', err);
        setCourses(fallbackCourses);
      }
    };

    fetchCourses();
  }, []);

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
            {Array.isArray(courses) && courses.map((course) => (
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
                    <div
                      className="course-progress-fill"
                      style={{ width: `${course.progress}%` }}
                    />
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
