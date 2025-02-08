const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const { engine } = require('express-handlebars');  // Cambio aquí
const ProductManager = require('./managers/productManager');
const CartManager = require('./managers/cartManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars
app.engine('handlebars', engine());  // Cambio aquí
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Productos de ejemplo
let products = [
  { name: "Producto 1", price: 100 },
  { name: "Producto 2", price: 200 },
];

// Ruta principal (lista de productos)
app.get('/products', (req, res) => {
  res.render('index', { products });
});

// Ruta de productos en tiempo real (con WebSocket)
app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products });
});

// Rutas para agregar y eliminar productos
app.post('/addProduct', (req, res) => {
  const { name, price } = req.body;
  products.push({ name, price });
  io.emit('updateProducts', products); // Emitir actualización a través de WebSocket
  res.redirect('/realtimeproducts');
});

app.post('/deleteProduct', (req, res) => {
  const { name } = req.body;
  products = products.filter(product => product.name !== name);
  io.emit('updateProducts', products); // Emitir actualización a través de WebSocket
  res.redirect('/realtimeproducts');
});

// Inicializamos Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  socket.emit('updateProducts', products); // Enviar los productos actuales al nuevo cliente

  socket.on('disconnect', () => {
      console.log('Cliente desconectado');
  });
});

// Rutas de productos usando ProductManager
const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await ProductManager.getAllProducts();
  res.json(products);
});

productRouter.post('/', async (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  const newProduct = { title, description, code, price, status, stock, category, thumbnails };
  const addedProduct = await ProductManager.addProduct(newProduct);
  io.emit('updateProducts', addedProduct); // Emitir actualización a través de WebSocket
  res.status(201).json(addedProduct);
});

productRouter.put('/:pid', async (req, res) => {
  const { pid } = req.params;
  const updatedProduct = req.body;
  const product = await ProductManager.updateProduct(Number(pid), updatedProduct);
  if (product) {
    io.emit('updateProducts', await ProductManager.getAllProducts()); // Emitir lista de productos actualizada
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

productRouter.delete('/:pid', async (req, res) => {
  const { pid } = req.params;
  const deletedProductId = await ProductManager.deleteProduct(Number(pid));
  if (deletedProductId) {
    io.emit('updateProducts', await ProductManager.getAllProducts()); // Emitir lista de productos actualizada
    res.json({ message: `Product with ID ${pid} deleted` });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Rutas de carritos usando CartManager
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

// Configuración del servidor
server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
