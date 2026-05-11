const db = require("../config/db");


// =====================================
// GET PRODUCTS
// =====================================
const getProducts = (req, res) => {

  const sql = `
    SELECT *
    FROM products
    ORDER BY product_id DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      return res.status(500).json({
        message: "Failed to fetch products"
      });
    }

    res.json(result);

  });

};


// =====================================
// ADD PRODUCT
// =====================================
const addProduct = (req, res) => {

  const {
  name,
  description,
  category,
  price,
  stock,
  image_url
} = req.body;


  const sql = `
  INSERT INTO products
  (
    name,
    description,
    category,
    price,
    stock,
    image_url
  )
  VALUES (?, ?, ?, ?, ?, ?)
`;

  db.query(
    sql,
    [
  name,
  description,
  category,
  price,
  stock,
  image_url
],
    (err, result) => {

      if (err) {

        return res.status(500).json({
          message: "Failed to add product"
        });

      }

      res.status(201).json({
        message: "Product added successfully"
      });

    }
  );

};

const updateProduct = (req, res) => {

  const { id } = req.params;

  const {
    name,
    description,
    category,
    price,
    stock,
    image_url
  } = req.body;

  const sql = `
    UPDATE products
    SET
      name = ?,
      description = ?,
      category = ?,
      price = ?,
      stock = ?,
      image_url = ?
    WHERE product_id = ?
  `;

  db.query(
    sql,
    [
      name,
      description,
      category,
      price,
      stock,
      image_url,
      id
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          message: "Failed to update product"
        });

      }

      res.json({
        message: "Product updated successfully"
      });

    }
  );

};
// =====================================
// DELETE PRODUCT
// =====================================
const deleteProduct = (req, res) => {

  const { id } = req.params;

  const sql = `
    DELETE FROM products
    WHERE product_id = ?
  `;

  db.query(sql, [id], (err, result) => {

    if (err) {

      return res.status(500).json({
        message: "Failed to delete product"
      });

    }

    res.json({
      message: "Product deleted successfully"
    });

  });

};


module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct
};