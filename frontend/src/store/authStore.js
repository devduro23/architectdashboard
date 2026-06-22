import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import client from '../api/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      architect: null,
      isLoading: false,
      error: null,

      login: async (mobile, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await client.post('/auth/login', { mobile, password });
          set({ architect: res.data.architect, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.error || 'Login failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      logout: async () => {
        try {
          await client.post('/auth/logout');
        } catch {}
        set({ architect: null });
        window.location.href = '/login';
      },

      fetchMe: async () => {
        try {
          const res = await client.get('/auth/me');
          set({ architect: res.data.architect });
        } catch {
          set({ architect: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'archportal-auth',
      partialize: (state) => ({ architect: state.architect }),
    }
  )
);

export default useAuthStore;
