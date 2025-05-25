import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import WelcomeScreen from './components/auth/welcome-screen/WelcomeScreen';
import CreateSharedID from './components/auth/create-shared-id/CreateSharedID';
import Register from './components/auth/register/Register';
import Login from './components/auth/login/Login';

// Main Screens
import ChatScreen from './components/chat/chat-screen/ChatScreen';
import ChatsList from './components/chat/chats-list/ChatList';
import TherapistsList from './components/therapist/therapists-list/TherapistList';
import TherapistProfile from './components/therapist/therapist-profile/TherapistProfile';
import ReconciliationStore from './components/reconciliation/reconciliation-store/ReconciliationStore';
import EducationCenter from './components/education/EducationCenter';
import ConflictHistory from './components/conflict/ConflictHistory';
import Settings from './components/settings/Settings';
import Notifications from './components/notifications/Notifications';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Загружаем пользователя из localStorage при инициализации
  useEffect(() => {
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    if (id && name) {
      setCurrentUser({ id, name });
    } else {
      setCurrentUser(null);
    }
  }, [location.pathname]); // обновляем, когда меняется путь

  // Слушаем long-press для SOS
  // let pressTimer: NodeJS.Timeout | null = null;

  // const handleMouseDown = () => {
  //   pressTimer = setTimeout(() => {
  //     navigate('/emergency');
  //   }, 1000);
  // };

  // const handleMouseUp = () => {
  //   if (pressTimer) clearTimeout(pressTimer);
  // };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (isLoading) {
    return <div>Loading...</div>; // или кастомный лоадер
  }

  if (!currentUser || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch('http://localhost:8000/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then((data) => {
        setCurrentUser({ id: data.id, name: data.name });
      })
      .catch(() => {
        localStorage.removeItem('token');
        setCurrentUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div
      className="font-sans"
      // onMouseDown={handleMouseDown}
      // onMouseUp={handleMouseUp}
      // onTouchStart={handleMouseDown}
      // onTouchEnd={handleMouseUp}
    >
      <Routes>
        {/* Public */}
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-shared-id" element={<CreateSharedID />} />
        <Route path="/connect-shared-id" element={<CreateSharedID />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <ChatsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conflicts"
          element={
            <ProtectedRoute>
              <ConflictHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reconciliation"
          element={
            <ProtectedRoute>
              <ReconciliationStore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/therapists"
          element={
            <ProtectedRoute>
              <TherapistsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/therapist/:id"
          element={
            <ProtectedRoute>
              <TherapistProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/education"
          element={
            <ProtectedRoute>
              <EducationCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
