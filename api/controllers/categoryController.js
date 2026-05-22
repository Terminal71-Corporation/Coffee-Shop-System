const db = require("../config/db");

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT * FROM categories ORDER BY category_id DESC"
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// ADD CATEGORY
const addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    await db.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );
    res.status(201).json({ message: "Category added" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add category" });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      "DELETE FROM categories WHERE category_id = ?",
      [id]
    );
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category" });
  }
};

module.exports = {
  getCategories,
  addCategory,
  deleteCategory,
};