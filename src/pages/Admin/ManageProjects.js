import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import ProjectForm from '../../components/admin/ProjectForm';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (error) {
      toast.error('Failed to load projects.');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this project? This will also delete all associated data (attendance, materials, activities, advances, salaries).'
      )
    ) {
      try {
        await API.delete(`/projects/${id}`);
        toast.success('Project deleted successfully!');
        fetchProjects();
      } catch (error) {
        toast.error(
          `Failed to delete project: ${
            error.response?.data?.message || error.message
          }`
        );
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleSaveProject = () => {
    fetchProjects();
    setIsModalOpen(false);
  };

  const tableHeaders = [
    'Name',
    'Type',
    'Location',
    'Start Date',
    'Supervisors',
    'Workers Assigned',
    'Actions',
  ];

  if (loading) {
    return <div className="p-4 text-center">Loading projects...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Projects</h2>
        <button
          onClick={handleAddProject}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" /> Add New Project
        </button>
      </div>

      <Table
        headers={tableHeaders}
        data={projects}
        renderRow={(project) => (
          <tr key={project._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {project.name}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {project.type}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {project.location}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {new Date(project.startDate).toLocaleDateString()}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {project.supervisors?.length > 0
                ? project.supervisors.map((s) => s.name).join(', ')
                : 'N/A'}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {project.assignedWorkers?.length || 0}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2">
              <button
                onClick={() => handleEditProject(project)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteProject(project._id)}
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
        title={selectedProject ? 'Edit Project' : 'Add New Project'}
        size="2xl"
      >
        <ProjectForm
          project={selectedProject}
          onSave={handleSaveProject}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ManageProjects;
