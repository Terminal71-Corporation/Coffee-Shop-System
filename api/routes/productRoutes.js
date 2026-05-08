const express = require('express');
const router = express.Router();
const { getProducts, addProduct, updateProduct, removeProduct} = require('../controllers/productController');

// GET all items - URL: http://localhost:5000/api/products/
router.get('/products', getProducts);

// POST a new item - URL: http://localhost:5000/api/products/
router.post('/products', addProduct);

// PUT (Update) an item by ID - URL: http://localhost:5000/api/products/:id
router.put('/products/:id', updateProduct);

// DELETE an item by ID - URL: http://localhost:5000/api/products/:id
router.delete('/products/:id', removeProduct);

module.exports = router