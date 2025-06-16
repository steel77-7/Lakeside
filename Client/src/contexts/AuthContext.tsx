import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface User {
  name:string
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_BACKEND}/user/login`
      const res = await axios.post(url, { email, password })
      if (res.status === 200) {
        localStorage.setItem('riverside_user_token', res.data.data.token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const url = `${import.meta.env.VITE_BACKEND}/user/register`
      const res = await axios.post(url, { email, password, username })
      if (res.status === 200) {
        return true;
      }
      return false
    } catch (error: any) {
      toast.error(error.response.data.detail)
      return false;
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('riverside_user_token');
      if (!token) {
        setUser(null);
        setInitializing(false);
        return;
      }
      try {
        const url = `${import.meta.env.VITE_BACKEND}/user/get-user`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.data);
      } catch (e) {
        console.error('could not fetch current user', e);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('riverside_user_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading,initializing }}>
      {children}
    </AuthContext.Provider>
  );
};