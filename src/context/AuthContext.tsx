import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user';

interface Profile {
  id: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(true);

  useEffect(() => {
    // Update ref whenever isLoading changes
    loadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    let mounted = true;

    // Single source of truth: onAuthStateChange handles everything
    // including INITIAL_SESSION on page refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Handles INITIAL_SESSION (refresh), SIGNED_IN, TOKEN_REFRESHED
        await fetchProfile(session.user.id);
      } else {
        // No session: user is not logged in
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Fail-safe: if onAuthStateChange never fires (unlikely but possible)
    const timeoutId = setTimeout(() => {
      if (mounted && loadingRef.current) {
        console.warn("Auth initialization timed out.");
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAdmin: profile?.role === 'admin',
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
