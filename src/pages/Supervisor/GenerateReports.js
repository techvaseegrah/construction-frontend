// contract/frontend/src/pages/Supervisor/GenerateReports.js
import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaFilePdf, FaFileExcel, FaFilter } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const SupervisorGenerateReports = () => {
  const { user } = useContext(AuthContext);
  const [sites, setSites] = useState([]);
  const [filters, setFilters] = useState({
    siteId: '',
    startDate: '',
    endDate: '',
    format: 'json', // Default to JSON
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMySites = async () => {
      try {
        const res = await API.get('/supervisor/my-sites'); // Supervisor only sees their sites
        setSites(res.data);
        // If only one site is assigned, pre-select it
        if (res.data.length === 1) {
          setFilters(prev => ({ ...prev, siteId: res.data[0]._id }));
        }
      } catch (error) {
        toast.error('Failed to load sites for report generation.');
        console.error('Error fetching sites:', error);
      }
    };
    fetchMySites();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const generateReport = async (format) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure siteId is provided if supervisor only has one or selects one
      if (user.role === 'supervisor' && !filters.siteId) {
        toast.error('Please select a site to generate a report.', { autoClose: 5000 });
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({ ...filters, format }).toString();
      const res = await API.get(`/reports/generate?${params}`, {
        responseType: format === 'pdf' ? 'blob' : 'json', // Important for PDF download
      });

      if (format === 'pdf') {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `supervisor_report_${filters.siteId ? filters.siteId : 'all_sites'}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('PDF report generated and downloaded!');
      } else if (format === 'excel') {
        toast.info('Excel export is not yet fully implemented on the backend. Displaying JSON data.', { autoClose: false });
        setReportData(res.data.reportData || res.data); // Backend sends reportData inside a message object
      }
      else {
        setReportData(res.data);
        toast.success('Report generated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to generate report.';
      setError(msg);
      toast.error(msg);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Generate Reports</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <FaFilter className="mr-2 text-indigo-600" /> Filters & Options
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site</label>
            <select
              name="siteId"
              value={filters.siteId}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required={user.role === 'supervisor'} // Require site selection for supervisor
            >
              <option value="">Select My Site</option>
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

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => generateReport('pdf')}
            disabled={loading || (user.role === 'supervisor' && !filters.siteId)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <FaFilePdf className="mr-2" /> {loading ? 'Generating...' : 'Generate PDF'}
          </button>
          <button
            onClick={() => generateReport('excel')}
            disabled={loading || (user.role === 'supervisor' && !filters.siteId)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <FaFileExcel className="mr-2" /> {loading ? 'Generating...' : 'Generate Excel (JSON Preview)'}
          </button>
          <button
            onClick={() => generateReport('json')}
            disabled={loading || (user.role === 'supervisor' && !filters.siteId)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Generate JSON Report
          </button>
        </div>
      </div>

      {loading && <div className="p-4 text-center">Generating report...</div>}
      {error && <div className="p-4 text-center text-red-600">Error: {error}</div>}

      {reportData && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Generated Report (JSON Preview)</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
            {JSON.stringify(reportData, null, 2)}
          </pre>
          <p className="mt-4 text-gray-600">
            For a formatted report, please use the PDF option. Excel export is pending backend implementation.
          </p>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default SupervisorGenerateReports;