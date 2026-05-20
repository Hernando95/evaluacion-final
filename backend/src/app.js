require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore || require('connect-mongo').default || require('connect-mongo');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');
const sessionsRouter = require('./routes/sessions.router');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// ─── Middlewares ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Sessions ──────────────────────────────────────────────────────────────────
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 3600, // 1 hora
    }),
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
  })
);

// ─── Handlebars ────────────────────────────────────────────────────────────────
app.engine(
  'handlebars',
  engine({
    helpers: {
      subtotal: (price, qty) => {
        const p = Number(price) || 0;
        const q = Number(qty) || 0;
        const total = p * q;
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(total);
      },
      eq: (a, b) => a === b,
      currency: (num) => {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(num);
      },
      multiply: (a, b) => a * b,
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ─── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error('❌ Error al conectar MongoDB:', err.message));

// ─── Socket.io ─────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Compartir io con las rutas vía req.io
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);

// ─── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', error: err.message });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
