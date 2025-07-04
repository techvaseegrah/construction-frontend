// construction/frontend/src/pages/Admin/SalaryAdvanceLogs.js
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import AdvanceForm from '../../components/supervisor/AdvanceForm';
import { FaFilter, FaPlus, FaEdit, FaTrash, FaMoneyBillAlt, FaCalculator, FaCheckCircle, FaTimesCircle, FaCheckDouble, FaBan } from 'react-icons/fa';

const SalaryAdvanceLogs = () => {
  const [salaryLogs, setSalaryLogs] = useState([]);
  const [advanceLogs, setAdvanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ siteId: '', workerId: '', startDate: '', endDate: '', paidStatus: '' });

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);

  // NEW: State for selected salary log IDs
  const [selectedSalaryLogIds, setSelectedSalaryLogIds] = useState(new Set());
  // NEW: State for "select all" checkbox
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);


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
      setSelectedSalaryLogIds(new Set()); // Clear selections on new fetch
      setIsSelectAllChecked(false); // Uncheck select all on new fetch

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
      const sitesRes = await API.get('/projects');
      setSites(sitesRes.data);

      const workersRes = await API.get('/workers');
      setWorkers(workersRes.data);
    } catch (error) {
      toast.error('Failed to load sites or workers for filter.');
      console.error('Error fetching sites/workers:', error);
    }
  };

  useEffect(() => {
    fetchSitesAndWorkers();
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  // NEW: Effect to update select all checkbox state
  useEffect(() => {
    if (salaryLogs.length > 0 && selectedSalaryLogIds.size === salaryLogs.length) {
      setIsSelectAllChecked(true);
    } else {
      setIsSelectAllChecked(false);
    }
  }, [selectedSalaryLogIds, salaryLogs.length]);


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
        siteId: filters.siteId || undefined,
      };
      const res = await API.post('/reports/calculate-weekly-salaries', payload);
      toast.success(res.data.message || 'Salaries calculated successfully!');
      fetchLogs();
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
        fetchLogs();
      } catch (error) {
        toast.error(`Failed to update paid status: ${error.response?.data?.message || error.message}`);
        console.error('Error updating paid status:', error);
      }
    }
  };

  // NEW: Handle individual checkbox change
  const handleCheckboxChange = (id) => {
    setSelectedSalaryLogIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  // NEW: Handle "Select All" checkbox change
  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setIsSelectAllChecked(checked);
    setSelectedSalaryLogIds((prevSelected) => {
      const newSelected = new Set();
      if (checked) {
        salaryLogs.forEach(log => newSelected.add(log._id));
      }
      return newSelected;
    });
  };

  // NEW: Handle marking selected salaries as paid/unpaid
  const handleMarkSelected = async (status) => {
    if (selectedSalaryLogIds.size === 0) {
      toast.info('No salaries selected to update.');
      return;
    }

    const confirmation = status
      ? `Are you sure you want to mark ${selectedSalaryLogIds.size} selected salaries as PAID?`
      : `Are you sure you want to mark ${selectedSalaryLogIds.size} selected salaries as UNPAID?`;

    if (window.confirm(confirmation)) {
      let successCount = 0;
      let failCount = 0;
      setLoading(true);

      for (const id of selectedSalaryLogIds) {
        const logToUpdate = salaryLogs.find(log => log._id === id);
        if (logToUpdate && logToUpdate.paid !== status) { // Only update if status is different
          try {
            await API.put(`/reports/salary-logs/${id}/paid`, { paid: status });
            successCount++;
          } catch (error) {
            console.error(`Failed to update salary log ${id}:`, error);
            failCount++;
          }
        }
      }

      setLoading(false);
      if (successCount > 0) {
        toast.success(`${successCount} salaries marked as ${status ? 'PAID' : 'UNPAID'} successfully!`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} salaries failed to update.`);
      }
      fetchLogs(); // Refresh logs after bulk update
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

  // NEW: Modified salaryTableHeaders to include a checkbox column
  const salaryTableHeaders = [
    <input
      type="checkbox"
      checked={isSelectAllChecked}
      onChange={handleSelectAllChange}
      className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
      title="Select All"
    />,
    'Worker', 'Site', 'Week Start', 'Week End', 'Att. Days', 'Gross Salary', 'Advance Deducted', 'Net Salary', 'Paid', 'Actions'
  ];
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
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-3">
            {/* NEW: Mark Selected as Paid Button */}
            <button
              onClick={() => handleMarkSelected(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 disabled:opacity-50"
              disabled={loading || selectedSalaryLogIds.size === 0}
            >
              <FaCheckDouble className="mr-2" /> Mark Selected as Paid
            </button>
            {/* NEW: Mark Selected as Unpaid Button */}
            <button
              onClick={() => handleMarkSelected(false)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 disabled:opacity-50"
              disabled={loading || selectedSalaryLogIds.size === 0}
            >
              <FaBan className="mr-2" /> Mark Selected as Unpaid
            </button>
          </div>
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
              {/* NEW: Individual Checkbox */}
              <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                <input
                  type="checkbox"
                  checked={selectedSalaryLogIds.has(log._id)}
                  onChange={() => handleCheckboxChange(log._id)}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
              </td>
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