const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const { engine } = require('express-handlebars'); // Cambié esto
const ProductManager = require('./managers/productManager');
const CartManager = require('./managers/cartManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars
app.engine('handlebars', engine()); // Cambié esto
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
  try {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Faltan datos del producto' });
    }
    products.push({ name, price });
    io.emit('updateProducts', products); // Emitir actualización a través de WebSocket
    res.redirect('/realtimeproducts');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hubo un error al agregar el producto' });
  }
});

app.post('/deleteProduct', (req, res) => {
  try {
    const { name } = req.body;
    products = products.filter(product => product.name !== name);
    io.emit('updateProducts', products); // Emitir actualización a través de WebSocket
    res.redirect('/realtimeproducts');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hubo un error al eliminar el producto' });
  }
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
  try {
    const products = await ProductManager.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

productRouter.post('/', async (req, res) => {
  try {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    const newProduct = { title, description, code, price, status, stock, category, thumbnails };
    const addedProduct = await ProductManager.addProduct(newProduct);
    io.emit('updateProducts', addedProduct); // Emitir actualización a través de WebSocket
    res.status(201).json(addedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el producto' });
  }
});

productRouter.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const updatedProduct = req.body;
    const product = await ProductManager.updateProduct(Number(pid), updatedProduct);
    if (product) {
      io.emit('updateProducts', await ProductManager.getAllProducts()); // Emitir lista de productos actualizada
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
});

productRouter.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const deletedProductId = await ProductManager.deleteProduct(Number(pid));
    if (deletedProductId) {
      io.emit('updateProducts', await ProductManager.getAllProducts()); // Emitir lista de productos actualizada
      res.json({ message: `Product with ID ${pid} deleted` });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
});

// Rutas de carritos usando CartManager
const cartRouter = express.Router();

cartRouter.post('/', async (req, res) => {
  try {
    const newCart = await CartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el carrito' });
  }
});

cartRouter.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartManager.getCartById(Number(cid));
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el carrito' });
  }
});

cartRouter.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await CartManager.addProductToCart(Number(cid), Number(pid));
    if (updatedCart) {
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el producto al carrito' });
  }
});

// Montar los routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Configuración del servidor
server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
