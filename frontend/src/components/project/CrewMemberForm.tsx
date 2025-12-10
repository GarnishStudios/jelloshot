import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { TimeInput12Hour } from "../ui/TimeInput12Hour";
import type { CrewMember } from "../../types";

interface CrewMemberFormProps {
  onSubmit: (member: Partial<CrewMember>) => void;
  onCancel: () => void;
  initialData?: Partial<CrewMember>;
  isOpen: boolean;
}

export const CrewMemberForm: React.FC<CrewMemberFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isOpen,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    role: initialData?.role || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    call_time: initialData?.call_time || "",
    allergies: initialData?.allergies || "",
    notes: initialData?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
      setFormData({
        name: "",
        role: "",
        email: "",
        phone: "",
        call_time: "",
        allergies: "",
        notes: "",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      role: "",
      email: "",
      phone: "",
      call_time: "",
      allergies: "",
      notes: "",
    });
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            {initialData ? "Edit Crew Member" : "Add Crew Member"}
          </h3>
          <button
            onClick={handleCancel}
            className="text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 backdrop-blur-sm"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 backdrop-blur-sm"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="e.g., Cinematographer, Sound Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 backdrop-blur-sm"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 backdrop-blur-sm"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Call Time
            </label>
            <TimeInput12Hour
              value={formData.call_time}
              onSave={(value) => setFormData({ ...formData, call_time: value })}
              placeholder="09:00 AM"
              className="w-full"
            />
            <p className="text-xs text-slate-400 mt-1">
              Specific call time for this crew member (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Allergies / Dietary Restrictions
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.allergies}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
              placeholder="e.g., Nuts, Dairy, Vegetarian"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes about this crew member..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
            >
              {initialData ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
