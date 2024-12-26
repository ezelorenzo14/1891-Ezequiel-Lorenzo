// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ItemListContainer from './components/ItemListContainer';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<ItemListContainer greeting="¡Bienvenido a la página de Peñarol!" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
