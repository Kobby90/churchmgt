import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Accept': 'application/json'
        }
      })
      .then(async res => {
        if (!res.ok) {
          // If token is invalid, clear it
          if (res.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
          throw new Error('Failed to fetch user profile');
        }
        return res.json();
      })
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(error => {
        console.error('Auth profile fetch error:', error);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { token: newToken, user } = await response.json();
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(user);
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred during login');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const signUp = async (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          address: userData.address
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert('Registration successful! Please check your email to confirm your account.');
      navigate('/login');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred during registration');
    }
  };

  const value = {
    user,
    loading,
    token,
    signIn,
    signOut,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth }; 