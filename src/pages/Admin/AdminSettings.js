// contract/frontend/src/pages/Admin/AdminSettings.js
import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserPlus, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';

const AdminSettings = () => {
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'supervisor',
    assignedSites: [],
  });

  const fetchUsersAndSites = async () => {
    setLoading(true);
    try {
      const [usersRes, sitesRes] = await Promise.all([
        API.get('/auth/users'),
        API.get('/projects'),
      ]);
      setUsers(usersRes.data);
      setSites(sitesRes.data);
    } catch (error) {
      toast.error('Failed to load users or sites.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndSites();
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserFormData({ name: '', username: '', password: '', role: 'supervisor', assignedSites: [] });
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      username: user.username,
      password: '', // Password is not pre-filled for security
      role: user.role,
      assignedSites: user.assignedSites.map(site => site._id || site), // Ensure it's just IDs
    });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/auth/users/${id}`);
        toast.success('User deleted successfully!');
        fetchUsersAndSites();
      } catch (error) {
        toast.error(`Failed to delete user: ${error.response?.data?.message || error.message}`);
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignedSitesChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setUserFormData(prev => ({ ...prev, assignedSites: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...userFormData };
      if (!payload.password) {
        delete payload.password; // Don't send empty password on update
      }

      if (selectedUser) {
        await API.put(`/auth/users/${selectedUser._id}`, payload);
        toast.success('User updated successfully!');
      } else {
        await API.post('/auth/register', payload);
        toast.success('User registered successfully!');
      }
      fetchUsersAndSites();
      setIsUserModalOpen(false);
    } catch (error) {
      toast.error(`Failed to save user: ${error.response?.data?.message || error.message}`);
      console.error('Error saving user:', error.response?.data || error.message);
    }
  };

  const userTableHeaders = ['Name', 'Username', 'Role', 'Assigned Sites', 'Actions'];

  if (loading) {
    return <div className="p-4 text-center">Loading admin settings...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Admin Settings</h2>
        <button
          onClick={handleAddUser}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
        >
          <FaUserPlus className="mr-2" /> Add New User
        </button>
      </div>

      <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaUsers className="mr-2 text-indigo-600" /> Manage Users
      </h3>
      <Table
        headers={userTableHeaders}
        data={users}
        renderRow={(user) => (
          <tr key={user._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{user.name}</td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{user.username}</td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm capitalize">{user.role}</td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {user.assignedSites?.length > 0
                ? user.assignedSites.map(site => sites.find(s => s._id === site)?.name || 'Unknown Site').join(', ')
                : 'N/A'}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2">
              <button
                onClick={() => handleEditUser(user)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash />
              </button>
            </td>
          </tr>
        )}
      />

      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={userFormData.name}
              onChange={handleUserFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={userFormData.username}
              onChange={handleUserFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={userFormData.password}
              onChange={handleUserFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required={!selectedUser} // Required only for new users
            />
            {selectedUser && <p className="mt-1 text-sm text-gray-500">Leave blank to keep current password</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={userFormData.role}
              onChange={handleUserFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {userFormData.role === 'supervisor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Assign Sites</label>
              <select
                multiple
                name="assignedSites"
                value={userFormData.assignedSites}
                onChange={handleAssignedSitesChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
              >
                {sites.map(site => (
                  <option key={site._id} value={site._id}>
                    {site.name} ({site.location})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple sites.</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {selectedUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default AdminSettings;