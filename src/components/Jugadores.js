// src/components/Jugadores.js
import React from 'react';

const Jugadores = () => {
  const jugadores = [
    { id: 1, name: 'Fernando Muslera', position: 'Portero' },
    { id: 2, name: 'Gastón Rodríguez', position: 'Delantero' },
    // Agrega más jugadores aquí
  ];

  return (
    <div className="jugadores mt-4">
      <h3>Jugadores de Peñarol</h3>
      <ul className="list-group">
        {jugadores.map(jugador => (
          <li key={jugador.id} className="list-group-item">
            <strong>{jugador.name}</strong> - {jugador.position}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Jugadores;
