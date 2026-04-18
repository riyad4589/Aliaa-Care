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
    let authInitialized = false;

    // Fail-safe: Force stop loading after 6 seconds if it's stuck
    const timeoutId = setTimeout(() => {
      if (mounted && loadingRef.current) {
        console.warn("Auth initialization timed out, forcing stop loading.");
        setIsLoading(false);
      }
    }, 6000);

    const initAuth = async () => {
      if (authInitialized) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        authInitialized = true;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setUser(null);
        setSession(null);
        setIsLoading(false);
      }
    });

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
