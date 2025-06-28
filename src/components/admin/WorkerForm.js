import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const WorkerForm = ({ worker, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    baseSalary: '',
    rfidId: '',
    assignedProjects: [],
  });

  const [allRoles, setAllRoles] = useState([]);
  const [allSites, setAllSites] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, sitesRes] = await Promise.all([
          API.get('/roles'),
          API.get('/projects'),
        ]);
        setAllRoles(rolesRes.data);
        setAllSites(sitesRes.data);
      } catch (error) {
        toast.error('Failed to load roles or sites.');
        console.error('Error fetching roles/sites:', error);
      }
    };

    fetchData();

    if (worker) {
      setFormData({
        name: worker.name || '',
        role: worker.role || '',
        baseSalary: worker.baseSalary || '',
        rfidId: worker.rfidId || '',
        assignedProjects: worker.assignedProjects
          ? worker.assignedProjects.map(ap => ({
              siteId: ap.siteId._id || ap.siteId,
              siteName: ap.siteName,
              projectSalary: ap.projectSalary || '',
            }))
          : [],
      });
    } else {
      setFormData({
        name: '',
        role: '',
        baseSalary: '',
        rfidId: '',
        assignedProjects: [],
      });
    }
  }, [worker]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'role') {
      const selectedRole = allRoles.find(r => r.roleName === value);
      if (selectedRole) {
        setFormData(prev => ({
          ...prev,
          baseSalary: selectedRole.defaultSalary,
        }));
      }
    }
  };

  const handleProjectAssignmentChange = (index, field, value) => {
    const updated = [...formData.assignedProjects];
    updated[index][field] = value;

    if (field === 'siteId') {
      const selectedSite = allSites.find(s => s._id === value);
      updated[index].siteName = selectedSite ? selectedSite.name : '';
    }

    setFormData(prev => ({
      ...prev,
      assignedProjects: updated,
    }));
  };

  const addProjectAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignedProjects: [
        ...prev.assignedProjects,
        { siteId: '', siteName: '', projectSalary: '' },
      ],
    }));
  };

  const removeProjectAssignment = (index) => {
    setFormData(prev => ({
      ...prev,
      assignedProjects: prev.assignedProjects.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        assignedProjects: formData.assignedProjects.filter(ap => ap.siteId),
      };

      if (worker) {
        await API.put(`/workers/${worker._id}`, payload);
        toast.success('Worker updated successfully!');
      } else {
        await API.post('/workers', payload);
        toast.success('Worker added successfully!');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error(`Failed to save worker: ${error.response?.data?.message || error.message}`);
      console.error('Error saving worker:', error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        >
          <option value="">Select Role</option>
          {allRoles.map(role => (
            <option key={role._id} value={role.roleName}>
              {role.roleName}
            </option>
          ))}
        </select>
      </div>

      {/* Base Salary */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Base Daily Salary</label>
        <input
          type="number"
          name="baseSalary"
          value={formData.baseSalary}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      {/* RFID ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700">RFID ID (Optional)</label>
        <input
          type="text"
          name="rfidId"
          value={formData.rfidId}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      {/* Assigned Projects */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-lg font-medium text-gray-800 mb-3">Assigned Projects</h4>
        {formData.assignedProjects.map((assignment, index) => (
          <div
            key={index}
            className="flex items-end space-x-2 mb-3 p-2 border rounded-md bg-gray-50"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600">Project Site</label>
              <select
                value={assignment.siteId}
                onChange={(e) =>
                  handleProjectAssignmentChange(index, 'siteId', e.target.value)
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                required
              >
                <option value="">Select Project</option>
                {allSites.map(site => (
                  <option key={site._id} value={site._id}>
                    {site.name} ({site.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-32">
              <label className="block text-xs font-medium text-gray-600">
                Project Salary Override
              </label>
              <input
                type="number"
                value={assignment.projectSalary}
                onChange={(e) =>
                  handleProjectAssignmentChange(index, 'projectSalary', e.target.value)
                }
                placeholder="Use Base Salary"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => removeProjectAssignment(index)}
              className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addProjectAssignment}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Project Assignment
        </button>
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
          {worker ? 'Update Worker' : 'Add Worker'}
        </button>
      </div>
    </form>
  );
};

export default WorkerForm;
