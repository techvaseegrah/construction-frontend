import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import WorkerForm from '../../components/admin/WorkerForm';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ManageWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/workers');
      setWorkers(res.data);
    } catch (error) {
      toast.error('Failed to load workers.');
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleAddWorker = () => {
    setSelectedWorker(null);
    setIsModalOpen(true);
  };

  const handleEditWorker = worker => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const handleDeleteWorker = async id => {
    const confirm = window.confirm(
      'Are you sure you want to delete this worker? This will also delete all their attendance, advance, and salary logs.'
    );
    if (!confirm) return;

    try {
      await API.delete(`/workers/${id}`);
      toast.success('Worker deleted successfully!');
      fetchWorkers();
    } catch (error) {
      toast.error(`Failed to delete worker: ${error.response?.data?.message || error.message}`);
      console.error('Error deleting worker:', error);
    }
  };

  const handleSaveWorker = () => {
    fetchWorkers();
    setIsModalOpen(false);
  };

  const tableHeaders = [
    'Name',
    'Role',
    'Base Daily Salary',
    'RFID ID',
    'Assigned Projects',
    'Actions',
  ];

  if (loading) {
    return <div className="p-4 text-center">Loading workers...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Workers</h2>
        <button
          onClick={handleAddWorker}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" /> Add New Worker
        </button>
      </div>

      <Table
        headers={tableHeaders}
        data={workers}
        renderRow={worker => (
          <tr key={worker._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {worker.name}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {worker.role}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              ${worker.baseSalary.toFixed(2)}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {worker.rfidId || 'N/A'}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {worker.assignedProjects && worker.assignedProjects.length > 0
                ? worker.assignedProjects.map(p => p.siteName).join(', ')
                : 'None'}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2">
              <button
                onClick={() => handleEditWorker(worker)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteWorker(worker._id)}
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
        title={selectedWorker ? 'Edit Worker' : 'Add New Worker'}
        size="xl"
      >
        <WorkerForm
          worker={selectedWorker}
          onSave={handleSaveWorker}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ManageWorkers;
