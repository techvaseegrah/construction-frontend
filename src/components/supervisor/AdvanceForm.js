// contract/frontend/src/components/supervisor/AdvanceForm.js
import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const AdvanceForm = ({ advanceEntry, onSave, onClose, siteId: initialSiteId }) => {
  const [formData, setFormData] = useState({
    siteId: initialSiteId || '',
    workerId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    const fetchSitesAndWorkers = async () => {
      try {
        const sitesRes = await API.get('/projects');
        setSites(sitesRes.data);

        // If an initial siteId is provided (e.g., from supervisor's my-sites)
        if (initialSiteId) {
          const siteDetail = sitesRes.data.find(s => s._id === initialSiteId);
          if (siteDetail && siteDetail.assignedWorkers) {
            // Fetch detailed worker info for assigned workers
            const workerDetailsPromises = siteDetail.assignedWorkers.map(aw =>
              API.get(`/workers/${aw.workerId._id}`)
            );
            const workerDetailsResponses = await Promise.all(workerDetailsPromises);
            setWorkers(workerDetailsResponses.map(res => res.data));
          }
        } else {
          // Otherwise, fetch all workers (for admin)
          const workersRes = await API.get('/workers');
          setWorkers(workersRes.data);
        }
      } catch (error) {
        toast.error('Failed to load sites or workers.');
        console.error('Error fetching data:', error);
      }
    };

    fetchSitesAndWorkers();

    if (advanceEntry) {
      setFormData({
        siteId: advanceEntry.siteId._id || advanceEntry.siteId,
        workerId: advanceEntry.workerId._id || advanceEntry.workerId,
        amount: advanceEntry.amount || '',
        date: advanceEntry.date ? new Date(advanceEntry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reason: advanceEntry.reason || '',
      });
    } else {
      setFormData(prev => ({
        ...prev,
        siteId: initialSiteId || '', // Pre-fill site if coming from supervisor page
      }));
    }
  }, [advanceEntry, initialSiteId]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // If siteId changes, fetch workers for that specific site
    if (name === 'siteId' && value) {
      try {
        const siteRes = await API.get(`/projects/${value}`);
        const siteWorkers = siteRes.data.assignedWorkers;

        const workerDetailsPromises = siteWorkers.map(aw =>
          API.get(`/workers/${aw.workerId._id}`)
        );
        const workerDetailsResponses = await Promise.all(workerDetailsPromises);
        setWorkers(workerDetailsResponses.map(res => res.data));

        // Reset workerId if site changes
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
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (advanceEntry) {
        await API.put(`/advances/${advanceEntry._id}`, payload);
        toast.success('Advance entry updated successfully!');
      } else {
        await API.post('/advances/log', payload);
        toast.success('Advance entry logged successfully!');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error(`Failed to save advance: ${error.response?.data?.message || error.message}`);
      console.error('Error saving advance:', error.response?.data || error.message);
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
          disabled={!!initialSiteId && !advanceEntry} 
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

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          min="0"
          step="0.01"
        />
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

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
          {advanceEntry ? 'Update Advance' : 'Log Advance'}
        </button>
      </div>
    </form>
  );
};

export default AdvanceForm;