import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clientsService } from '../services/clients.service';
import type { Client } from '../types';
import { Button } from '@/components/ui/button';

export const Dashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientDescription, setNewClientDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Check authentication
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No authentication token found');
          window.location.href = '/login';
          return;
        }

        const data = await clientsService.getAll();
        setClients(data);
      } catch (error: any) {
        console.error('Failed to fetch clients:', error);
        if (error.response?.status === 401) {
          alert('Your session has expired. Please log in again.');
          window.location.href = '/login';
        } else {
          console.error('Error fetching clients:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    try {
      const newClient = await clientsService.create({
        name: newClientName,
        description: newClientDescription || undefined,
      });
      setClients([...clients, newClient]);
      setNewClientName('');
      setNewClientDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

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
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Clients</h1>
                <p className="text-slate-300">
                  Organize your projects by client. Click on a client to view their projects.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg"
                >
                  {showCreateForm ? 'Cancel' : 'New Client'}
                </Button>
              </div>
            </div>
          </div>

          {/* Create Client Form */}
          {showCreateForm && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter client name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newClientDescription}
                    onChange={(e) => setNewClientDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter client description"
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg"
                >
                  Create Client
                </Button>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {loading ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 shadow-2xl shadow-black/20">
                <div className="flex items-center justify-center">
                  <p className="text-slate-300">Loading clients...</p>
                </div>
              </div>
            ) : clients.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 shadow-2xl shadow-black/20 text-center">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">No clients yet</h3>
                <p className="mt-2 text-slate-300">
                  Get started by creating your first client folder.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20 flex flex-col h-full hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                          {client.name}
                        </h3>
                      </div>
                      {client.description && (
                        <p className="text-slate-300 text-sm">
                          {client.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        Created: {new Date(client.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <Button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white group-hover:bg-white/30 transition-all duration-300">
                        View Projects →
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