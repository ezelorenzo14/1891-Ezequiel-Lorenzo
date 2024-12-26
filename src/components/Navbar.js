// src/components/Navbar.js
import React from 'react';
import CartWidget from './CartWidget';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src="../assets/logo.jpg" alt="Peñarol" width="50" />
          Peñarol
        </Link>
        <div className="d-flex align-items-center">
          {/* Agregar el CartWidget aca */}
          <CartWidget />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
