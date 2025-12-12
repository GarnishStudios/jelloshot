import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCallSheetAPI } from "@/type-gen/api";
import type { Project } from "@/type-gen/api";
import type { Shotlist } from "@/type-gen/api";

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [shotlists, setShotlists] = useState<Shotlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewShotlistForm, setShowNewShotlistForm] = useState(false);
  const [newShotlist, setNewShotlist] = useState({
    name: "",
    shooting_date: "",
    call_time: "08:00",
    wrap_time: "18:00",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      if (id) {
        const [{ data: projectData }, { data: shotlistsData }] =
          await Promise.all([
            getCallSheetAPI().readProjectApiProjectsProjectIdGet(id),
            getCallSheetAPI().readShotlistsApiProjectsProjectIdShotlistsGet(id),
          ]);
        setProject(projectData);
        setShotlists(shotlistsData);
      }
    } catch (error: any) {
      console.error("Failed to fetch project details:", error);
      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        window.location.href = "/login";
      } else if (error.response?.status === 404) {
        setProject(null); // This will show "Project not found"
      } else {
        console.error("Error fetching project:", error);
        // Still set loading to false to show some content instead of infinite loading
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShotlist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        const { data: createdShotlist } =
          await getCallSheetAPI().createShotlistApiProjectsProjectIdShotlistsPost(
            id,
            newShotlist,
          );
        setShotlists([...shotlists, createdShotlist]);
        setShowNewShotlistForm(false);
        setNewShotlist({
          name: "",
          shooting_date: "",
          call_time: "08:00",
          wrap_time: "18:00",
          location: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Failed to create shotlist:", error);
    }
  };

  const handleDeleteShotlist = async (shotlistId: string) => {
    if (confirm("Are you sure you want to delete this shotlist?")) {
      try {
        await getCallSheetAPI().deleteShotlistApiShotlistsShotlistIdDelete(
          shotlistId,
        );
        setShotlists(shotlists.filter((s) => s.id !== shotlistId));
      } catch (error) {
        console.error("Failed to delete shotlist:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading project...</div>;
  }

  if (!project) {
    return <div className="text-center py-8">Project not found</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Project Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-2 text-gray-600">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              {project.director && (
                <div>
                  <span className="font-medium">Director:</span>{" "}
                  {project.director}
                </div>
              )}
              {project.producer && (
                <div>
                  <span className="font-medium">Producer:</span>{" "}
                  {project.producer}
                </div>
              )}
              {project.location && (
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {project.location}
                </div>
              )}
              {project.shoot_date && (
                <div>
                  <span className="font-medium">Shoot Date:</span>{" "}
                  {new Date(project.shoot_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to={`/projects/${id}/edit`} className="btn-secondary">
              Edit Project
            </Link>
          </div>
        </div>
      </div>

      {/* Shotlists Section */}
      <div>
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Shot Lists</h2>
          <button
            onClick={() => setShowNewShotlistForm(true)}
            className="btn-primary mt-4 sm:mt-0"
          >
            New Shot List
          </button>
        </div>

        {/* New Shotlist Form */}
        {showNewShotlistForm && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Create New Shot List</h3>
            <form onSubmit={handleCreateShotlist} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field mt-1"
                    value={newShotlist.name}
                    onChange={(e) =>
                      setNewShotlist({ ...newShotlist, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shooting Date
                  </label>
                  <input
                    type="date"
                    className="input-field mt-1"
                    value={newShotlist.shooting_date}
                    onChange={(e) =>
                      setNewShotlist({
                        ...newShotlist,
                        shooting_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Call Time
                  </label>
                  <input
                    type="time"
                    className="input-field mt-1"
                    value={newShotlist.call_time}
                    onChange={(e) =>
                      setNewShotlist({
                        ...newShotlist,
                        call_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Wrap Time
                  </label>
                  <input
                    type="time"
                    className="input-field mt-1"
                    value={newShotlist.wrap_time}
                    onChange={(e) =>
                      setNewShotlist({
                        ...newShotlist,
                        wrap_time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  className="input-field mt-1"
                  value={newShotlist.location}
                  onChange={(e) =>
                    setNewShotlist({ ...newShotlist, location: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  className="input-field mt-1"
                  rows={3}
                  value={newShotlist.notes}
                  onChange={(e) =>
                    setNewShotlist({ ...newShotlist, notes: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowNewShotlistForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Shot List
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Shotlists Grid */}
        {shotlists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900">
              No shot lists yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first shot list to start organizing your shots.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shotlists.map((shotlist) => (
              <div key={shotlist.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {shotlist.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteShotlist(shotlist.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {shotlist.shooting_date && (
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(shotlist.shooting_date).toLocaleDateString()}
                    </div>
                  )}
                  {shotlist.call_time && (
                    <div>
                      <span className="font-medium">Call Time:</span>{" "}
                      {shotlist.call_time}
                    </div>
                  )}
                  {shotlist.location && (
                    <div>
                      <span className="font-medium">Location:</span>{" "}
                      {shotlist.location}
                    </div>
                  )}
                  {shotlist.notes && (
                    <div className="text-gray-500 italic">{shotlist.notes}</div>
                  )}
                </div>

                <Link
                  to={`/shotlists/${shotlist.id}`}
                  className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-500"
                >
                  View Details
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
