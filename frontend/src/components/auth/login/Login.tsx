import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Input from '../../ui/Input';
import Button from '../../ui/button/Button';
import './login.css';
import { loginUser, getCurrentUser } from '../../../api/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await loginUser({ email, password });

      const user = await getCurrentUser();

      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);

      navigate('/home');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Login error:', err.message);
        alert(`Login failed: ${err.message}`);
      } else {
        console.error('Unexpected error:', err);
        alert('Unexpected error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Login to continue your journey</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
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

          <div className="login-form-group">
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
            Login
          </Button>

          <Button
            type="button"
            variant="text"
            fullWidth
            onClick={() => navigate('/register')}
          >
            Don't have an account? Register
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
