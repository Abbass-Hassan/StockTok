// auth.js - Updated to use correct field name - password_confirmation

import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (email, password, confirmPassword) => {
  try {
    const response = await api.post('/register', {
      email: email,
      password: password,
      password_confirmation: confirmPassword,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/login', {
      email,
      password,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Other auth methods as needed
