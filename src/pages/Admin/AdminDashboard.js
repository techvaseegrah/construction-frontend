import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import {
  FaHardHat,
  FaProjectDiagram,
  FaUserTie,
  FaDollarSign,
  FaClipboardList
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get('/admin/dashboard-summary');
        setSummary(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch dashboard summary.';
        setError(msg);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-indigo-100 p-5 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-700">Total Projects</p>
            <h3 className="text-3xl font-bold text-indigo-900">{summary.totalProjects}</h3>
          </div>
          <FaProjectDiagram className="text-indigo-600" size={48} />
        </div>

        <div className="bg-green-100 p-5 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700">Total Workers</p>
            <h3 className="text-3xl font-bold text-green-900">{summary.totalWorkers}</h3>
          </div>
          <FaHardHat className="text-green-600" size={48} />
        </div>

        <div className="bg-blue-100 p-5 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700">Total Supervisors</p>
            <h3 className="text-3xl font-bold text-blue-900">{summary.totalSupervisors}</h3>
          </div>
          <FaUserTie className="text-blue-600" size={48} />
        </div>

        <div className="bg-yellow-100 p-5 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-700">Total Material Cost</p>
            <h3 className="text-3xl font-bold text-yellow-900">
              ${summary.totalMaterialCost.toFixed(2)}
            </h3>
          </div>
          <FaDollarSign className="text-yellow-600" size={48} />
        </div>
      </div>

      {/* Recent Activities */}
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
    </div>
  );
};

export default AdminDashboard;
