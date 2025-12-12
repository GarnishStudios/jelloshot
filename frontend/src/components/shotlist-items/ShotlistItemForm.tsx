import React, { useState } from "react";
import type { ShotlistItem } from "@/type-gen/api";

interface ShotlistItemFormProps {
  onSubmit: (item: Partial<ShotlistItem>) => void;
  onCancel: () => void;
  initialData?: Partial<ShotlistItem>;
}

export const ShotlistItemForm: React.FC<ShotlistItemFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    shot_name: initialData?.shot_name || "",
    shot_description: initialData?.shot_description || "",
    shot_duration: initialData?.shot_duration || 10,
    scheduled_time: initialData?.scheduled_time || "",
    notes: initialData?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-white mb-4">
        {initialData ? "Edit Shot" : "Add New Shot"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Shot Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
              value={formData.shot_name}
              onChange={(e) =>
                setFormData({ ...formData, shot_name: e.target.value })
              }
              placeholder="e.g., Wide establishing shot"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              required
              min="1"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
              value={formData.shot_duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shot_duration: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Scheduled Time (Optional)
          </label>
          <input
            type="time"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
            value={formData.scheduled_time}
            onChange={(e) =>
              setFormData({ ...formData, scheduled_time: e.target.value })
            }
            placeholder="HH:MM"
          />
          <p className="text-xs text-slate-400 mt-1">
            Set a specific time for this shot (separate from calculated start
            time)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Shot Details
          </label>
          <textarea
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
            rows={3}
            value={formData.shot_description}
            onChange={(e) =>
              setFormData({ ...formData, shot_description: e.target.value })
            }
            placeholder="Describe the shot, camera angle, movement, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notes
          </label>
          <textarea
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
            rows={2}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Additional notes, equipment needed, etc."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-md font-medium transition-colors backdrop-blur-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {initialData ? "Save Changes" : "Add Shot"}
          </button>
        </div>
      </form>
    </div>
  );
};
