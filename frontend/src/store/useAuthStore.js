import { create } from 'zustand';
import { authAPI } from '../services/api';

const mapUser = (u) => {
  if (!u) return null;
  return { ...u, id: u.id || u._id };
};

const useAuthStore = create((set) => ({
  user: mapUser(JSON.parse(localStorage.getItem('user'))),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const data = await authAPI.login(credentials);
      
      const mappedUser = mapUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      
      set({
        user: mappedUser,
        token: data.token,
        isAuthenticated: true,
        loading: false
      });
      
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      const data = await authAPI.register(userData);
      
      const mappedUser = mapUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      
      set({
        user: mappedUser,
        token: data.token,
        isAuthenticated: true,
        loading: false
      });
      
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  },

  updateUser: (userData) => {
    const updatedUser = mapUser({ ...useAuthStore.getState().user, ...userData });
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  setUser: (userData) => {
    const mappedUser = mapUser(userData);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    set({ user: mappedUser });
  }
}));

export default useAuthStore;

