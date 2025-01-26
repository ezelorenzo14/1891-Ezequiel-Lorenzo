const express = require('express');
const app = express();
const ProductManager = require('./managers/productManager');
const CartManager = require('./managers/cartManager');

app.use(express.json());
const port = 8080;

// Rutas de productos
const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await ProductManager.getAllProducts();
  res.json(products);
});

productRouter.post('/', async (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  const newProduct = { title, description, code, price, status, stock, category, thumbnails };
  const addedProduct = await ProductManager.addProduct(newProduct);
  res.status(201).json(addedProduct);
});

productRouter.put('/:pid', async (req, res) => {
  const { pid } = req.params;
  const updatedProduct = req.body;
  const product = await ProductManager.updateProduct(Number(pid), updatedProduct);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

productRouter.delete('/:pid', async (req, res) => {
  const { pid } = req.params;
  const deletedProductId = await ProductManager.deleteProduct(Number(pid));
  if (deletedProductId) {
    res.json({ message: `Product with ID ${pid} deleted` });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Rutas de carritos
const cartRouter = express.Router();

cartRouter.post('/', async (req, res) => {
  const newCart = await CartManager.createCart();
  res.status(201).json(newCart);
});

cartRouter.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  const cart = await CartManager.getCartById(Number(cid));
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});

cartRouter.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const updatedCart = await CartManager.addProductToCart(Number(cid), Number(pid));
  if (updatedCart) {
    res.json(updatedCart);
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});

// Montar los routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
