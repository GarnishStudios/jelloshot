import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Project } from "../../types";
import { projectsService } from "../../services/projects.service";
import { formatTimeTo12Hour } from "../../utils/timeCalculations";
import { InlineEdit } from "../ui/InlineEdit";
import { TimeInput12Hour } from "../ui/TimeInput12Hour";

interface ProjectDetailsSectionProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
  onTimeChange?: (startTime: string, endTime: string) => void;
}

export const ProjectDetailsSection: React.FC<ProjectDetailsSectionProps> = ({
  project,
  onUpdate,
  onTimeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const handleFieldUpdate = async (field: keyof Project, value: string) => {
    try {
      const updatedProject = await projectsService.updateProject(project.id, {
        [field]: value || null,
      });
      onUpdate(updatedProject);

      // Notify parent if start_time or end_time changed
      if ((field === "start_time" || field === "end_time") && onTimeChange) {
        onTimeChange(
          updatedProject.start_time || "",
          updatedProject.end_time || "",
        );
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      alert(`Failed to update ${field}`);
    }
  };

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mb-8 transition-all duration-200 shadow-2xl shadow-black/20 ${
        isExpanded ? "p-8" : "p-6"
      }`}
    >
      <div className={isExpanded ? "mb-8" : "mb-0"}>
        <div className="flex items-center justify-between">
          <h2
            className={`text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent transition-all duration-200 ${
              isExpanded ? "mb-2" : "mb-0"
            }`}
          >
            Project Details
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-md"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expand
              </>
            )}
          </button>
        </div>

        {/* Quick summary when collapsed */}
        {!isExpanded && (
          <div className="mt-3 text-sm text-slate-300">
            <div className="flex flex-wrap gap-4">
              {project.name && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Project:</span>
                  <span>{project.name}</span>
                </span>
              )}
              {project.shoot_date && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Date:</span>
                  <span>
                    {new Date(project.shoot_date).toLocaleDateString()}
                  </span>
                </span>
              )}
              {project.start_time && project.end_time && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Time:</span>
                  <span>
                    {formatTimeTo12Hour(project.start_time)} -{" "}
                    {formatTimeTo12Hour(project.end_time)}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {/* 2x3 Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Project Name
                </label>
                <InlineEdit
                  value={project.name}
                  onSave={(value) => handleFieldUpdate("name", value)}
                  placeholder="Major Brand Commercial"
                  className="w-full"
                />
              </div>

              {/* Call Time */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Call Time
                </label>
                <InlineEdit
                  value={project.call_time || ""}
                  onSave={(value) => handleFieldUpdate("call_time", value)}
                  placeholder="09:00"
                  type="time"
                  className="w-full"
                />
                {project.call_time && (
                  <p className="text-xs text-slate-400 mt-2">
                    {formatTimeTo12Hour(project.call_time)}
                  </p>
                )}
              </div>

              {/* Shoot Address */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Shoot Address
                </label>
                <InlineEdit
                  value={project.location || ""}
                  onSave={(value) => handleFieldUpdate("location", value)}
                  placeholder="Full address for crew directions"
                  className="w-full"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Client Name
                </label>
                <InlineEdit
                  value={project.production_company || ""}
                  onSave={(value) =>
                    handleFieldUpdate("production_company", value)
                  }
                  placeholder="Client or company name"
                  className="w-full"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Start Time{" "}
                  <span className="text-xs text-slate-400">
                    (controls first shot)
                  </span>
                </label>
                <TimeInput12Hour
                  value={project.start_time || ""}
                  onSave={(value) => handleFieldUpdate("start_time", value)}
                  placeholder="09:00 AM"
                  className="w-full"
                />
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Location Type
                </label>
                <InlineEdit
                  value={project.description || ""}
                  onSave={(value) => handleFieldUpdate("description", value)}
                  placeholder="Studio with controlled lighting setup"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Additional Row for Shoot Date and End Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Shoot Date */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">
                Shoot Date
              </label>
              <InlineEdit
                value={
                  project.shoot_date ? project.shoot_date.split("T")[0] : ""
                }
                onSave={(value) => handleFieldUpdate("shoot_date", value)}
                placeholder="12/01/2023"
                type="date"
                className="w-full"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">
                End Time
              </label>
              <TimeInput12Hour
                value={project.end_time || ""}
                onSave={(value) => handleFieldUpdate("end_time", value)}
                placeholder="05:30 PM"
                className="w-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
