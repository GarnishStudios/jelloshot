import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  shoot_date: string | null;
}

export const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Check authentication
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No authentication token found');
          window.location.href = '/login';
          return;
        }

        const response = await api.get('/api/projects');
        setProjects(response.data);
      } catch (error: any) {
        console.error('Failed to fetch projects:', error);
        if (error.response?.status === 401) {
          alert('Your session has expired. Please log in again.');
          window.location.href = '/login';
        } else {
          console.error('Error fetching projects:', error);
          // Continue to show empty state instead of infinite loading
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 scrollbar-styled relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-500/5 via-cyan-500/5 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto p-6 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Projects</h1>
                <p className="text-slate-300">
                  Manage your production projects and call sheets.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button asChild className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg">
                  <Link to="/projects/new">New Project</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 shadow-2xl shadow-black/20">
                <div className="flex items-center justify-center">
                  <p className="text-slate-300">Loading projects...</p>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 shadow-2xl shadow-black/20 text-center">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">No projects yet</h3>
                <p className="mt-2 text-slate-300">
                  Get started by creating your first project.
                </p>
                <div className="mt-6">
                  <Button asChild className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg">
                    <Link to="/projects/new">Create Project</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20 flex flex-col h-full hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                        {project.name}
                      </h3>
                      <p className="text-slate-300">
                        {project.description}
                      </p>
                      {project.shoot_date && (
                        <p className="text-sm text-white font-medium">
                          Shoot Date: {new Date(project.shoot_date).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        Created: {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <Button asChild className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white group-hover:bg-white/30 transition-all duration-300">
                        <Link to={`/projects/${project.id}/shotlist`}>
                          See Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};