// contract/frontend/src/pages/Supervisor/MarkAttendance.js
import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import AttendanceForm from '../../components/supervisor/AttendanceForm';
import { FaPlus, FaEdit, FaTrash, FaClipboardCheck, FaFilter } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const MarkAttendance = () => {
  const { user } = useContext(AuthContext);
  const [attendanceEntries, setAttendanceEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ siteId: '', workerId: '', startDate: '', endDate: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const fetchAttendanceEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await API.get(`/attendance?${params}`);
      setAttendanceEntries(res.data);
    } catch (error) {
      toast.error('Failed to load attendance entries.');
      console.error('Error fetching attendance entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSitesAndWorkers = async () => {
    try {
      const sitesRes = await API.get('/supervisor/my-sites'); // Supervisor only sees their sites
      setSites(sitesRes.data);

      let allAssignedWorkers = [];
      sitesRes.data.forEach(site => {
        site.assignedWorkers.forEach(worker => {
          if (!allAssignedWorkers.some(w => w._id === worker.workerId._id)) {
            allAssignedWorkers.push({
              _id: worker.workerId._id,
              name: worker.workerId.name,
              role: worker.workerId.role
            });
          }
        });
      });
      setWorkers(allAssignedWorkers);

      // If only one site is assigned, pre-select it
      if (sitesRes.data.length === 1) {
        setFilters(prev => ({ ...prev, siteId: sitesRes.data[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to load sites or workers for filter.');
      console.error('Error fetching sites/workers:', error);
    }
  };


  useEffect(() => {
    fetchSitesAndWorkers();
    // Delay initial fetch of attendance until filters are potentially pre-filled
    const timer = setTimeout(() => {
      fetchAttendanceEntries();
    }, 100);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures it runs only once on mount

  useEffect(() => {
    // Refetch attendance whenever filters change, but not on initial load
    if (!loading) { // Prevent double fetch on initial load
        fetchAttendanceEntries();
    }
  }, [filters.siteId, filters.workerId, filters.startDate, filters.endDate]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchAttendanceEntries();

  const resetFilters = () => {
    setFilters({ siteId: '', workerId: '', startDate: '', endDate: '' });
  };

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    // Note: AttendanceForm expects a prop `advanceEntry` or `materialEntry` or `activityLog` based on component usage.
    // For editing attendance, you'd pass the existing attendance object.
    setIsModalOpen(true);
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance entry?')) {
      try {
        await API.delete(`/attendance/${id}`);
        toast.success('Attendance entry deleted successfully!');
        fetchAttendanceEntries();
      } catch (error) {
        toast.error(`Failed to delete entry: ${error.response?.data?.message || error.message}`);
        console.error('Error deleting entry:', error);
      }
    }
  };

  const handleSaveEntry = () => {
    fetchAttendanceEntries();
    setIsModalOpen(false);
  };

  const tableHeaders = ['Worker', 'Site', 'Date', 'Shift Type', 'Multiplier', 'Actions'];

  if (loading) {
    return <div className="p-4 text-center">Loading attendance records...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Mark & Manage Attendance</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <FaFilter className="mr-2 text-indigo-600" /> Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site</label>
            <select
              name="siteId"
              value={filters.siteId}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">All My Sites</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Worker</label>
            <select
              name="workerId"
              value={filters.workerId}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">All Workers</option>
              {workers.map((worker) => (
                <option key={worker._id} value={worker._id}>
                  {worker.name} ({worker.role})
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

      <div className="flex justify-end items-center mb-4">
        <button
          onClick={handleAddEntry}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" /> Mark New Attendance
        </button>
      </div>

      <Table
        headers={tableHeaders}
        data={attendanceEntries}
        emptyMessage="No attendance records found for the selected criteria."
        renderRow={(entry) => (
          <tr key={entry._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {entry.workerId?.name || 'N/A'} ({entry.workerId?.role || 'N/A'})
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {entry.siteId?.name || 'N/A'}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {new Date(entry.date).toLocaleDateString()}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {entry.shiftType}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {entry.multiplier.toFixed(1)}
            </td>
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2">
              <button
                onClick={() => handleEditEntry(entry)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteEntry(entry._id)}
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
        title={selectedEntry ? 'Edit Attendance Entry' : 'Mark New Attendance'}
        size="md"
      >
        <AttendanceForm
          // For editing, you'd pass selectedEntry to pre-fill the form.
          // For marking new attendance, you might want to pass default siteId
          // if the supervisor is associated with only one site or has a primary site.
          onSave={handleSaveEntry}
          onClose={() => setIsModalOpen(false)}
          siteId={filters.siteId} // Pass the currently selected siteId from filters if available
          attendanceEntry={selectedEntry} // If editing, pass the selected entry
        />
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default MarkAttendance;