import { create } from 'zustand';

interface AppState {
  token: string | null;
  setToken: (token: string | null) => void;
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
  report: null,
  setReport: (report) => set({ report }),
}));
