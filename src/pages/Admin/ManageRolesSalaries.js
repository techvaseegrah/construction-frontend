import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ManageRolesSalaries = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ roleName: '', defaultSalary: '' });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await API.get('/roles');
      setRoles(res.data);
    } catch (error) {
      toast.error('Failed to load roles.');
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = () => {
    setSelectedRole(null);
    setFormData({ roleName: '', defaultSalary: '' });
    setIsModalOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setFormData({ roleName: role.roleName, defaultSalary: role.defaultSalary });
    setIsModalOpen(true);
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await API.delete(`/roles/${id}`);
        toast.success('Role deleted successfully!');
        fetchRoles();
      } catch (error) {
        toast.error(`Failed to delete role: ${error.response?.data?.message || error.message}`);
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRole) {
        await API.put(`/roles/${selectedRole._id}`, formData);
        toast.success('Role updated successfully!');
      } else {
        await API.post('/roles', formData);
        toast.success('Role added successfully!');
      }
      fetchRoles();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Failed to save role: ${error.response?.data?.message || error.message}`);
      console.error('Error saving role:', error);
    }
  };

  const tableHeaders = ['Role Name', 'Default Daily Salary', 'Actions'];

  if (loading) {
    return <div className="p-4 text-center">Loading roles...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Roles & Salaries</h2>
        <button
          onClick={handleAddRole}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" /> Add New Role
        </button>
      </div>

      <Table
        headers={tableHeaders}
        data={roles}
        renderRow={(role) => (
          <tr key={role._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {role.roleName}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              ${role.defaultSalary.toFixed(2)}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2">
              <button
                onClick={() => handleEditRole(role)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteRole(role._id)}
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
        title={selectedRole ? 'Edit Role' : 'Add New Role'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              type="text"
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Daily Salary</label>
            <input
              type="number"
              name="defaultSalary"
              value={formData.defaultSalary}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {selectedRole ? 'Update Role' : 'Add Role'}
            </button>
          </div>
        </form>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ManageRolesSalaries;
