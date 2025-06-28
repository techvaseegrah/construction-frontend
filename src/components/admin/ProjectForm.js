import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const ProjectForm = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    startDate: '',
    supervisors: [],
    assignedWorkers: [],
  });

  const [allSupervisors, setAllSupervisors] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [siteTypes, setSiteTypes] = useState(['Residential', 'Commercial', 'Industrial', 'Other']);
  const [newSiteType, setNewSiteType] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        type: project.type || '',
        location: project.location || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        supervisors: project.supervisors?.map(s => s._id) || [],
        assignedWorkers: project.assignedWorkers?.map(aw => ({
          workerId: aw.workerId._id || aw.workerId,
          name: aw.name || aw.workerId.name,
          role: aw.role || aw.workerId.role,
          salaryOverride: aw.salaryOverride || '',
        })) || [],
      });
    } else {
      setFormData({
        name: '',
        type: '',
        location: '',
        startDate: '',
        supervisors: [],
        assignedWorkers: [],
      });
    }

    const fetchData = async () => {
      try {
        const [supervisorsRes, workersRes] = await Promise.all([
          API.get('/auth/users?role=supervisor'),
          API.get('/workers'),
        ]);
        setAllSupervisors(supervisorsRes.data.filter(user => user.role === 'supervisor'));
        setAllWorkers(workersRes.data);
      } catch (error) {
        toast.error('Failed to load supervisors or workers.');
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSupervisorChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, supervisors: value }));
  };

  const handleWorkerAssignmentChange = (index, field, value) => {
    const updated = [...formData.assignedWorkers];
    updated[index][field] = value;

    if (field === 'workerId') {
      const worker = allWorkers.find(w => w._id === value);
      if (worker) {
        updated[index].name = worker.name;
        updated[index].role = worker.role;
        if (!updated[index].salaryOverride) {
          updated[index].salaryOverride = worker.baseSalary;
        }
      } else {
        updated[index].name = '';
        updated[index].role = '';
      }
    }

    setFormData(prev => ({ ...prev, assignedWorkers: updated }));
  };

  const addWorkerAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignedWorkers: [...prev.assignedWorkers, { workerId: '', name: '', role: '', salaryOverride: '' }],
    }));
  };

  const removeWorkerAssignment = (index) => {
    setFormData(prev => ({
      ...prev,
      assignedWorkers: prev.assignedWorkers.filter((_, i) => i !== index),
    }));
  };

  const handleAddSiteType = () => {
    if (newSiteType.trim() && !siteTypes.includes(newSiteType.trim())) {
      setSiteTypes(prev => [...prev, newSiteType.trim()]);
      setNewSiteType('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        assignedWorkers: formData.assignedWorkers.filter(aw => aw.workerId),
      };

      if (project) {
        await API.put(`/projects/${project._id}`, payload);
        toast.success('Project updated successfully!');
      } else {
        await API.post('/projects', payload);
        toast.success('Project added successfully!');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error(`Failed to save project: ${error.response?.data?.message || error.message}`);
      console.error('Error saving project:', error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Project Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      {/* Project Type with Add Option */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Project Type</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        >
          <option value="">Select Type</option>
          {siteTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <div className="flex mt-2">
          <input
            type="text"
            value={newSiteType}
            onChange={(e) => setNewSiteType(e.target.value)}
            placeholder="New site type"
            className="flex-1 border border-gray-300 rounded-l-md shadow-sm p-2"
          />
          <button
            type="button"
            onClick={handleAddSiteType}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      {/* Assign Supervisors */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Assign Supervisors</label>
        <select
          multiple
          name="supervisors"
          value={formData.supervisors}
          onChange={handleSupervisorChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
        >
          {allSupervisors.map(sup => (
            <option key={sup._id} value={sup._id}>
              {sup.name} ({sup.username})
            </option>
          ))}
        </select>
      </div>

      {/* Assigned Workers Section */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-lg font-medium text-gray-800 mb-3">Assigned Workers</h4>
        {formData.assignedWorkers.map((assignment, index) => (
          <div key={index} className="flex items-end space-x-2 mb-3 p-2 border rounded-md bg-gray-50">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600">Worker</label>
              <select
                value={assignment.workerId}
                onChange={(e) => handleWorkerAssignmentChange(index, 'workerId', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                required
              >
                <option value="">Select Worker</option>
                {allWorkers.map(worker => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} ({worker.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-24">
              <label className="block text-xs font-medium text-gray-600">Role</label>
              <input
                type="text"
                value={assignment.role}
                readOnly
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm bg-gray-100"
              />
            </div>

            <div className="w-28">
              <label className="block text-xs font-medium text-gray-600">Salary Override</label>
              <input
                type="number"
                value={assignment.salaryOverride}
                onChange={(e) => handleWorkerAssignmentChange(index, 'salaryOverride', e.target.value)}
                placeholder="Base"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => removeWorkerAssignment(index)}
              className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addWorkerAssignment}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Worker
        </button>
      </div>

      {/* Action Buttons */}
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
          {project ? 'Update Project' : 'Add Project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
