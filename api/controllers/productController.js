// At the top, import io from your server entry point
let io;
try {
  io = require("../index").io;
} catch {
  io = null;
}

const db = require("../config/db");

const safeEmit = (event, data) => {
  if (io) io.emit(event, data);
};

// =====================================
// GET ALL PRODUCTS
// =====================================
const getProducts = async (req, res) => {
  try {
    const [result] = await db.query(`SELECT * FROM products ORDER BY product_id DESC`);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// =====================================
// GET SINGLE PRODUCT BY ID
// =====================================
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(`SELECT * FROM products WHERE product_id = ?`, [id]);
    if (result.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

// =====================================
// ADD PRODUCT
// =====================================
const addProduct = async (req, res) => {
  const { name, description, category, price, status, image_url } = req.body;
  try {
    await db.query(
      `INSERT INTO products (name, description, category, price, status, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || "", category, price, status || "Available", image_url || null]
    );
    res.status(201).json({ message: "Product added successfully" });
  } catch (err) {
    console.log("addProduct error:", err);
    res.status(500).json({ message: "Failed to add product" });
  }
};

// =====================================
// UPDATE PRODUCT
// =====================================
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, status, image_url } = req.body;
  try {
    await db.query(
      `UPDATE products SET name = ?, description = ?, category = ?, price = ?, status = ?, image_url = ? WHERE product_id = ?`,
      [name, description || "", category, price, status, image_url || null, id]
    );
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.log("updateProduct error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
};

// =====================================
// DELETE PRODUCT
// =====================================
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM products WHERE product_id = ?`, [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};

module.exports = { getProducts, getProductById, addProduct, updateProduct, deleteProduct };