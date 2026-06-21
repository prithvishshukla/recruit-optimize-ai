import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { GlobalErrorBoundary } from '@/components/global-error-boundary';

// Import styles first
import './styles.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

const queryClient = new QueryClient();

// Create router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render app
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
