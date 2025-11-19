import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const OpportunityForm = ({ initialData = {}, onSubmit, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    deadline: '',
    category: 'internship',
    status: 'applied',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Populate form with initial data if editing
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        link: initialData.link || '',
        deadline: initialData.deadline || '',
        category: initialData.category || 'internship',
        status: initialData.status || 'applied',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.title ? 'border-red-500' : 'border-white/10'
            }`}
          placeholder="e.g., React Intern at ABC Company"
        />
        {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Brief description of the opportunity"
        />
      </div>

      {/* Link */}
      <div>
        <label htmlFor="link" className="block text-sm font-medium text-gray-200 mb-1">
          Link
        </label>
        <input
          type="url"
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="https://example.com/apply"
        />
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-200 mb-1">
          Deadline <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.deadline ? 'border-red-500' : 'border-white/10'
            }`}
        />
        {errors.deadline && <p className="text-red-400 text-sm mt-1">{errors.deadline}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Category <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="category"
              value="internship"
              checked={formData.category === 'internship'}
              onChange={handleChange}
              className="mr-2 w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-300">Internship</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="category"
              value="hackathon"
              checked={formData.category === 'hackathon'}
              onChange={handleChange}
              className="mr-2 w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-300">Hackathon</span>
          </label>
        </div>
        {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-200 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interviewed">Interviewed</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-200 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Additional notes or preparation tasks"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
          {isEdit ? 'Update Opportunity' : 'Create Opportunity'}
        </Button>
      </div>
    </form>
  );
};

export default OpportunityForm;
