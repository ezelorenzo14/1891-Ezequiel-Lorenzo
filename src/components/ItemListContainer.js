import React from 'react';

const ItemListContainer = ({ greeting }) => {
  return (
    <div className="item-list-container text-center mt-4">
      <h2>{greeting}</h2>
      <p className="text-muted">Aquí encontrarás toda la información sobre el Club Atlético Peñarol.</p>
    </div>
  );
};

export default ItemListContainer;
