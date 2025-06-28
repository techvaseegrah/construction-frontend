import React from 'react';
import {
  FaTimes
} from 'react-icons/fa';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return ( <
    div className = "fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto" >
    <
    div className = {
      `bg-white rounded-lg shadow-xl p-6 w-full ${sizeClasses[size]} transform transition-all sm:my-8 sm:align-middle sm:w-full`
    } >
    <
    div className = "flex justify-between items-center pb-3 border-b border-gray-200" >
    <
    h3 className = "text-xl font-semibold text-gray-800" > {
      title
    } </h3> <
    button onClick = {
      onClose
    }
    className = "text-gray-500 hover:text-gray-700 focus:outline-none" >
    <
    FaTimes size = {
      20
    }
    /> 
    </button> 
    </div> 
    <div className = "mt-4 text-gray-700" > {
      children
    } </div> 
    </div> 
    </div>
  );
};

export default Modal;