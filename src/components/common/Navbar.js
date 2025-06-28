import React, {
  useContext
} from 'react';
import {
  AuthContext
} from '../../context/AuthContext';
import {
  FaUserCircle
} from 'react-icons/fa';

const Navbar = () => {
  const {
    user
  } = useContext(AuthContext);

  return ( <
    nav className = "bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10" >
    <
    div >
    <h1 className = "text-2xl font-bold text-gray-800" > Contractor Management System </h1> 
    </div> 
    <div className = "flex items-center" >
    <FaUserCircle className = "text-gray-600 mr-2"
    size = {
      24
    }
    /> <
    span className = "text-gray-800 font-medium" > {
      user ? user.name : 'Guest'
    } </span> 
    </div> 
    </nav>
  );
};

export default Navbar;