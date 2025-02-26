const fs = require('fs');
const path = require('path');

const cartsFile = path.join(__dirname, '../api/carts/carts.json');

class CartManager {
  static async getAllCarts() {
    const carts = await fs.promises.readFile(cartsFile, 'utf-8');
    return JSON.parse(carts);
  }

  static async getCartById(cid) {
    const carts = await this.getAllCarts();
    return carts.find(c => c.id === cid);
  }

  static async createCart() {
    const carts = await this.getAllCarts();
    const newCart = {
      id: carts.length ? carts[carts.length - 1].id + 1 : 1,
      products: []
    };
    carts.push(newCart);
    await fs.promises.writeFile(cartsFile, JSON.stringify(carts, null, 2));
    return newCart;
  }

  static async addProductToCart(cid, pid) {
    const carts = await this.getAllCarts();
    const cart = carts.find(c => c.id === cid);
    if (cart) {
      const productIndex = cart.products.findIndex(p => p.product === pid);
      if (productIndex === -1) {
        cart.products.push({ product: pid, quantity: 1 });
      } else {
        cart.products[productIndex].quantity += 1;
      }
      await fs.promises.writeFile(cartsFile, JSON.stringify(carts, null, 2));
      return cart;
    }
    return null;
  }

  static async removeProductFromCart(cid, pid) {
    const carts = await this.getAllCarts();
    const cart = carts.find(c => c.id === cid);
    if (cart) {
      const updatedProducts = cart.products.filter(p => p.product !== pid);
      cart.products = updatedProducts;
      await fs.promises.writeFile(cartsFile, JSON.stringify(carts, null, 2));
      return cart;
    }
    return null;
  }

  static async updateProductQuantity(cid, pid, quantity) {
    const carts = await this.getAllCarts();
    const cart = carts.find(c => c.id === cid);
    if (cart) {
      const productIndex = cart.products.findIndex(p => p.product === pid);
      if (productIndex !== -1) {
        cart.products[productIndex].quantity = quantity;
        await fs.promises.writeFile(cartsFile, JSON.stringify(carts, null, 2));
        return cart;
      }
    }
    return null;
  }

  static async clearCart(cid) {
    const carts = await this.getAllCarts();
    const cart = carts.find(c => c.id === cid);
    if (cart) {
      cart.products = [];
      await fs.promises.writeFile(cartsFile, JSON.stringify(carts, null, 2));
      return cart;
    }
    return null;
  }
}

module.exports = CartManager;
