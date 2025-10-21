import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Profile, AccountType } from '../services/supabase';

type AuthContextType = {
  isAuthenticated: boolean;
  user: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, accountType: AccountType) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Listen to auth changes
    const { data: subscription } = supabaseService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        const profile = await supabaseService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await supabaseService.getCurrentUser();
      if (currentUser) {
        const profile = await supabaseService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await supabaseService.signIn(email, password);
      const profile = await supabaseService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, accountType: AccountType) => {
    try {
      await supabaseService.signUp(email, password, username, accountType);
      const profile = await supabaseService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabaseService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export type { AccountType };
