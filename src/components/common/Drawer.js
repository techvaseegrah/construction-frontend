// construction/frontend/src/components/common/Drawer.js
import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa'; // Close icon

const Drawer = ({ isOpen, onClose, title, children }) => {
  const drawerRef = useRef(null);

  // Close drawer when clicking outside (backdrop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the drawer is open and the click is outside the drawer content
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Add/remove event listener based on drawer's open state
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]); // Dependencies: re-run if isOpen or onClose changes

  // Handle Escape key to close
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add/remove event listener based on drawer's open state
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
    }

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]); // Dependencies: re-run if isOpen or onClose changes


  return (
    <>
      {/* Backdrop with blur and dimming */}
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      ></div>

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full
          w-[90%] md:w-[400px] lg:w-[500px] xl:w-[500px] 
          bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col rounded-l-lg`} // Rounded left side for aesthetics
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-tl-lg">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-200"
            aria-label="Close drawer"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Drawer Content - Scrollable with padding */}
        <div className="flex-1 overflow-y-auto p-4"> {/* Added p-4 for internal padding */}
          {children}
        </div>
      </div>
    </>
  );
};

export default Drawer;