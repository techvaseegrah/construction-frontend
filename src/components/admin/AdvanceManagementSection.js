// construction/frontend/src/components/admin/AdvanceManagementSection.js
import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import Table from '../common/Table';
import Modal from '../common/Modal';
import AdvanceForm from '../supervisor/AdvanceForm'; // Reusing supervisor's form (it's generic)
import { FaFilter, FaPlus, FaEdit, FaTrash, FaMoneyBillAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const AdvanceManagementSection = ({ siteId }) => {
  const { user } = useContext(AuthContext);
  const [advanceLogs, setAdvanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]); // Workers assigned to this specific site
  const [filters, setFilters] = useState({ workerId: '', startDate: '', endDate: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);

  const fetchAdvanceLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...filters, siteId }).toString();
      const res = await API.get(`/advances?${params}`); // Backend handles admin permissions
      setAdvanceLogs(res.data);
    } catch (error) {
      toast.error('Failed to load advance logs for this project.');
      console.error('Error fetching advance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteWorkers = async () => {
    try {
      const res = await API.get(`/projects/${siteId}`); // Fetch the specific site to get its assigned workers
      const assignedWorkersData = res.data.assignedWorkers.map(assignment => ({
        _id: assignment.workerId._id,
        name: assignment.workerId.name,
        role: assignment.workerId.role
      }));
      setWorkers(assignedWorkersData);
    } catch (error) {
      toast.error('Failed to load workers for this project.');
      console.error('Error fetching site workers:', error);
    }
  };

  useEffect(() => {
    if (siteId) {
      fetchSiteWorkers();
      fetchAdvanceLogs();
    }
  }, [siteId, filters.workerId, filters.startDate, filters.endDate]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchAdvanceLogs();

  const resetFilters = () => {
    setFilters({ workerId: '', startDate: '', endDate: '' });
  };

  const handleAddAdvance = () => {
    setSelectedAdvance(null);
    setIsModalOpen(true);
  };

  const handleEditAdvance = (advance) => {
    setSelectedAdvance(advance);
    setIsModalOpen(true);
  };

  const handleDeleteAdvance = async (id) => {
    if (window.confirm('Are you sure you want to delete this advance entry?')) {
      try {
        await API.delete(`/advances/${id}`);
        toast.success('Advance entry deleted successfully!');
        fetchAdvanceLogs();
      } catch (error) {
        toast.error(`Failed to delete advance: ${error.response?.data?.message || error.message}`);
        console.error('Error deleting advance:', error);
      }
    }
  };

  const handleSaveAdvance = () => {
    fetchAdvanceLogs();
    setIsModalOpen(false);
  };

  const tableHeaders = ['Worker Name', 'Amount', 'Date', 'Reason', 'Recorded By', 'Actions'];

  if (loading) {
    return <div className="p-4 text-center">Loading advance logs...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaMoneyBillAlt className="mr-2 text-yellow-600" /> Advance Payments
      </h3>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <FaFilter className="mr-2 text-indigo-600" /> Filters
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Worker</label>
            <select
              name="workerId"
              value={filters.workerId}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">All Workers</option>
              {workers.map(worker => (
                <option key={worker._id} value={worker._id}>{worker.name} ({worker.role})</option>
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
          <button onClick={applyFilters} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
            Reset Filters
          </button>
        </div>
      </div>

      <div className="flex justify-end items-center mb-4">
        <button onClick={handleAddAdvance} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700">
          <FaPlus className="mr-2" /> Add New Advance
        </button>
      </div>

      <Table
        headers={tableHeaders}
        data={advanceLogs}
        emptyMessage="No advance payment logs found for this project with the selected criteria."
        renderRow={log => (
          <tr key={log._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.workerId?.name || 'N/A'}</td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">${log.amount.toFixed(2)}</td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{new Date(log.date).toLocaleDateString()}</td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.reason}</td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.recordedBy?.name || 'N/A'}</td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2">
              <button onClick={() => handleEditAdvance(log)} className="text-blue-600 hover:text-blue-800">
                <FaEdit />
              </button>
              <button onClick={() => handleDeleteAdvance(log._id)} className="text-red-600 hover:text-red-800">
                <FaTrash />
              </button>
            </td>
          </tr>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAdvance ? 'Edit Advance Entry' : 'Add New Advance Entry'}
        size="md"
      >
        <AdvanceForm
          advanceEntry={selectedAdvance}
          onSave={handleSaveAdvance}
          onClose={() => setIsModalOpen(false)}
          siteId={siteId} // Pass the siteId from props
        />
      </Modal>
    </div>
  );
};

export default AdvanceManagementSection;