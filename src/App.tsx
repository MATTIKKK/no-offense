import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { useAppStore } from './store';

// Auth Screens
import WelcomeScreen from './components/auth/welcome-screen/WelcomeScreen';
import CreateSharedIDScreen from './components/auth/create-shared-id/CreateSharedIDScreen';

// Main Screens
import ChatScreen from './components/chat/chat-screen/ChatScreen';
import ChatsList from './components/chat/chats-list/ChatList';
import TherapistsList from './components/therapist/therapists-list/TherapistList';
import TherapistProfile from './components/therapist/therapist-profile/TherapistProfile';
import ReconciliationStore from './components/reconciliation/reconciliation-store/ReconciliationStore';
import EducationCenter from './components/education/EducationCenter';
import EmergencyDeescalation from './components/emergency/EmergencyDeescalation';
import ConflictHistory from './components/conflict/ConflictHistory';
import Settings from './components/settings/Settings';

function App() {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);

  // Mock the SOS trigger with a long press
  let pressTimer: NodeJS.Timeout | null = null;

  const handleMouseDown = () => {
    pressTimer = setTimeout(() => {
      navigate('/emergency')
    }, 1000); 
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
    }
  };

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!currentUser) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  };

  return (
    <div
      className="font-sans"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/create-shared-id" element={<CreateSharedIDScreen />} />
          <Route path="/connect-shared-id" element={<CreateSharedIDScreen />} />

          {/* Main Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <ChatsList />
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
              // <ProtectedRoute>
              <ConflictHistory />
              // </ProtectedRoute>
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
              // <ProtectedRoute>
              <EducationCenter />
              // </ProtectedRoute>
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

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

    </div>
  );
}

export default App;
