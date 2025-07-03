// construction/frontend/src/components/admin/BreakdownDrawerContent.js
import React from 'react';
import Table from '../common/Table';

const BreakdownDrawerContent = ({ breakdownType, projectSummaries, overallSummary }) => {
  let headers = [];
  let data = [];
  let renderRow = () => {};
  let emptyMessage = 'No data available for this breakdown.';

  let sourceData = projectSummaries;

  switch (breakdownType) {
    case 'projects':
      headers = ['Project Name', 'Location', 'Start Date', 'Workers'];
      data = sourceData;
      renderRow = (project) => (
        <tr key={project._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{project.name}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{project.location}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{new Date(project.startDate).toLocaleDateString()}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{project.totalWorkers}</td>
        </tr>
      );
      emptyMessage = 'No projects found.';
      break;

    case 'workers':
      headers = ['Project Name', 'Total Workers'];
      data = sourceData;
      renderRow = (project) => (
        <tr key={project._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{project.name}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{project.totalWorkers}</td>
        </tr>
      );
      emptyMessage = 'No projects found with worker data.';
      break;

    case 'material_cost':
      headers = ['Project Name', 'Material Cost'];
      data = sourceData;
      renderRow = (project) => (
        <tr key={project._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{project.name}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">₹{project.totalMaterialCost.toFixed(2)}</td>
        </tr>
      );
      emptyMessage = 'No projects found with material cost data.';
      break;

    case 'salary_cost':
      headers = ['Project Name', 'Salary Cost'];
      data = sourceData;
      renderRow = (project) => (
        <tr key={project._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{project.name}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">₹{project.totalSalaryCost.toFixed(2)}</td>
        </tr>
      );
      emptyMessage = 'No projects found with salary cost data.';
      break;

    case 'overall_cost':
      headers = ['Project Name', 'Overall Cost'];
      data = sourceData;
      renderRow = (project) => (
        <tr key={project._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{project.name}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">₹{project.overallCost.toFixed(2)}</td>
        </tr>
      );
      emptyMessage = 'No projects found with overall cost data.';
      break;

    case 'supervisors':
      headers = ['Supervisor Name', 'Username', 'Email', 'Assigned Sites'];
      data = overallSummary?.supervisorsList || [];
      renderRow = (supervisor) => (
        <tr key={supervisor._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{supervisor.name || 'N/A'}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{supervisor.username || 'N/A'}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{supervisor.email || 'N/A'}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{supervisor.assignedSites?.map(s => s.name).join(', ') || 'None'}</td>
        </tr>
      );
      emptyMessage = 'No supervisor data available.';
      break;

    // --- Supervisor Dashboard Breakdowns ---
    case 'assigned_sites': // Supervisor: Total Assigned Sites Breakdown
      headers = ['Site Name', 'Location', 'Start Date', 'Total Workers'];
      data = overallSummary?.assignedSitesList || [];
      renderRow = (site) => (
        <tr key={site._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{site.name}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{site.location}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{new Date(site.startDate).toLocaleDateString()}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{site.totalWorkers}</td>
        </tr>
      );
      emptyMessage = 'No assigned sites found.';
      break;

    case 'workers_assigned_sites': // Supervisor: Total Workers (across assigned sites) Breakdown
      headers = ['Worker Name', 'Role', 'Assigned Sites'];
      data = overallSummary?.allAssignedWorkersList || [];
      renderRow = (worker) => (
        <tr key={worker._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{worker.name}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{worker.role}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{worker.assignedSites?.join(', ') || 'None'}</td>
        </tr>
      );
      emptyMessage = 'No workers found across assigned sites.';
      break;

    case 'material_cost_assigned_sites': // Supervisor: Total Material Cost Breakdown (per site)
      headers = ['Site Name', 'Material Cost'];
      data = sourceData;
      renderRow = (site) => (
        <tr key={site._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{site.name}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">₹{site.totalMaterialCost.toFixed(2)}</td>
        </tr>
      );
      emptyMessage = 'No material cost data for assigned sites.';
      break;

    case 'advance_given_assigned_sites': // Supervisor: Total Advance Given Breakdown (per site)
      headers = ['Site Name', 'Advance Given'];
      data = sourceData;
      renderRow = (site) => (
        <tr key={site._id} className="hover:bg-gray-50">
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{site.name}</td>
          <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">₹{site.totalAdvanceGiven.toFixed(2)}</td>
        </tr>
      );
      emptyMessage = 'No advance data for assigned sites.';
      break;

    default:
      return <div className="p-4 text-center text-gray-600">Select a card to view its breakdown.</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-600">{emptyMessage}</div>;
  }

  return (
    <div className="p-2">
      <Table
        headers={headers}
        data={data}
        emptyMessage={emptyMessage}
        renderRow={renderRow}
      />
    </div>
  );
};

export default BreakdownDrawerContent;