import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ShotlistItem } from '../../types';
import { formatDuration } from '../../utils/timeCalculations';
import { shotlistItemsService } from '../../services/shotlist-items.service';

interface ShotlistItemCardProps {
  item: ShotlistItem;
  onUpdate: (id: string, updates: Partial<ShotlistItem>) => void;
  onDelete: (id: string) => void;
}

export const ShotlistItemCard: React.FC<ShotlistItemCardProps> = ({
  item,
  onUpdate,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    shot_name: item.shot_name,
    shot_details: item.shot_details || '',
    shot_duration: item.shot_duration,
    time_of_day: item.time_of_day || 'morning',
    notes: item.notes || ''
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(item.id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      shot_name: item.shot_name,
      shot_details: item.shot_details || '',
      shot_duration: item.shot_duration,
      time_of_day: item.time_of_day || 'morning',
      notes: item.notes || ''
    });
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await shotlistItemsService.uploadImage(item.id, file);
      onUpdate(item.id, { shot_reference_image: response.url });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const timeOfDayColors = {
    dawn: 'bg-purple-100 text-purple-800',
    morning: 'bg-yellow-100 text-yellow-800',
    afternoon: 'bg-blue-100 text-blue-800',
    evening: 'bg-orange-100 text-orange-800',
    night: 'bg-indigo-100 text-indigo-800'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="mr-3 mt-1 cursor-move text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="input-field"
                    value={editForm.shot_name}
                    onChange={(e) => setEditForm({ ...editForm, shot_name: e.target.value })}
                    placeholder="Shot name"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        value={editForm.shot_duration}
                        onChange={(e) => setEditForm({ ...editForm, shot_duration: parseInt(e.target.value) || 0 })}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Time of Day
                      </label>
                      <select
                        className="input-field"
                        value={editForm.time_of_day}
                        onChange={(e) => setEditForm({ ...editForm, time_of_day: e.target.value as any })}
                      >
                        <option value="dawn">Dawn</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.shot_name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {item.start_time && (
                        <span className="font-mono">{item.start_time}</span>
                      )}
                      <span>{formatDuration(item.shot_duration)}</span>
                      {item.time_of_day && (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${timeOfDayColors[item.time_of_day]}`}>
                          {item.time_of_day}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this shot?')) {
                      onDelete(item.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && !isEditing && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {item.shot_details && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Shot Details</h4>
                <p className="text-sm text-gray-600 mt-1">{item.shot_details}</p>
              </div>
            )}

            {item.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Reference Image</h4>
              {item.shot_reference_image ? (
                <div className="relative">
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${item.shot_reference_image}`}
                    alt="Shot reference"
                    className="rounded-lg max-w-full h-auto"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="mt-2 btn-secondary text-sm"
                  >
                    {uploadingImage ? 'Uploading...' : 'Change Image'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="btn-secondary text-sm"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary text-sm"
              >
                Edit Details
              </button>
            </div>
          </div>
        )}

        {/* Edit Form Expanded */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shot Details
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={editForm.shot_details}
                onChange={(e) => setEditForm({ ...editForm, shot_details: e.target.value })}
                placeholder="Describe the shot..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="input-field"
                rows={2}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};