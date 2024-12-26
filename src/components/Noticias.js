import React from 'react';

const Noticias = () => {
  const noticias = [
    { id: 1, title: 'Peñarol gana el clásico', date: '2024-12-20', summary: 'El club obtuvo una victoria por 2-1 contra Nacional.' },
    { id: 2, title: 'Nuevo fichaje: Leito Fernandez', date: '2024-12-15', summary: 'Peñarol anuncia el fichaje del delantero.' },
  ];

  return (
    <div className="noticias mt-4">
      <h3>Noticias de Peñarol</h3>
      <div className="list-group">
        {noticias.map(noticia => (
          <div key={noticia.id} className="list-group-item">
            <h5>{noticia.title}</h5>
            <p className="text-muted">{noticia.date}</p>
            <p>{noticia.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Noticias;
