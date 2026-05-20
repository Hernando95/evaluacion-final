import { create } from 'zustand';
import { supabase } from '@/core/api/supabase';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userError) throw userError;
        
        set({ 
          user: userData as User,
          isAuthenticated: true,
          isLoading: false
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    }
  },
  
  signUp: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Insert user profile data
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            { 
              id: data.user.id,
              email,
              name
            }
          ]);
          
        if (profileError) throw profileError;
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
  
  loadUser: async () => {
    try {
      set({ isLoading: true });
      
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (error) throw error;
        
        set({ 
          user: userData as User,
          isAuthenticated: true
        });
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));