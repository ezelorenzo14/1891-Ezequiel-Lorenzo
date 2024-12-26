// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ItemListContainer from './components/ItemListContainer';
import Noticias from './components/Noticias';
import Jugadores from './components/Jugadores';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<ItemListContainer greeting="¡Bienvenido a la página de Peñarol!" />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/jugadores" element={<Jugadores />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
