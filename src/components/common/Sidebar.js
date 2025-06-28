// contract/frontend/src/components/common/Sidebar.js
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext to use logout
import {
  FaTachometerAlt, FaProjectDiagram,  FaClipboardList,
  FaMoneyBillAlt, FaBoxOpen, FaTasks, FaFileInvoiceDollar, FaCog, FaSignOutAlt,
  FaHardHat, FaBuilding, FaUserCheck,  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const Sidebar = ({ role }) => {
  const { logout } = useContext(AuthContext); // Get logout function from AuthContext

  // Define navigation items based on role
  const navItems = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FaTachometerAlt },
      { name: 'Manage Projects', path: '/admin/projects', icon: FaProjectDiagram },
      { name: 'Manage Workers', path: '/admin/workers', icon: FaHardHat },
      { name: 'Manage Roles & Salaries', path: '/admin/roles-salaries', icon: FaMoneyBillAlt },
      { name: 'Attendance Overview', path: '/admin/attendance-overview', icon: FaUserCheck },
      { name: 'Salary & Advance Logs', path: '/admin/salary-advance-logs', icon: FaFileInvoiceDollar },
      { name: 'Raw Material Logs', path: '/admin/raw-material-logs', icon: FaBoxOpen },
      { name: 'Daily Activity Logs', path: '/admin/daily-activity-logs', icon: FaTasks },
      { name: 'Report Generator', path: '/admin/report-generator', icon: FaClipboardList },
      { name: 'Admin Settings', path: '/admin/settings', icon: FaCog },
    ],
    supervisor: [
      { name: 'My Dashboard', path: '/supervisor/dashboard', icon: FaTachometerAlt },
      { name: 'My Sites', path: '/supervisor/my-sites', icon: FaBuilding },
      { name: 'Mark Attendance', path: '/supervisor/mark-attendance', icon: FaUserCheck },
      { name: 'Log Raw Materials', path: '/supervisor/log-raw-materials', icon: FaBoxOpen },
      { name: 'Log Daily Activities', path: '/supervisor/log-daily-activities', icon: FaTasks },
      { name: 'Manage Advances', path: '/supervisor/manage-advances', icon: FaMoneyBillAlt },
      { name: 'Generate Reports', path: '/supervisor/generate-reports', icon: FaClipboardList },
    ],
  };

  // Get the appropriate navigation items based on the user's role
  // Use optional chaining and fallback to empty array for safety
  const currentNavItems = navItems[role] || [];

  const [isOpen, setIsOpen] = React.useState(true); // State for sidebar toggle

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`flex flex-col bg-indigo-800 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} h-full shadow-lg relative`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-4 transform -translate-y-1/2 p-1 bg-indigo-600 rounded-full shadow-md text-white z-10"
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      <div className="p-4 flex items-center border-b border-indigo-700">
        {isOpen ? (
          <h1 className="text-2xl font-bold">Contractor CMS</h1>
        ) : (
          <span className="text-2xl font-bold ml-2">CMS</span>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {currentNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-md text-sm font-medium ${
                isActive ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700 hover:text-white'
              } ${isOpen ? '' : 'justify-center'}`
            }
            title={item.name} // Tooltip for collapsed state
          >
            <item.icon className={`text-xl ${isOpen ? 'mr-3' : ''}`} />
            {isOpen && item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-indigo-700">
        <button
          onClick={logout}
          className={`flex items-center p-3 rounded-md text-sm font-medium w-full text-left bg-red-600 hover:bg-red-700 ${isOpen ? '' : 'justify-center'}`}
          title={isOpen ? "Logout" : "Logout"}
        >
          <FaSignOutAlt className={`text-xl ${isOpen ? 'mr-3' : ''}`} />
          {isOpen && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
