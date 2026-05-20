const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// Registro
const CartManagerDB = require('../dao/db/CartManagerDB');
const cartManager = new CartManagerDB();

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).send({ status: 'error', error: 'El usuario ya existe' });

    // Crear un carrito nuevo para el usuario
    const newCart = await cartManager.create();

    const user = {
      first_name,
      last_name,
      email,
      age,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      cart: newCart._id,
      role: 'user'
    };

    await User.create(user);
    res.redirect('/login');
  } catch (err) {
    res.status(500).send({ status: 'error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hardcoded admin para pruebas del TP
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
      req.session.user = {
        name: 'Admin',
        email,
        role: 'admin',
      };
      return res.redirect('/products');
    }

    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send({ status: 'error', error: 'Credenciales inválidas' });
    }

    req.session.user = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
      role: user.role,
      cart: user.cart,
    };

    res.redirect('/products');
  } catch (err) {
    res.status(500).send({ status: 'error', error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send({ status: 'error', error: 'No se pudo cerrar sesión' });
    res.redirect('/login');
  });
});

module.exports = router;
