// contract/frontend/src/pages/Admin/RawMaterialLogs.js
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import MaterialLogForm from '../../components/supervisor/MaterialLogForm';
import { FaFilter, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const RawMaterialLogs = () => {
  const [materialLogs, setMaterialLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [filters, setFilters] = useState({ siteId: '', material: '', startDate: '', endDate: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterialLog, setSelectedMaterialLog] = useState(null);

  const fetchMaterialLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await API.get(`/materials?${params}`);
      setMaterialLogs(res.data);
    } catch (error) {
      toast.error('Failed to load material logs.');
      console.error('Error fetching material logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await API.get('/projects');
      setSites(res.data);
    } catch (error) {
      toast.error('Failed to load sites for filter.');
      console.error('Error fetching sites:', error);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchMaterialLogs();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchMaterialLogs();

  const resetFilters = () => {
    setFilters({ siteId: '', material: '', startDate: '', endDate: '' });
    fetchMaterialLogs();
  };

  const handleAddLog = () => {
    setSelectedMaterialLog(null);
    setIsModalOpen(true);
  };

  const handleEditLog = (log) => {
    setSelectedMaterialLog(log);
    setIsModalOpen(true);
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this material log?')) {
      try {
        await API.delete(`/materials/${id}`);
        toast.success('Material log deleted successfully!');
        fetchMaterialLogs();
      } catch (error) {
        toast.error(`Failed to delete material log: ${error.response?.data?.message || error.message}`);
        console.error('Error deleting material log:', error);
      }
    }
  };

  const handleSaveLog = () => {
    fetchMaterialLogs();
    setIsModalOpen(false);
  };

  const tableHeaders = ['Site', 'Material', 'Brand', 'Quantity', 'Unit', 'Price/Unit', 'Total Cost', 'Date', 'Recorded By', 'Actions'];

  if (loading) {
    return <div className="p-4 text-center">Loading raw material logs...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Raw Material Logs</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <FaFilter className="mr-2 text-indigo-600" /> Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site</label>
            <select
              name="siteId"
              value={filters.siteId}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">All Sites</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Material Name</label>
            <input
              type="text"
              name="material"
              value={filters.material}
              onChange={handleFilterChange}
              placeholder="e.g., Cement"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
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
          <FaPlus className="mr-2" /> Log New Material
        </button>
      </div>

      <Table
        headers={tableHeaders}
        data={materialLogs}
        emptyMessage="No material logs found for the selected criteria."
        renderRow={(log) => (
          <tr key={log._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {log.siteId?.name || 'N/A'}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {log.material}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {log.brand || 'N/A'}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {log.quantity}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {log.unit}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              ${log.pricePerUnit.toFixed(2)}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              ${log.total.toFixed(2)}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {new Date(log.date).toLocaleDateString()}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {log.recordedBy?.name || 'N/A'}
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
        title={selectedMaterialLog ? 'Edit Material Entry' : 'Log New Material'}
        size="md"
      >
        <MaterialLogForm
          materialEntry={selectedMaterialLog}
          onSave={handleSaveLog}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default RawMaterialLogs;