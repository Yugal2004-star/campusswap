import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 min — data considered fresh, no refetch
      gcTime: 1000 * 60 * 10,         // 10 min — keep in cache after unused
      refetchOnWindowFocus: false,     // Don't refetch every time user switches tab
      refetchOnReconnect: false,       // Don't refetch on network reconnect
      retry: 1,                        // Only retry once on failure
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '12px' },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);