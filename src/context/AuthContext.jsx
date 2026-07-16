import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(undefined);

const mapSupabaseUser = (sbUser) => {
  if (!sbUser) return null;
  return {
    id: sbUser.id,
    fullName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.fullName || 'Hospital Staff',
    email: sbUser.email,
    role: sbUser.user_metadata?.role || 'Doctor'
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUserSession = async (session) => {
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const sbUser = session.user;
      try {
        // Fetch profile from Supabase profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', sbUser.id)
          .single();
          
        if (error) {
          console.warn("Could not find database profile, using auth metadata fallback:", error);
          setUser({
            id: sbUser.id,
            fullName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.fullName || 'Hospital Staff',
            email: sbUser.email,
            role: sbUser.user_metadata?.role || 'Doctor'
          });
        } else {
          setUser({
            id: sbUser.id,
            fullName: profile.full_name || sbUser.user_metadata?.full_name || 'Hospital Staff',
            email: sbUser.email,
            role: profile.role || 'Doctor'
          });
        }
      } catch (err) {
        console.error("Error resolving profile:", err);
        setUser({
          id: sbUser.id,
          fullName: sbUser.user_metadata?.full_name || 'Hospital Staff',
          email: sbUser.email,
          role: sbUser.user_metadata?.role || 'Doctor'
        });
      } finally {
        setLoading(false);
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return mapSupabaseUser(data.user);
  };

  const signup = async (fullName, email, password, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });
    if (error) throw error;
    return mapSupabaseUser(data.user);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Syncing Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
