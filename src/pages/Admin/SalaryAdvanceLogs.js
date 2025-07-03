// construction/frontend/src/pages/Admin/SalaryAdvanceLogs.js
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import AdvanceForm from '../../components/supervisor/AdvanceForm'; // Reusing form
import { FaFilter, FaPlus, FaEdit, FaTrash, FaMoneyBillAlt, FaCalculator, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const SalaryAdvanceLogs = () => {
  const [salaryLogs, setSalaryLogs] = useState([]);
  const [advanceLogs, setAdvanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ siteId: '', workerId: '', startDate: '', endDate: '', paidStatus: '' });

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch Salary Logs
      const salaryParams = new URLSearchParams({
        siteId: filters.siteId,
        workerId: filters.workerId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        paidStatus: filters.paidStatus
      }).toString();
      const salaryRes = await API.get(`/reports/salary-logs?${salaryParams}`);
      setSalaryLogs(salaryRes.data);

      // Fetch Advance Logs
      const advanceParams = new URLSearchParams({
        siteId: filters.siteId,
        workerId: filters.workerId,
        startDate: filters.startDate,
        endDate: filters.endDate
      }).toString();
      const advanceRes = await API.get(`/advances?${advanceParams}`);
      setAdvanceLogs(advanceRes.data);

    } catch (error) {
      toast.error('Failed to load salary and advance logs.');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSitesAndWorkers = async () => {
    try {
      const sitesRes = await API.get('/projects'); // Admin can see all sites
      setSites(sitesRes.data);

      const workersRes = await API.get('/workers'); // Admin can see all workers
      setWorkers(workersRes.data);
    } catch (error) {
      toast.error('Failed to load sites or workers for filter.');
      console.error('Error fetching sites/workers:', error);
    }
  };

  useEffect(() => {
    fetchSitesAndWorkers();
    fetchLogs(); // Initial fetch
  }, []);

  useEffect(() => {
    fetchLogs(); // Refetch when filters change
  }, [filters]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchLogs();

  const resetFilters = () => {
    setFilters({ siteId: '', workerId: '', startDate: '', endDate: '', paidStatus: '' });
  };

  const handleCalculateSalaries = async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error('Please select a start and end date to calculate salaries.');
      return;
    }
    try {
      const payload = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        siteId: filters.siteId || undefined, // Pass siteId if selected
      };
      const res = await API.post('/reports/calculate-weekly-salaries', payload);
      toast.success(res.data.message || 'Salaries calculated successfully!');
      fetchLogs(); // Refresh logs after calculation
    } catch (error) {
      toast.error(`Failed to calculate salaries: ${error.response?.data?.message || error.message}`);
      console.error('Error calculating salaries:', error.response?.data || error.message);
    }
  };

  const handleTogglePaidStatus = async (salaryLogId, currentPaidStatus) => {
    const newPaidStatus = !currentPaidStatus;
    const confirmation = newPaidStatus
      ? 'Are you sure you want to mark this salary as PAID?'
      : 'Are you sure you want to mark this salary as UNPAID?';

    if (window.confirm(confirmation)) {
      try {
        await API.put(`/reports/salary-logs/${salaryLogId}/paid`, { paid: newPaidStatus });
        toast.success(`Salary marked as ${newPaidStatus ? 'PAID' : 'UNPAID'} successfully!`);
        fetchLogs(); // Refresh logs
      } catch (error) {
        toast.error(`Failed to update paid status: ${error.response?.data?.message || error.message}`);
        console.error('Error updating paid status:', error);
      }
    }
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

  const salaryTableHeaders = ['Worker', 'Site', 'Week Start', 'Week End', 'Att. Days', 'Gross Salary', 'Advance Deducted', 'Net Salary', 'Paid', 'Actions'];
  const advanceTableHeaders = ['Worker Name', 'Site', 'Amount', 'Date', 'Reason', 'Recorded By', 'Actions'];

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

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Paid Status</label>
            <select
              name="paidStatus"
              value={filters.paidStatus}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">All</option>
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </select>
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

      {/* Weekly Salary Logs Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaMoneyBillAlt className="mr-3 text-green-600" /> Weekly Salary Logs
        </h3>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCalculateSalaries}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            <FaCalculator className="mr-2" /> Calculate / Update Weekly Salaries
          </button>
        </div>
        <Table
          headers={salaryTableHeaders}
          data={salaryLogs}
          emptyMessage="No weekly salary logs found."
          renderRow={(log) => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                {log.workerId?.name || 'N/A'}
              </td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                {log.siteId?.name || 'N/A'}
              </td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                {new Date(log.weekStart).toLocaleDateString()}
              </td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                {new Date(log.weekEnd).toLocaleDateString()}
              </td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                {log.totalAttendanceDays.toFixed(1)}
              </td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                ₹{log.grossSalary.toFixed(2)}
              </td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                ₹{log.totalAdvanceDeducted.toFixed(2)}
              </td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                ₹{log.netSalary.toFixed(2)}
              </td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                {log.paid ? (
                  <FaCheckCircle className="text-green-500" title={`Paid on ${new Date(log.paymentDate).toLocaleDateString()}`} />
                ) : (
                  <FaTimesCircle className="text-red-500" title="Unpaid" />
                )}
              </td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                <button
                  onClick={() => handleTogglePaidStatus(log._id, log.paid)}
                  className={`px-3 py-1 text-xs rounded-md ${
                    log.paid ? 'bg-red-200 text-red-800 hover:bg-red-300' : 'bg-green-200 text-green-800 hover:bg-green-300'
                  }`}
                >
                  {log.paid ? 'Mark Unpaid' : 'Mark Paid'}
                </button>
              </td>
            </tr>
          )}
        />
      </div>

      {/* Advance Payment Logs Section */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaMoneyBillAlt className="mr-3 text-purple-600" /> Advance Payment Logs
        </h3>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddAdvance}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
          >
            <FaPlus className="mr-2" /> Add New Advance
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
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">₹{log.amount.toFixed(2)}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{new Date(log.date).toLocaleDateString()}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.reason}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{log.recordedBy?.name || 'N/A'}</td>
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm flex space-x-2">
                <button onClick={() => handleEditAdvance(log)} className="text-blue-600 hover:text-blue-800">
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteAdvance(log._id)} className="text-red-600 hover:text-red-800">
                  <FaTrash />
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
        <AdvanceForm
          advanceEntry={selectedAdvance}
          onSave={handleSaveAdvance}
          onClose={() => setIsAdvanceModalOpen(false)}
          siteId={filters.siteId}
        />
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default SalaryAdvanceLogs;