const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:id", getProductById);   // ← THIS WAS MISSING
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;