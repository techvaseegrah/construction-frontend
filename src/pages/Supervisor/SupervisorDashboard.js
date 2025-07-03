import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import {
  FaBuilding,
  FaHardHat,
  FaMoneyBillAlt,
  FaClipboardList,

} from 'react-icons/fa';

import Drawer from '../../components/common/Drawer';
import BreakdownDrawerContent from '../../components/admin/BreakdownDrawerContent.js';

const SupervisorDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [siteSummaries, setSiteSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isBreakdownDrawerOpen, setIsBreakdownDrawerOpen] = useState(false);
  const [breakdownType, setBreakdownType] = useState('');
  const [breakdownTitle, setBreakdownTitle] = useState('');


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const summaryRes = await API.get('/supervisor/dashboard-summary');
        setSummary(summaryRes.data);

        const siteSummariesRes = await API.get('/supervisor/site-summaries');
        setSiteSummaries(siteSummariesRes.data);

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
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Supervisor Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-indigo-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-indigo-200 transition-colors"
          onClick={() => handleCardClick('assigned_sites', 'Assigned Sites Breakdown')}
        >
          <div>
            <p className="text-sm text-indigo-700">Total Assigned Sites</p>
            <h3 className="text-3xl font-bold text-indigo-900">{summary.totalAssignedSites}</h3>
          </div>
          <FaBuilding className="text-indigo-600" size={48} />
        </div>

        <div
          className="bg-green-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-green-200 transition-colors"
          onClick={() => handleCardClick('workers_assigned_sites', 'Total Workers Breakdown')}
        >
          <div>
            <p className="text-sm text-green-700">Total Workers (Assigned Sites)</p>
            <h3 className="text-3xl font-bold text-green-900">{summary.totalWorkersAcrossAssignedSites}</h3>
          </div>
          <FaHardHat className="text-green-600" size={48} />
        </div>

        <div
          className="bg-yellow-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-yellow-200 transition-colors"
          onClick={() => handleCardClick('material_cost_assigned_sites', 'Total Material Cost Breakdown')}
        >
          <div>
            <p className="text-sm text-yellow-700">Total Material Cost</p>
            <h3 className="text-3xl font-bold text-yellow-900">
              ₹{summary.totalMaterialCost.toFixed(2)}
            </h3>
          </div>
          <FaMoneyBillAlt className="text-yellow-600" size={48} />
        </div>

        <div
          className="bg-purple-100 p-5 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-purple-200 transition-colors"
          onClick={() => handleCardClick('advance_given_assigned_sites', 'Total Advance Given Breakdown')}
        >
          <div>
            <p className="text-sm text-purple-700">Total Advance Given</p>
            <h3 className="text-3xl font-bold text-purple-900">
              ₹{summary.totalAdvanceGiven.toFixed(2)}
            </h3>
          </div>
          <FaMoneyBillAlt className="text-purple-600" size={48} />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaClipboardList className="mr-3 text-indigo-600" /> Recent Activities (My Sites)
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
                  No recent activities found for your assigned sites.
                </li>
              )}
            </ul>
          </div>

          <Drawer
            isOpen={isBreakdownDrawerOpen}
            onClose={handleCloseBreakdownDrawer}
            title={breakdownTitle}
          >
            <BreakdownDrawerContent
              breakdownType={breakdownType}
              projectSummaries={siteSummaries} // Pass siteSummaries for supervisor site-wise data
              overallSummary={summary} // Pass overall summary for lists like workers/sites
            />
          </Drawer>
        </div>
      );
    };

export default SupervisorDashboard;