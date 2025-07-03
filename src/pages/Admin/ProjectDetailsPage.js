// construction/frontend/src/pages/Admin/ProjectDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { FaClipboardCheck, FaBoxOpen, FaClipboardList, FaMoneyBillAlt, FaFilePdf, FaArrowLeft } from 'react-icons/fa';

// Import the new Admin-specific section components
import AttendanceSection from '../../components/admin/AttendanceSection';
import MaterialLogSection from '../../components/admin/MaterialLogSection';
import ActivityLogSection from '../../components/admin/ActivityLogSection';
import AdvanceManagementSection from '../../components/admin/AdvanceManagementSection';
import ReportGeneratorSection from '../../components/admin/ReportGeneratorSection';

const ProjectDetailsPage = () => {
  const { projectId } = useParams(); // Get projectId from URL parameters
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance'); // Default active tab

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await API.get(`/projects/${projectId}`); // Use the /projects/:id endpoint
        setProject(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch project details.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading project details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-4 text-center text-gray-600">Project not found.</div>;
  }

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: <FaClipboardCheck className="mr-2" /> },
    { id: 'materials', label: 'Materials', icon: <FaBoxOpen className="mr-2" /> },
    { id: 'activities', label: 'Daily Activities', icon: <FaClipboardList className="mr-2" /> },
    { id: 'advances', label: 'Advances', icon: <FaMoneyBillAlt className="mr-2" /> },
    { id: 'reports', label: 'Reports', icon: <FaFilePdf className="mr-2" /> },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          <span className="text-indigo-600">{project.name}</span> Project Details & Operations
        </h2>
        {/* Button to go back to Manage Projects */}
        <Link to="/admin/projects" className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
          <FaArrowLeft className="mr-2" /> Back to Projects
        </Link>
      </div>

      <p className="text-lg text-gray-700 mb-8">
        Manage and log activities for <span className="font-semibold">{project.name}</span> located at <span className="font-semibold">{project.location}</span>.
      </p>

      {/* Tabs for different operations */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex-shrink-0 flex items-center transition-colors duration-200`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on active tab */}
      <div>
        {/* Pass projectId to the admin-specific section components */}
        {activeTab === 'attendance' && <AttendanceSection siteId={projectId} />}
        {activeTab === 'materials' && <MaterialLogSection siteId={projectId} />}
        {activeTab === 'activities' && <ActivityLogSection siteId={projectId} />}
        {activeTab === 'advances' && <AdvanceManagementSection siteId={projectId} />}
        {activeTab === 'reports' && <ReportGeneratorSection siteId={projectId} />}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;