import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const AttendanceForm = ({ onSave, onClose, siteId: initialSiteId, workers: initialWorkers }) => {
  const [formData, setFormData] = useState({
    siteId: initialSiteId || '',
    workerId: '',
    date: new Date().toISOString().split('T')[0],
    shiftType: '',
  });

  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);

  const shiftTypes = [
    { label: 'Full Day', value: 'Full Day' },
    { label: 'One-and-a-Half Day', value: 'One-and-a-Half Day' },
    { label: 'Half Day Morning', value: 'Half Day Morning' },
    { label: 'Half Day Evening', value: 'Half Day Evening' },
  ];

  useEffect(() => {
    const fetchSitesAndWorkers = async () => {
      try {
        const sitesRes = await API.get('/projects');
        setSites(sitesRes.data);

        if (initialSiteId) {
          const siteDetail = sitesRes.data.find(s => s._id === initialSiteId);
          if (siteDetail && siteDetail.assignedWorkers) {
            const workerDetailsPromises = siteDetail.assignedWorkers.map(aw =>
              API.get(`/workers/${aw.workerId._id}`)
            );
            const workerDetailsResponses = await Promise.all(workerDetailsPromises);
            setWorkers(workerDetailsResponses.map(res => res.data));
          }
        } else {
          const workersRes = await API.get('/workers');
          setWorkers(workersRes.data);
        }
      } catch (error) {
        toast.error('Failed to load sites or workers.');
        console.error('Error fetching data:', error);
      }
    };

    fetchSitesAndWorkers();
  }, [initialSiteId]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'siteId' && value) {
      try {
        const siteRes = await API.get(`/projects/${value}`);
        const siteWorkers = siteRes.data.assignedWorkers;

        const workerDetailsPromises = siteWorkers.map(aw =>
          API.get(`/workers/${aw.workerId._id}`)
        );
        const workerDetailsResponses = await Promise.all(workerDetailsPromises);
        setWorkers(workerDetailsResponses.map(res => res.data));

        setFormData(prev => ({
          ...prev,
          workerId: '',
        }));
      } catch (error) {
        toast.error('Failed to load workers for selected site.');
        console.error('Error fetching site workers:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/attendance/mark', formData);
      toast.success('Attendance marked successfully!');
      onSave();
      onClose();
    } catch (error) {
      toast.error(`Failed to mark attendance: ${error.response?.data?.message || error.message}`);
      console.error('Error marking attendance:', error.response?.data || error.message);
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
          disabled={!!initialSiteId}
        >
          <option value="">Select Site</option>
          {sites.map(site => (
            <option key={site._id} value={site._id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      {/* Worker Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Worker</label>
        <select
          name="workerId"
          value={formData.workerId}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          disabled={!formData.siteId}
        >
          <option value="">Select Worker</option>
          {workers.map(worker => (
            <option key={worker._id} value={worker._id}>
              {worker.name} ({worker.role})
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

      {/* Shift Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Shift Type</label>
        <select
          name="shiftType"
          value={formData.shiftType}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        >
          <option value="">Select Shift</option>
          {shiftTypes.map(shift => (
            <option key={shift.value} value={shift.value}>
              {shift.label}
            </option>
          ))}
        </select>
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
          Mark Attendance
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm;
