import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table from '../../components/common/Table';
import { FaFilter } from 'react-icons/fa';

const AttendanceOverview = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [filters, setFilters] = useState({ siteId: '', startDate: '', endDate: '' });

  const fetchAttendanceOverview = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await API.get(`/attendance/overview?${params}`);
      setAttendanceData(res.data);
    } catch (error) {
      toast.error('Failed to load attendance overview.');
      console.error('Error fetching attendance overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await API.get('/projects');
      setSites(res.data);
    } catch (error) {
      toast.error('Failed to load sites for filter.');
      console.error('Error fetching sites:', error);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchAttendanceOverview();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchAttendanceOverview();

  const resetFilters = () => {
    setFilters({ siteId: '', startDate: '', endDate: '' });
    fetchAttendanceOverview();
  };

  const tableHeaders = ['Site', 'Worker Name', 'Worker Role', 'Total Attendance (Days)', 'Dates Present'];

  if (loading) {
    return <div className="p-4 text-center">Loading attendance overview...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Attendance Overview</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <FaFilter className="mr-2 text-indigo-600" /> Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site</label>
            <select
              name="siteId"
              value={filters.siteId}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">All Sites</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {attendanceData.length > 0 ? (
        attendanceData.map((siteSummary) => (
          <div key={siteSummary._id} className="mb-8 bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Site: {siteSummary.siteName}
            </h3>

            <Table
              headers={tableHeaders.slice(1)}
              data={siteSummary.workersAttendance}
              renderRow={(worker) => (
                <tr key={worker.workerId} className="hover:bg-gray-50">
                  <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                    {worker.workerName}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                    {worker.workerRole}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                    {worker.totalAttendanceDays.toFixed(1)}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                    {worker.datesPresent?.length > 0
                      ? worker.datesPresent
                          .map((d) => `${new Date(d.date).toLocaleDateString()} (${d.multiplier}x)`)
                          .join(', ')
                      : 'N/A'}
                  </td>
                </tr>
              )}
            />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-600">
          No attendance records found for the selected criteria.
        </p>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default AttendanceOverview;
