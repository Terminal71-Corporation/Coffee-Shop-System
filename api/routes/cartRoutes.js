const express = require('express');
const router = express.Router();
const {addToCart, getCart} = require('../controllers/cartController');

// GET all cart items - URL: http://localhost:5000/api/cart/:id
router.post('/cart/:user_id', getCart);

// POST add to cart - URL: http://localhost:5000/api/cart
router.post('/cart', addToCart);

module.exports = router;