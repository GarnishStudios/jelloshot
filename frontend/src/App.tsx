import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ProjectForm } from './pages/ProjectForm';
import { ShotlistDetail } from './pages/ShotlistDetail';
import { Debug } from './pages/Debug';
import { QuickLogin } from './pages/QuickLogin';
import { PrivateRoute } from './components/PrivateRoute';

const queryClient = new QueryClient();

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
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
