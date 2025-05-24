import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Input from '../../ui/Input';
import Button from '../../ui/button/Button';
import './register.css';
import { registerUser } from '../../../api/auth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    setIsLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      console.log('[REGISTER SUCCESS]', res);
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err.message || err);
      alert(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">
          Sign up to get started. You’ll be able to connect with your partner
          later.
        </p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-form-group">
            <Input
              label="Your Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
          </div>

          <div className="register-form-group">
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              fullWidth
            />
          </div>

          <div className="register-form-group">
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              fullWidth
            />
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Register
          </Button>

          <Button
            type="button"
            variant="text"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Already have an account? Log in
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
