// construction/frontend/src/components/supervisor/AttendanceSection.js
import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import Table from '../common/Table';
import Modal from '../common/Modal';
import AttendanceForm from './AttendanceForm'; // Reusing existing form
import { FaPlus, FaEdit, FaTrash, FaFilter,FaClipboardCheck } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const AttendanceSection = ({ siteId }) => {
  const { user } = useContext(AuthContext);
  const [attendanceEntries, setAttendanceEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]); // Workers assigned to this specific site
  const [filters, setFilters] = useState({ workerId: '', startDate: '', endDate: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Fetch attendance entries for the given siteId
  const fetchAttendanceEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...filters, siteId }).toString();
      const res = await API.get(`/attendance?${params}`);
      setAttendanceEntries(res.data);
    } catch (error) {
      toast.error('Failed to load attendance entries for this site.');
      console.error('Error fetching attendance entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch workers specifically for this site
  const fetchSiteWorkers = async () => {
    try {
      const res = await API.get(`/projects/${siteId}`); // Fetch the specific site to get its assigned workers
      const assignedWorkersData = res.data.assignedWorkers.map(assignment => ({
        _id: assignment.workerId._id,
        name: assignment.workerId.name,
        role: assignment.workerId.role
      }));
      setWorkers(assignedWorkersData);
    } catch (error) {
      toast.error('Failed to load workers for this site.');
      console.error('Error fetching site workers:', error);
    }
  };


  useEffect(() => {
    if (siteId) {
      fetchSiteWorkers();
      fetchAttendanceEntries();
    }
  }, [siteId, filters.workerId, filters.startDate, filters.endDate]); // Re-fetch when siteId or filters change


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchAttendanceEntries();

  const resetFilters = () => {
    setFilters({ workerId: '', startDate: '', endDate: '' });
  };

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
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

  const tableHeaders = ['Worker', 'Date', 'Shift Type', 'Multiplier', 'Actions'];

  if (loading) {
    return <div className="p-4 text-center">Loading attendance records...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaClipboardCheck className="mr-2 text-indigo-600" /> Attendance Logs
      </h3>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <FaFilter className="mr-2 text-indigo-600" /> Filters
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        emptyMessage="No attendance records found for this site with the selected criteria."
        renderRow={(entry) => (
          <tr key={entry._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
              {entry.workerId?.name || 'N/A'} ({entry.workerId?.role || 'N/A'})
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
          onSave={handleSaveEntry}
          onClose={() => setIsModalOpen(false)}
          siteId={siteId} // Pass the siteId from props
          attendanceEntry={selectedEntry} // If editing, pass the selected entry
        />
      </Modal>
    </div>
  );
};

export default AttendanceSection;