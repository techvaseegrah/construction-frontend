// construction/frontend/src/components/supervisor/ActivityLogSection.js
import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import Table from '../common/Table';
import Modal from '../common/Modal';
import ActivityLogForm from './ActivityLogForm'; // Reusing existing form
import { FaFilter, FaPlus, FaEdit, FaTrash, FaClipboardList } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const ActivityLogSection = ({ siteId }) => {
  const { user } = useContext(AuthContext);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivityLog, setSelectedActivityLog] = useState(null);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...filters, siteId }).toString();
      const res = await API.get(`/activities?${params}`);
      setActivityLogs(res.data);
    } catch (error) {
      toast.error('Failed to load activity logs for this site.');
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) {
      fetchActivityLogs();
    }
  }, [siteId, filters.startDate, filters.endDate]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchActivityLogs();

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '' });
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

  const tableHeaders = ['Date', 'Message', 'Supervisor', 'Actions'];

  if (loading) {
    return <div className="p-4 text-center">Loading daily activity logs...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaClipboardList className="mr-2 text-purple-600" /> Daily Activities Logs
      </h3>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <FaFilter className="mr-2 text-indigo-600" /> Filters
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        emptyMessage="No activity logs found for this site with the selected criteria."
        renderRow={(log) => (
          <tr key={log._id} className="hover:bg-gray-50">
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
          siteId={siteId} // Pass the siteId from props
        />
      </Modal>
    </div>
  );
};

export default ActivityLogSection;