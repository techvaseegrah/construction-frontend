// contract/frontend/src/pages/Supervisor/MySites.js
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table from '../../components/common/Table';
import { FaBuilding, FaHardHat } from 'react-icons/fa';

const MySites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMySites = async () => {
      try {
        const res = await API.get('/supervisor/my-sites');
        setSites(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch assigned sites.';
        setError(msg);
        toast.error('Failed to load your assigned sites.');
      } finally {
        setLoading(false);
      }
    };
    fetchMySites();
  }, []);

  const siteTableHeaders = ['Project Name', 'Type', 'Location', 'Start Date', 'Assigned Workers'];
  const workerTableHeaders = ['Worker Name', 'Role', 'RFID ID', 'Project Salary (Override)'];


  if (loading) {
    return <div className="p-4 text-center">Loading your assigned sites...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (sites.length === 0) {
    return <div className="p-4 text-center text-gray-600">You are not currently assigned to any sites.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Assigned Projects</h2>

      {sites.map(site => (
        <div key={site._id} className="mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <FaBuilding className="mr-3 text-indigo-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">
              {site.name} ({site.location})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <p className="text-gray-700"><span className="font-medium">Type:</span> {site.type}</p>
            <p className="text-gray-700"><span className="font-medium">Start Date:</span> {new Date(site.startDate).toLocaleDateString()}</p>
          </div>

          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FaHardHat className="mr-2 text-green-600" /> Workers Assigned to this Project ({site.assignedWorkers.length})
          </h4>
          {site.assignedWorkers.length > 0 ? (
            <Table
              headers={workerTableHeaders}
              data={site.assignedWorkers}
              renderRow={(workerAssignment) => (
                <tr key={workerAssignment.workerId._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                    {workerAssignment.workerId?.name || 'N/A'}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                    {workerAssignment.workerId?.role || 'N/A'}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                    {workerAssignment.workerId?.rfidId || 'N/A'}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                    {workerAssignment.salaryOverride ? `$${workerAssignment.salaryOverride.toFixed(2)}` : 'Uses Base Salary'}
                  </td>
                </tr>
              )}
            />
          ) : (
            <p className="text-center text-gray-600">No workers assigned to this project yet.</p>
          )}
        </div>
      ))}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default MySites;