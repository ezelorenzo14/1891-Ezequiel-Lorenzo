const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, '../api/products/product.json');

class ProductManager {
  static async getAllProducts() {
    const products = await fs.promises.readFile(productsFile, 'utf-8');
    return JSON.parse(products);
  }

  static async getProductById(pid) {
    const products = await this.getAllProducts();
    return products.find(p => p.id === pid);
  }

  static async addProduct(product) {
    const products = await this.getAllProducts();
    product.id = products.length ? products[products.length - 1].id + 1 : 1;
    products.push(product);
    await fs.promises.writeFile(productsFile, JSON.stringify(products, null, 2));
    return product;
  }

  static async updateProduct(pid, updatedProduct) {
    const products = await this.getAllProducts();
    const productIndex = products.findIndex(p => p.id === pid);
    if (productIndex !== -1) {
      products[productIndex] = { ...products[productIndex], ...updatedProduct };
      await fs.promises.writeFile(productsFile, JSON.stringify(products, null, 2));
      return products[productIndex];
    }
    return null;
  }

  static async deleteProduct(pid) {
    const products = await this.getAllProducts();
    const filteredProducts = products.filter(p => p.id !== pid);
    if (products.length === filteredProducts.length) return null;
    await fs.promises.writeFile(productsFile, JSON.stringify(filteredProducts, null, 2));
    return pid;
  }
}

module.exports = ProductManager;
