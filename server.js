const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const { engine } = require('express-handlebars');
const ProductManager = require('./managers/productManager');
const CartManager = require('./managers/cartManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars con helper
app.engine('handlebars', engine({
  defaultLayout: false, // Desactiva el layout predeterminado
  helpers: {
    getFirstThumbnail: function(thumbnails) {
      return thumbnails && thumbnails.length > 0 ? thumbnails[0] : '';  // Devuelve la primera imagen del array
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal (para renderizar index.handlebars)
app.get('/', async (req, res) => {
  try {
    const products = await ProductManager.getAllProducts(); // Obtener productos
    res.render('index', { products });  // Pasar los productos al renderizar
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});


// Ruta para productos (para renderizar realTimeProducts.handlebars)
app.get('/products', async (req, res) => {
  try {
    let { limit = 10, page = 1, query = '', sort = '' } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    let products = await ProductManager.getAllProducts();

    // Filtrado por categoría o disponibilidad
    if (query) {
      products = products.filter(product => 
        product.category?.toLowerCase().includes(query.toLowerCase()) || 
        (product.status && query.toLowerCase() === "available")
      );
    }

    // Ordenamiento por precio
    if (sort === 'asc') {
      products = products.sort((a, b) => a.price - b.price);
    } else if (sort === 'desc') {
      products = products.sort((a, b) => b.price - a.price);
    }

    // Paginación
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const offset = (page - 1) * limit;
    const paginatedProducts = products.slice(offset, offset + limit);

    res.render('realTimeProducts', {  // Renderiza realTimeProducts.handlebars
      products: paginatedProducts, // Pasa los productos paginados a la vista
      totalPages,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
      nextLink: page < totalPages ? `/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
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
      io.emit('updateProducts', await ProductManager.getAllProducts());
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
      io.emit('updateProducts', await ProductManager.getAllProducts());
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

cartRouter.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await CartManager.removeProductFromCart(Number(cid), Number(pid));
    if (updatedCart) {
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
  }
});

cartRouter.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const updatedCart = await CartManager.updateProductQuantity(Number(cid), Number(pid), quantity);
    if (updatedCart) {
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la cantidad del producto' });
  }
});

cartRouter.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const updatedCart = await CartManager.clearCart(Number(cid));
    if (updatedCart) {
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Carrito no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar todos los productos del carrito' });
  }
});

// Montar los routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);


// Inicializamos Socket.IO
io.on('connection', async (socket) => {  // Marca esta función como 'async'
  console.log('Nuevo cliente conectado');
  
  try {
    // Obtener los productos y luego emitirlos
    const products = await ProductManager.getAllProducts();
    socket.emit('updateProducts', products); // Enviar los productos actuales al nuevo cliente
  } catch (error) {
    console.error("Error al obtener los productos: ", error);
  }

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


// Configuración del servidor
server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
