import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../utils/types';
import { getFromStorage, setToStorage, removeFromStorage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = getFromStorage('currentUser');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // In a real app, this would be an API call
    // For demo purposes, we'll use localStorage with sample data
    const users = getFromStorage('users') || [];
    const foundUser = users.find((u: User) => u.username === username && u.password === password);

    if (foundUser) {
      setUser(foundUser);
      setToStorage('currentUser', foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    removeFromStorage('currentUser');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};