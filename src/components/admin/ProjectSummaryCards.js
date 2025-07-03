// construction/frontend/src/components/admin/ProjectSummaryCards.js
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHardHat,
  FaMoneyBillWave,
  FaChartLine,
  FaArrowRight
} from 'react-icons/fa';

const ProjectSummaryCards = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectSummaries = async () => {
      try {
        const res = await API.get('/admin/project-summaries');
        setProjects(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch project summaries.';
        setError(msg);
        toast.error('Failed to load project summaries.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectSummaries();
  }, []);

  const handleProjectCardClick = (projectId) => {
    navigate(`/admin/projects/${projectId}`);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading project summaries...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (projects.length === 0) {
    return <div className="p-4 text-center text-gray-600">No projects found to display summaries.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <div
          key={project._id}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-indigo-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          onClick={() => handleProjectCardClick(project._id)}
        >
          <div>
            <div className="flex items-center mb-3">
              <FaBuilding className="mr-3 text-indigo-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-800 truncate">{project.name}</h3>
            </div>
            <p className="text-gray-700 text-sm flex items-center mb-2"><FaMapMarkerAlt className="mr-2 text-gray-500" /> {project.location}</p>
            <p className="text-gray-700 text-sm flex items-center mb-4"><FaCalendarAlt className="mr-2 text-gray-500" /> Start: {new Date(project.startDate).toLocaleDateString()}</p>

            <div className="space-y-2 text-gray-700 text-sm">
              <p className="flex items-center"><FaHardHat className="mr-2 text-green-600" /> Workers: <span className="font-medium ml-1">{project.totalWorkers}</span></p>
              <p className="flex items-center"><FaMoneyBillWave className="mr-2 text-yellow-600" /> Material Cost: <span className="font-medium ml-1">₹{project.totalMaterialCost.toFixed(2)}</span></p>
              <p className="flex items-center"><FaMoneyBillWave className="mr-2 text-purple-600" /> Salary Cost: <span className="font-medium ml-1">₹{project.totalSalaryCost.toFixed(2)}</span></p>
              <p className="flex items-center"><FaChartLine className="mr-2 text-red-600" /> Overall Cost: <span className="font-bold ml-1">₹{project.overallCost.toFixed(2)}</span></p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
            <span className="flex items-center text-indigo-600 font-medium group">
              View Project Details <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectSummaryCards;