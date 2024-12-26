// src/components/CartWidget.js
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa'; // Usamos React Icons para el ícono del carrito

const CartWidget = () => {
  const itemsInCart = 3;  // Número hardcodeado de entradas en el carrito (cambiar cuando haya más funcionalidad)

  return (
    <div className="cart-widget d-flex align-items-center">
      <FaShoppingCart size={30} />
      <span className="badge bg-warning ms-2">{itemsInCart}</span>
    </div>
  );
};

export default CartWidget;
