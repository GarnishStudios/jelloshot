import React, { useState } from 'react';
import type { ShotlistItem } from '../../types';

interface ShotlistItemFormProps {
  onSubmit: (item: Partial<ShotlistItem>) => void;
  onCancel: () => void;
  initialData?: Partial<ShotlistItem>;
}

export const ShotlistItemForm: React.FC<ShotlistItemFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState({
    shot_name: initialData?.shot_name || '',
    shot_details: initialData?.shot_details || '',
    shot_duration: initialData?.shot_duration || 10,
    time_of_day: initialData?.time_of_day || 'morning' as const,
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {initialData ? 'Edit Shot' : 'Add New Shot'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Shot Name *
            </label>
            <input
              type="text"
              required
              className="input-field mt-1"
              value={formData.shot_name}
              onChange={(e) => setFormData({ ...formData, shot_name: e.target.value })}
              placeholder="e.g., Wide establishing shot"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes) *
            </label>
            <input
              type="number"
              required
              min="1"
              className="input-field mt-1"
              value={formData.shot_duration}
              onChange={(e) => setFormData({ ...formData, shot_duration: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Time of Day
          </label>
          <select
            className="input-field mt-1"
            value={formData.time_of_day}
            onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value as any })}
          >
            <option value="dawn">Dawn</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Shot Details
          </label>
          <textarea
            className="input-field mt-1"
            rows={3}
            value={formData.shot_details}
            onChange={(e) => setFormData({ ...formData, shot_details: e.target.value })}
            placeholder="Describe the shot, camera angle, movement, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            className="input-field mt-1"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes, equipment needed, etc."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {initialData ? 'Save Changes' : 'Add Shot'}
          </button>
        </div>
      </form>
    </div>
  );
};