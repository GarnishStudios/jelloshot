import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ProjectForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shoot_date: '',
    location: '',
    director: '',
    producer: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        shoot_date: formData.shoot_date || null,
      };

      const response = await api.post('/api/projects', dataToSend);
      navigate(`/projects/${response.data.id}`);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-6 py-8 rounded-lg">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="input-field mt-1"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className="input-field mt-1"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="shoot_date" className="block text-sm font-medium text-gray-700">
            Shoot Date
          </label>
          <input
            type="date"
            name="shoot_date"
            id="shoot_date"
            className="input-field mt-1"
            value={formData.shoot_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            id="location"
            className="input-field mt-1"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="director" className="block text-sm font-medium text-gray-700">
              Director
            </label>
            <input
              type="text"
              name="director"
              id="director"
              className="input-field mt-1"
              value={formData.director}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="producer" className="block text-sm font-medium text-gray-700">
              Producer
            </label>
            <input
              type="text"
              name="producer"
              id="producer"
              className="input-field mt-1"
              value={formData.producer}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};