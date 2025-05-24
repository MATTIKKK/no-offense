import React from 'react';
import './welcome-screen.css';
import cuteBirds from '../../../static/media/cute-birds.gif';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/button/Button';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-icon">
        <img src={cuteBirds} alt="" />
      </div>
      <h1 className="welcome-title">Welcome</h1>
      <div className="welcome-buttons">
        <Button
          type="submit"
          fullWidth
          size="lg"
          onClick={() => navigate('/create-shared-id')}
        >
          Get Started
        </Button>
        <p
          className="login-text"
          onClick={() => navigate('/connect-shared-id')}
        >
          Already have an account?
        </p>
      </div>

      <p className="agreement">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default WelcomeScreen;
