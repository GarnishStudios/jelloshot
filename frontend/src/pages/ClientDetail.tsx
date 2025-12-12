import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  SortSelector,
  type SortOption,
  type SortOrder,
} from "@/components/ui/SortSelector";
import { getCallSheetAPI } from "@/type-gen/api";
import type { Client } from "@/type-gen/api";
import type { Project } from "@/type-gen/api";

export const ClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    if (!clientId) return;

    const fetchData = async () => {
      try {
        const [{ data: clientData }, { data: projectsData }] =
          await Promise.all([
            getCallSheetAPI().readClientApiClientsClientIdGet(clientId),
            getCallSheetAPI().readProjectsApiProjectsGet(),
          ]);
        setClient(clientData);
        // Filter projects for this client
        const clientProjects = projectsData.filter(
          (p) => p.client_id === clientId,
        );
        setProjects(clientProjects);
      } catch (error: any) {
        console.error("Failed to fetch client data:", error);
        if (error.response?.status === 404) {
          navigate("/clients");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId, navigate]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !clientId) return;

    try {
      const { data: newProject } =
        await getCallSheetAPI().createProjectApiProjectsPost({
          name: newProjectName,
          client_id: clientId,
        });
      setProjects([...projects, newProject]);
      setNewProjectName("");
      setShowCreateForm(false);
      // Navigate directly to shotlist creator for the new project
      navigate(`/projects/${newProject.id}/shotlist`);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleQuickCreateProject = async () => {
    if (!clientId) return;
    setShowCreateForm(true);
    // Focus will be on the input field when form appears
  };

  // Sort projects based on selected option and order
  const sortedProjects = useMemo(() => {
    const sorted = [...projects];

    if (sortOption === "date") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortOption === "name") {
      sorted.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (sortOrder === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }

    return sorted;
  }, [projects, sortOption, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-slate-300">Client not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 scrollbar-styled relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-500/5 via-cyan-500/5 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/clients")}
                    className="text-slate-300 hover:text-white"
                  >
                    ← Back
                  </Button>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                    {client.name}
                  </h1>
                </div>
                {client.description && (
                  <p className="text-slate-300">{client.description}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg"
                >
                  {showCreateForm ? "Cancel" : "New Project"}
                </Button>
              </div>
            </div>
          </div>

          {/* Create Project Form */}
          {showCreateForm && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter project name"
                    required
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg"
                >
                  Create Project
                </Button>
              </form>
            </div>
          )}

          {/* Projects List */}
          <div className="space-y-6">
            {projects.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 shadow-2xl shadow-black/20 text-center">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  No projects yet
                </h3>
                <p className="mt-2 text-slate-300 mb-6">
                  Get started by creating your first project for {client.name}.
                </p>
                <Button
                  onClick={handleQuickCreateProject}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg"
                >
                  Add New Project
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-end">
                  <SortSelector
                    value={sortOption}
                    order={sortOrder}
                    onSortChange={setSortOption}
                    onOrderChange={setSortOrder}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() =>
                        navigate(`/projects/${project.id}/shotlist`)
                      }
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20 flex flex-col h-full hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex-1 space-y-3">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-slate-300">
                            {project.description}
                          </p>
                        )}
                        {project.shoot_date && (
                          <p className="text-sm text-white font-medium">
                            Shoot Date:{" "}
                            {new Date(project.shoot_date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          Created:{" "}
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/20">
                        <Button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white group-hover:bg-white/30 transition-all duration-300">
                          View Project →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
