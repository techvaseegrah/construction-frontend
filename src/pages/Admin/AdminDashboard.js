// construction/frontend/src/pages/Admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import {
  FaHardHat,
  FaProjectDiagram,
  FaUserTie,
  FaMoneyBillWave,
  FaChartLine,
  FaClipboardList,
  FaList,
  FaChartPie
} from 'react-icons/fa';

import ProjectSummaryCards from '../../components/admin/ProjectSummaryCards';
import Drawer from '../../components/common/Drawer';
import BreakdownDrawerContent from '../../components/admin/BreakdownDrawerContent.js';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [projectSummaries, setProjectSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOverallSummary, setShowOverallSummary] = useState(true);

  const [isBreakdownDrawerOpen, setIsBreakdownDrawerOpen] = useState(false);
  const [breakdownType, setBreakdownType] = useState('');
  const [breakdownTitle, setBreakdownTitle] = useState('');


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const summaryRes = await API.get('/admin/dashboard-summary');
        setSummary(summaryRes.data);

        const projectSummariesRes = await API.get('/admin/project-summaries');
        setProjectSummaries(projectSummariesRes.data);

      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch dashboard data.';
        setError(msg);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleCardClick = (type, title) => {
    setBreakdownType(type);
    setBreakdownTitle(title);
    setIsBreakdownDrawerOpen(true);
  };

  const handleCloseBreakdownDrawer = () => {
    setIsBreakdownDrawerOpen(false);
    setBreakdownType('');
    setBreakdownTitle('');
  };


  if (loading) {
    return <div className="p-4 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      <div className="flex justify-end mb-6 space-x-3">
        <button
          onClick={() => setShowOverallSummary(true)}
          className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
            showOverallSummary
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaChartPie className="mr-2" /> Overall Summary
        </button>
        <button
          onClick={() => setShowOverallSummary(false)}
          className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
            !showOverallSummary
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaList className="mr-2" /> Project-wise Summary
        </button>
      </div>

      {showOverallSummary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div
              className="bg-indigo-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-indigo-200 transition-colors"
              onClick={() => handleCardClick('projects', 'Total Projects Breakdown')}
            >
              <div>
                <p className="text-sm text-indigo-700">Total Projects</p>
                <h3 className="text-3xl font-bold text-indigo-900">{summary.totalProjects}</h3>
              </div>
              <FaProjectDiagram className="text-indigo-600" size={48} />
            </div>

            <div
              className="bg-green-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => handleCardClick('workers', 'Total Workers Breakdown')}
            >
              <div>
                <p className="text-sm text-green-700">Total Workers</p>
                <h3 className="text-3xl font-bold text-green-900">{summary.totalWorkers}</h3>
              </div>
              <FaHardHat className="text-green-600" size={48} />
            </div>

            <div
              className="bg-blue-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => handleCardClick('supervisors', 'Total Supervisors Breakdown')}
            >
              <div>
                <p className="text-sm text-blue-700">Total Supervisors</p>
                <h3 className="text-3xl font-bold text-blue-900">{summary.totalSupervisors}</h3>
              </div>
              <FaUserTie className="text-blue-600" size={48} />
            </div>

            <div
              className="bg-yellow-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-yellow-200 transition-colors"
              onClick={() => handleCardClick('material_cost', 'Total Material Cost Breakdown')}
            >
              <div>
                <p className="text-sm text-yellow-700">Total Material Cost</p>
                <h3 className="text-3xl font-bold text-yellow-900">
                  ₹{summary.totalMaterialCost.toFixed(2)}
                </h3>
              </div>
              <FaMoneyBillWave className="text-yellow-600" size={48} />
            </div>

            <div
              className="bg-purple-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => handleCardClick('salary_cost', 'Total Salary Cost Breakdown')}
            >
              <div>
                <p className="text-sm text-purple-700">Total Salary Cost</p>
                <h3 className="text-3xl font-bold text-purple-900">
                  ₹{summary.totalSalaryCost.toFixed(2)}
                </h3>
              </div>
              <FaMoneyBillWave className="text-purple-600" size={48} />
            </div>

            <div
              className="md:col-span-2 lg:col-span-5 bg-red-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-red-200 transition-colors"
              onClick={() => handleCardClick('overall_cost', 'Overall Total Cost Breakdown')}
            >
              <div>
                <p className="text-sm text-red-700">Overall Total Cost</p>
                <h3 className="text-3xl font-bold text-red-900">
                  ₹{summary.overallTotalCost.toFixed(2)}
                </h3>
              </div>
              <FaChartLine className="text-red-600" size={48} />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaClipboardList className="mr-3 text-indigo-600" /> Recent Activities
            </h3>
            <ul className="divide-y divide-gray-200">
              {summary.recentActivities.length > 0 ? (
                summary.recentActivities.map(activity => (
                  <li key={activity._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-gray-900 font-medium">{activity.message}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Site:</span> {activity.siteId?.name || 'N/A'} |{' '}
                        <span className="font-semibold">By:</span> {activity.supervisorId?.name || 'N/A'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-3 text-center text-gray-500">
                  No recent activities found.
                </li>
              )}
            </ul>
          </div>
        </>
      ) : (
        <ProjectSummaryCards />
      )}

      <Drawer
        isOpen={isBreakdownDrawerOpen}
        onClose={handleCloseBreakdownDrawer}
        title={breakdownTitle}
      >
        <BreakdownDrawerContent
          breakdownType={breakdownType}
          projectSummaries={projectSummaries}
          overallSummary={summary}
        />
      </Drawer>
    </div>
  );
};

export default AdminDashboard;