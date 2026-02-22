import axios from 'axios';
import { supabase } from '../utils/supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
});

// Strip empty/null/undefined params before every request
api.interceptors.request.use(async (config) => {
  // Clean up empty query params so they don't pollute the URL
  if (config.params) {
    const cleaned = {};
    for (const [key, val] of Object.entries(config.params)) {
      if (val !== '' && val !== null && val !== undefined) {
        cleaned[key] = val;
      }
    }
    config.params = cleaned;
  }

  // Attach Supabase JWT
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;