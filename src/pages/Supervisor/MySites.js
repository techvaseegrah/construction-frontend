// construction/frontend/src/pages/Supervisor/MySites.js
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBuilding, FaHardHat, FaMapMarkerAlt, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// No longer importing SiteOperationsDisplay here

const MySites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed selectedSite and showOperations states

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchMySites = async () => {
      try {
        const res = await API.get('/supervisor/my-sites');
        setSites(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch assigned sites.';
        setError(msg);
        toast.error('Failed to load your assigned sites.');
      } finally {
        setLoading(false);
      }
    };
    fetchMySites();
  }, []);

  // Handler for clicking a site card - now navigates to SiteDetailsPage
  const handleSiteClick = (siteId) => {
    navigate(`/supervisor/sites/${siteId}`); // Navigate to the new SiteDetailsPage route
  };

  if (loading) {
    return <div className="p-4 text-center">Loading your assigned sites...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (sites.length === 0) {
    return <div className="p-4 text-center text-gray-600">You are not currently assigned to any sites.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Assigned Projects</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map(site => (
          <div
            key={site._id}
            className="bg-gray-50 rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-indigo-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            onClick={() => handleSiteClick(site._id)} // Pass site._id for navigation
          >
            <div>
              <div className="flex items-center mb-4">
                <FaBuilding className="mr-3 text-indigo-600" size={28} />
                <h3 className="text-xl font-semibold text-gray-800 truncate">
                  {site.name}
                </h3>
              </div>
              <div className="space-y-2 text-gray-700 text-sm mb-4">
                <p className="flex items-center"><FaMapMarkerAlt className="mr-2 text-gray-500" /> {site.location}</p>
                <p className="flex items-center"><FaCalendarAlt className="mr-2 text-gray-500" /> Start Date: {new Date(site.startDate).toLocaleDateString()}</p>
                <p className="flex items-center"><FaHardHat className="mr-2 text-gray-500" /> Workers Assigned: {site.assignedWorkers.length}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <span className="flex items-center text-indigo-600 font-medium group">
                View Site Details <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Removed conditional rendering of SiteOperationsDisplay */}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default MySites;