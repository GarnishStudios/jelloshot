import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import { LoginForm } from "./components/auth/LoginForm";
import { Layout } from "./components/layout/Layout";
import { Clients } from "./pages/Clients";
import { ShotlistDetail } from "./pages/ShotlistDetail";
import { ClientDetail } from "./pages/ClientDetail";
import { PrivateRoute } from "./components/PrivateRoute";
import axios from "axios";

const queryClient = new QueryClient();

function App() {
  axios.defaults.withCredentials = true;

  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { mode } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [mode]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/clients" replace />} />
            <Route path="clients/:clientId" element={<ClientDetail />} />
            <Route path="clients" element={<Clients />} />
            <Route path="projects/:id/shotlist" element={<ShotlistDetail />} />
            <Route path="*" element={<Navigate to="/clients" replace />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
