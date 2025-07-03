// construction/frontend/src/pages/Admin/ManageProjects.js
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Modal from '../../components/common/Modal';
import ProjectForm from '../../components/admin/ProjectForm';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaHardHat, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await API.get('/projects'); // Admin fetches all projects
      setProjects(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch projects.';
      setError(msg);
      toast.error('Failed to load projects.');
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
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated attendance, material, activity, advance, and salary logs for this project.')) {
      try {
        await API.delete(`/projects/${id}`);
        toast.success('Project deleted successfully!');
        fetchProjects();
      } catch (error) {
        toast.error(`Failed to delete project: ${error.response?.data?.message || error.message}`);
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleSaveProject = () => {
    fetchProjects();
    setIsModalOpen(false);
  };

  // Handler for clicking a project card - now navigates to ProjectDetailsPage
  const handleProjectClick = (projectId) => {
    navigate(`/admin/projects/${projectId}`); // Navigate to the new ProjectDetailsPage route
  };


  if (loading) {
    return <div className="p-4 text-center">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Projects</h2>

      <div className="flex justify-end items-center mb-4">
        <button
          onClick={handleAddProject}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" /> Add New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-4 text-center text-gray-600">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project._id}
              className="bg-gray-50 rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-indigo-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              onClick={() => handleProjectClick(project._id)} // Make the card clickable
            >
              <div>
                <div className="flex items-center mb-4">
                  <FaBuilding className="mr-3 text-indigo-600" size={28} />
                  <h3 className="text-xl font-semibold text-gray-800 truncate">
                    {project.name}
                  </h3>
                </div>
                <div className="space-y-2 text-gray-700 text-sm mb-4">
                  <p className="flex items-center"><FaMapMarkerAlt className="mr-2 text-gray-500" /> {project.location}</p>
                  <p className="flex items-center"><FaCalendarAlt className="mr-2 text-gray-500" /> Start Date: {new Date(project.startDate).toLocaleDateString()}</p>
                  <p className="flex items-center"><FaHardHat className="mr-2 text-gray-500" /> Workers Assigned: {project.assignedWorkers.length}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditProject(project); }} // Stop propagation to prevent card click
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Project"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project._id); }} // Stop propagation
                    className="text-red-600 hover:text-red-800"
                    title="Delete Project"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
                <span className="flex items-center text-indigo-600 font-medium group">
                  View Details <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProject ? 'Edit Project' : 'Add New Project'}
        size="lg"
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