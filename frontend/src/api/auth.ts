import { API_URL } from "../config";

type LoginPayload = {
  email: string;
  password: string;
};


type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};


export const loginUser = async (payload: LoginPayload): Promise<string> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Login failed');
  }

  const data = await res.json();

  const token = data.access_token;
  if (!token) throw new Error('Token not received');

  // Сохраняем токен
  localStorage.setItem('token', token);

  return token;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to get user');
  }

  return await res.json(); // { id, name }
};



export const registerUser = async (payload: RegisterPayload) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Registration failed');
  }

  return await res.json(); // { id, message }
};