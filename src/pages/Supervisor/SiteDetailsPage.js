// construction/frontend/src/pages/Supervisor/SiteDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {  FaClipboardCheck, FaBoxOpen, FaClipboardList, FaMoneyBillAlt, FaFilePdf, FaArrowLeft } from 'react-icons/fa';

import AttendanceSection from '../../components/supervisor/AttendanceSection';
import MaterialLogSection from '../../components/supervisor/MaterialLogSection';
import ActivityLogSection from '../../components/supervisor/ActivityLogSection';
import AdvanceManagementSection from '../../components/supervisor/AdvanceManagementSection';
import ReportGeneratorSection from '../../components/supervisor/ReportGeneratorSection';

const SiteDetailsPage = () => {
  const { siteId } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const res = await API.get(`/projects/${siteId}`);
        setSite(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch site details for operations.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    if (siteId) {
      fetchSiteDetails();
    }
  }, [siteId]);

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading site details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (!site) {
    return <div className="p-4 text-center text-gray-600">No site selected or site not found.</div>;
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          <span className="text-indigo-600">{site.name}</span> Site Details & Operations
        </h2>
        <Link to="/supervisor/my-sites" className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
          <FaArrowLeft className="mr-2" /> Back to My Sites
        </Link>
      </div>

      <p className="text-lg text-gray-700 mb-8">
        Manage and log activities for <span className="font-semibold">{site.name}</span> located at <span className="font-semibold">{site.location}</span>.
      </p>

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

      <div>
        {activeTab === 'attendance' && <AttendanceSection siteId={siteId} />}
        {activeTab === 'materials' && <MaterialLogSection siteId={siteId} />}
        {activeTab === 'activities' && <ActivityLogSection siteId={siteId} />}
        {activeTab === 'advances' && <AdvanceManagementSection siteId={siteId} />}
        {activeTab === 'reports' && <ReportGeneratorSection siteId={siteId} />}
      </div>
    </div>
  );
};

export default SiteDetailsPage;