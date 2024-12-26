// src/components/CartWidget.js
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa'; 

const CartWidget = () => {
  const itemsInCart = 3; 

  return (
    <div className="cart-widget d-flex align-items-center">
      <FaShoppingCart size={30} />
      <span className="badge bg-warning ms-2">{itemsInCart}</span>
    </div>
  );
};

export default CartWidget;
