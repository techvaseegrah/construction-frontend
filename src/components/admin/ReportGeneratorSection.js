// construction/frontend/src/components/admin/ReportGeneratorSection.js
import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { FaFilePdf, FaFileExcel, FaFilter } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const ReportGeneratorSection = ({ siteId }) => {
  const { user } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    format: 'json', // Default to JSON
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset filters and report data when siteId changes
    setFilters({
      startDate: '',
      endDate: '',
      format: 'json',
    });
    setReportData(null);
    setError(null);
    setLoading(false);
  }, [siteId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const generateReport = async (format) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ ...filters, siteId, format }).toString();
      const res = await API.get(`/reports/generate?${params}`, { // Backend handles admin permissions
        responseType: format === 'pdf' ? 'blob' : 'json', // Important for PDF download
      });

      if (format === 'pdf') {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${siteId}_${new Date().toISOString().slice(0,10)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('PDF report generated and downloaded!');
      } else if (format === 'excel') {
        // This toast indicates that Excel export is a backend feature,
        // and frontend will display JSON preview if backend doesn't send Excel directly.
        toast.info('Excel export is not yet fully implemented on the backend. Displaying JSON data.', { autoClose: false });
        setReportData(res.data.reportData || res.data);
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
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaFilePdf className="mr-2 text-red-600" /> Generate Reports
      </h3>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <FaFilter className="mr-2 text-indigo-600" /> Filters & Options
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            disabled={loading}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <FaFilePdf className="mr-2" /> {loading ? 'Generating...' : 'Generate PDF'}
          </button>
          <button
            onClick={() => generateReport('excel')}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <FaFileExcel className="mr-2" /> {loading ? 'Generating...' : 'Generate Excel (JSON Preview)'}
          </button>
          <button
            onClick={() => generateReport('json')}
            disabled={loading}
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
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Generated Report (JSON Preview)</h4>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
            {JSON.stringify(reportData, null, 2)}
          </pre>
          <p className="mt-4 text-gray-600">
            For a formatted report, please use the PDF option. Excel export is pending backend implementation.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportGeneratorSection;