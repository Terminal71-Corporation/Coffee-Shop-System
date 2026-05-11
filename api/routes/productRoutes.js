const express = require("express");

const router = express.Router();

const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");


// GET PRODUCTS
router.get("/", getProducts);

// ADD PRODUCT
router.post("/", addProduct);

// UPDATE PRODUCT
router.put("/:id", updateProduct);

// DELETE PRODUCT
router.delete("/:id", deleteProduct);

module.exports = router;