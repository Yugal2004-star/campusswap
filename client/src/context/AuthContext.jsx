import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFetching            = useRef(false);
  const lastUserId            = useRef(null); // track to avoid duplicate fetches for same user

  const fetchProfile = useCallback(async () => {
    if (isFetching.current) return; // already in flight
    isFetching.current = true;
    try {
      const { data } = await api.get('/api/users/me');
      setProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setProfile(null);
    } finally {
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;

        // Skip if same user fires again (prevents repeated fetches on re-renders)
        if (currentUser?.id && currentUser.id === lastUserId.current) {
          setLoading(false);
          return;
        }

        lastUserId.current = currentUser?.id ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile();
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      lastUserId.current = null;
    };
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    lastUserId.current = null;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = useCallback(() => {
    isFetching.current = false; // force re-fetch even if guard is set
    fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};