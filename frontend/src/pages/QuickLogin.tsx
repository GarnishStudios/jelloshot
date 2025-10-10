import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const QuickLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      // Login with the test user we created earlier
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'username=testuser2&password=testpassword123',
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        // Navigate to the shotlist page
        navigate('/projects/2aa0addf-0783-46ae-aed9-c9204a81f467/shotlist');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    try {
      // First login
      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'username=testuser2&password=testpassword123',
      });

      if (!loginResponse.ok) {
        alert('Login failed');
        return;
      }

      const loginData = await loginResponse.json();
      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('refresh_token', loginData.refresh_token);

      // Create a new project
      const projectResponse = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.access_token}`,
        },
        body: JSON.stringify({
          name: 'Test Project',
          description: 'A test project for shot list demo',
          start_time: '09:00',
          end_time: '17:00'
        }),
      });

      if (projectResponse.ok) {
        const projectData = await projectResponse.json();

        // Create a shotlist for the project
        const shotlistResponse = await fetch(`http://localhost:8000/api/projects/${projectData.id}/shotlists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.access_token}`,
          },
          body: JSON.stringify({
            name: 'Main Shotlist',
            call_time: '08:00',
            wrap_time: '18:00'
          }),
        });

        if (shotlistResponse.ok) {
          // Navigate to the new project's shotlist
          navigate(`/projects/${projectData.id}/shotlist`);
        } else {
          alert('Failed to create shotlist');
        }
      } else {
        alert('Failed to create project');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
          JelloShot Demo
        </h1>

        <div className="space-y-4">
          <button
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Quick Login & View Existing Project'}
          </button>

          <button
            onClick={handleCreateProject}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create New Project & Shotlist'}
          </button>
        </div>

        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>Test credentials: testuser2 / testpassword123</p>
          <p>Backend: http://localhost:8000</p>
          <p>Frontend: http://localhost:5175</p>
        </div>
      </div>
    </div>
  );
};