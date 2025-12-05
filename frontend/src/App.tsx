import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { healthService } from './services/health.service';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ProjectForm } from './pages/ProjectForm';
import { ShotlistDetail } from './pages/ShotlistDetail';
import { ClientDetail } from './pages/ClientDetail';
import { Debug } from './pages/Debug';
import { QuickLogin } from './pages/QuickLogin';
import { PrivateRoute } from './components/PrivateRoute';

const queryClient = new QueryClient();

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { mode } = useThemeStore();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

  useEffect(() => {
    // Initialize theme on mount
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    // Check backend health on app startup
    const checkBackendHealth = async () => {
      const health = await healthService.checkHealth(5000);
      setBackendStatus(health.status);
      
      if (health.status === 'unhealthy') {
        console.warn('Backend health check failed:', health.message);
        // Optionally show a notification to the user
      }
    };

    checkBackendHealth();
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/debug" element={<Debug />} />
          <Route path="/quicklogin" element={<QuickLogin />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<Dashboard />} />
            <Route path="clients/:clientId" element={<ClientDetail />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/:id/shotlist" element={<ShotlistDetail />} />
            <Route path="projects/:id/edit" element={<ProjectForm />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App
