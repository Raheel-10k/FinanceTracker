import { create } from 'zustand';

interface AppState {
  token: string | null;
  setToken: (token: string | null) => void;
  user: { email: string } | null;
  setUser: (user: { email: string } | null) => void;
  report: any | null;
  setReport: (report: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  token: localStorage.getItem('token') || null,
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  setUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    set({ user });
  },
  report: null,
  setReport: (report) => set({ report }),
}));
