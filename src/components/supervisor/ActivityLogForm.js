// contract/frontend/src/components/supervisor/ActivityLogForm.js
import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const ActivityLogForm = ({ activityLog, onSave, onClose, siteId: initialSiteId }) => {
  const [formData, setFormData] = useState({
    siteId: initialSiteId || '',
    message: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [sites, setSites] = useState([]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await API.get('/projects'); // Supervisors get only their assigned sites from this endpoint
        setSites(res.data);
      } catch (error) {
        toast.error('Failed to load sites.');
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();

    if (activityLog) {
      setFormData({
        siteId: activityLog.siteId._id || activityLog.siteId,
        message: activityLog.message || '',
        date: activityLog.date ? new Date(activityLog.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData(prev => ({
        ...prev,
        siteId: initialSiteId || '', // Pre-fill site if coming from supervisor page
      }));
    }
  }, [activityLog, initialSiteId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (activityLog) {
        await API.put(`/activities/${activityLog._id}`, formData);
        toast.success('Activity log updated successfully!');
      } else {
        await API.post('/activities/log', formData);
        toast.success('Activity logged successfully!');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error(`Failed to save activity log: ${error.response?.data?.message || error.message}`);
      console.error('Error saving activity log:', error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Site Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Site</label>
        <select
          name="siteId"
          value={formData.siteId}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          disabled={!!initialSiteId && !activityLog} // Disable if initialSiteId is set and it's a new entry
        >
          <option value="">Select Site</option>
          {sites.map(site => (
            <option key={site._id} value={site._id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Activity Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="e.g., Slab completed on 2nd floor, Materials received, etc."
          required
        ></textarea>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {activityLog ? 'Update Log' : 'Log Activity'}
        </button>
      </div>
    </form>
  );
};

export default ActivityLogForm;