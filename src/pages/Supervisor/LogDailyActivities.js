// contract/frontend/src/pages/Supervisor/LogDailyActivities.js
import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import ActivityLogForm from '../../components/supervisor/ActivityLogForm';
import { FaFilter, FaPlus, FaEdit, FaTrash, FaClipboardList } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const LogDailyActivities = () => {
  const { user } = useContext(AuthContext);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [filters, setFilters] = useState({ siteId: '', startDate: '', endDate: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivityLog, setSelectedActivityLog] = useState(null);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await API.get(`/activities?${params}`);
      setActivityLogs(res.data);
    } catch (error) {
      toast.error('Failed to load activity logs.');
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySites = async () => {
    try {
      const res = await API.get('/supervisor/my-sites'); // Supervisor only sees their sites
      setSites(res.data);
      // If only one site is assigned, pre-select it
      if (res.data.length === 1) {
        setFilters(prev => ({ ...prev, siteId: res.data[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to load sites for filter.');
      console.error('Error fetching sites:', error);
    }
  };

  useEffect(() => {
    fetchMySites();
    // Delay initial fetch of activity logs until filters are potentially pre-filled
    const timer = setTimeout(() => {
        fetchActivityLogs();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Refetch activity logs whenever filters change, but not on initial load
    if (!loading) { // Prevent double fetch on initial load
        fetchActivityLogs();
    }
  }, [filters.siteId, filters.startDate, filters.endDate]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchActivityLogs();

  const resetFilters = () => {
    setFilters({ siteId: '', startDate: '', endDate: '' });
  };

  const handleAddLog = () => {
    setSelectedActivityLog(null);
    setIsModalOpen(true);
  };

  const handleEditLog = (log) => {
    setSelectedActivityLog(log);
    setIsModalOpen(true);
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity log?')) {
      try {
        await API.delete(`/activities/${id}`);
        toast.success('Activity log deleted successfully!');
        fetchActivityLogs();
      } catch (error) {
        toast.error(`Failed to delete activity log: ${error.response?.data?.message || error.message}`);
        console.error('Error deleting activity log:', error);
      }
    }
  };

  const handleSaveLog = () => {
    fetchActivityLogs();
    setIsModalOpen(false);
  };

  const tableHeaders = ['Site', 'Date', 'Message', 'Supervisor', 'Actions'];

  if (loading) {
    return <div className="p-4 text-center">Loading daily activity logs...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Log & View Daily Activities</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <FaFilter className="mr-2 text-indigo-600" /> Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site</label>
            <select
              name="siteId"
              value={filters.siteId}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">All My Sites</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="flex justify-end items-center mb-4">
        <button
          onClick={handleAddLog}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" /> Log New Activity
        </button>
      </div>

      <Table
        headers={tableHeaders}
        data={activityLogs}
        emptyMessage="No activity logs found for the selected criteria."
        renderRow={(log) => (
          <tr key={log._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {log.siteId?.name || 'N/A'}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {new Date(log.date).toLocaleDateString()}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {log.message}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {log.supervisorId?.name || 'N/A'}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2">
              <button
                onClick={() => handleEditLog(log)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteLog(log._id)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash />
              </button>
            </td>
          </tr>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedActivityLog ? 'Edit Activity Log' : 'Log New Activity'}
        size="md"
      >
        <ActivityLogForm
          activityLog={selectedActivityLog}
          onSave={handleSaveLog}
          onClose={() => setIsModalOpen(false)}
          siteId={filters.siteId} // Pass the currently selected siteId from filters if available
        />
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default LogDailyActivities;