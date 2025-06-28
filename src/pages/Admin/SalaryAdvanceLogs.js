import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table from '../../components/common/Table';
import { FaFilter, FaDollarSign, FaArrowRight } from 'react-icons/fa';
import Modal from '../../components/common/Modal';
import AdvanceForm from '../../components/supervisor/AdvanceForm';

const SalaryAdvanceLogs = () => {
  const [salaryLogs, setSalaryLogs] = useState([]);
  const [advanceLogs, setAdvanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({
    siteId: '',
    workerId: '',
    startDate: '',
    endDate: ''
  });

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const [salaryRes, advanceRes] = await Promise.all([
        API.get(`/reports/generate?type=salary&${params}`),
        API.get(`/advances?${params}`)
      ]);

      const extractedSalaryLogs = [];
      salaryRes.data.forEach(siteReport => {
        extractedSalaryLogs.push(...siteReport.salaryLogs);
      });

      setSalaryLogs(extractedSalaryLogs);
      setAdvanceLogs(advanceRes.data);
    } catch (error) {
      toast.error('Failed to load logs.');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [sitesRes, workersRes] = await Promise.all([
        API.get('/projects'),
        API.get('/workers')
      ]);
      setSites(sitesRes.data);
      setWorkers(workersRes.data);
    } catch (error) {
      toast.error('Failed to load filter data.');
      console.error('Error fetching filter data:', error);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchLogs();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchLogs();
  const resetFilters = () => {
    setFilters({ siteId: '', workerId: '', startDate: '', endDate: '' });
    fetchLogs();
  };

  const handleAddAdvance = () => {
    setSelectedAdvance(null);
    setIsAdvanceModalOpen(true);
  };

  const handleEditAdvance = (advance) => {
    setSelectedAdvance(advance);
    setIsAdvanceModalOpen(true);
  };

  const handleDeleteAdvance = async (id) => {
    if (window.confirm('Are you sure you want to delete this advance entry?')) {
      try {
        await API.delete(`/advances/${id}`);
        toast.success('Advance entry deleted successfully!');
        fetchLogs();
      } catch (error) {
        toast.error(`Failed to delete advance: ${error.response?.data?.message || error.message}`);
        console.error('Error deleting advance:', error);
      }
    }
  };

  const handleSaveAdvance = () => {
    fetchLogs();
    setIsAdvanceModalOpen(false);
  };

  const handleCalculateWeeklySalaries = async () => {
    if (window.confirm('This will calculate and log/update weekly salaries for all workers based on their attendance and advances. Continue?')) {
      try {
        await API.post('/reports/calculate-weekly-salaries');
        toast.success('Weekly salaries calculated and logged!');
        fetchLogs();
      } catch (error) {
        toast.error(`Failed to calculate salaries: ${error.response?.data?.message || error.message}`);
        console.error('Error calculating salaries:', error.response?.data || error.message);
      }
    }
  };

  const salaryTableHeaders = [
    'Worker Name',
    'Site',
    'Week Start',
    'Week End',
    'Attendance (Days)',
    'Gross Salary',
    'Advance Deducted',
    'Net Salary',
    'Paid'
  ];

  const advanceTableHeaders = [
    'Worker Name',
    'Site',
    'Amount',
    'Date',
    'Reason',
    'Recorded By',
    'Actions'
  ];

  if (loading) {
    return <div className="p-4 text-center">Loading salary and advance logs...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Salary & Advance Logs</h2>

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
              <option value="">All Sites</option>
              {sites.map(site => (
                <option key={site._id} value={site._id}>{site.name}</option>
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
              {workers.map(worker => (
                <option key={worker._id} value={worker._id}>{worker.name} ({worker.role})</option>
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
          <button onClick={applyFilters} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
            Reset Filters
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
            <FaDollarSign className="mr-2 text-green-600" /> Weekly Salary Logs
          </h3>
          <button onClick={handleCalculateWeeklySalaries} className="px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700">
            Calculate / Update Weekly Salaries
          </button>
        </div>
        <Table
          headers={salaryTableHeaders}
          data={salaryLogs}
          emptyMessage="No weekly salary logs found."
          renderRow={log => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.workerId?.name || 'N/A'}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.siteId?.name || 'N/A'}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{new Date(log.weekStart).toLocaleDateString()}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{new Date(log.weekEnd).toLocaleDateString()}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.totalAttendanceDays.toFixed(1)}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">${log.grossSalary.toFixed(2)}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">${log.totalAdvanceDeducted.toFixed(2)}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">${log.netSalary.toFixed(2)}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.paid ? 'Yes' : 'No'}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2"></td>
            </tr>
          )}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
            <FaArrowRight className="mr-2 text-orange-600" /> Advance Payment Logs
          </h3>
          <button onClick={handleAddAdvance} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700">
            Add New Advance
          </button>
        </div>
        <Table
          headers={advanceTableHeaders}
          data={advanceLogs}
          emptyMessage="No advance payment logs found."
          renderRow={log => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.workerId?.name || 'N/A'}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.siteId?.name || 'N/A'}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">${log.amount.toFixed(2)}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{new Date(log.date).toLocaleDateString()}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.reason}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.recordedBy?.name || 'N/A'}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2">
                <button onClick={() => handleEditAdvance(log)} className="text-blue-600 hover:text-blue-800">
                  Edit
                </button>
                <button onClick={() => handleDeleteAdvance(log._id)} className="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </td>
            </tr>
          )}
        />
      </div>

      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title={selectedAdvance ? 'Edit Advance Entry' : 'Add New Advance Entry'}
        size="md"
      >
        <AdvanceForm advanceEntry={selectedAdvance} onSave={handleSaveAdvance} onClose={() => setIsAdvanceModalOpen(false)} />
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default SalaryAdvanceLogs;
