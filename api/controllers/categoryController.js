const db = require("../config/db");

// GET ALL CATEGORIES
const getCategories = (req, res) => {
  const sql = "SELECT * FROM categories ORDER BY category_id DESC";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to fetch categories" });
    res.json(result);
  });
};

// ADD CATEGORY
const addCategory = (req, res) => {
  const { name } = req.body;

  const sql = "INSERT INTO categories (name) VALUES (?)";

  db.query(sql, [name], (err) => {
    if (err) return res.status(500).json({ message: "Failed to add category" });
    res.status(201).json({ message: "Category added" });
  });
};

// DELETE CATEGORY
const deleteCategory = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM categories WHERE category_id = ?";

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete category" });
    res.json({ message: "Category deleted" });
  });
};

module.exports = {
  getCategories,
  addCategory,
  deleteCategory,
};