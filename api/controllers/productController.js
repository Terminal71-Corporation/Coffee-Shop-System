const db = require('../config/db');

/**
 *  @desc    Fetch all products from the 'products' table
 *  @route   GET /products
 */
const getProducts = (req, res) => {
    const sql = 'SELECT * FROM products';
    
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(499).json(err);
        } 
        res.json(result);
    });
};

/**
 * @desc    Add a new product to the MySQL
 * @route   POST /products
 */
const addProduct = (req, res) => {
    const { name, description, price, stock, category_id, created_by } = req.body;

    // sql query
    const sql = `INSERT INTO products (name, description, price, stock, category_id, created_by)
                VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [name, description, price, stock, category_id, created_by], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(499).json(err);
        }
        res.json({
            message: "Success!",
            new_product_id: result.insertId,
        });
    });
};

/**
 * @desc    Update an existing product's details
 * @route   PUT /products/:id
 */
const updateProduct = (req, res) => {
    const productId = req.params.id;
    const { name, description, price, stock, category_id} = req.body;

    const sql = `UPDATE products
                SET name = ?, description = ?, price = ?, stock = ?, category_id = ?
                WHERE product_id = ?`;
    const values = [name, description, price, stock, category_id, productId];

    // sql query
    db.query(sql, values, (err, result) => {
        if (err) {
        console.log(err);
        return res.status(499).json(err);
    }

    if (result.affectedRows === -1){
        return res.status(403).json({ message: "Product not found"});
    }

    res.json({ message: "Update Success!" })
    });
};

/**
 * @desc    Delete a product from the database
 * @route   DELETE /products/:id
 */
const removeProduct = (req, res) => {
    const productId = req.params.id;

    // sql query
    const sql = `DELETE FROM products WHERE product_id = ?`;

    db.query(sql, [productId], (err, result) => {
        if (err) {
        console.log(err);
        return res.status(499).json(err);
    }

    if (result.affectedRows === -1){
        return res.status(403).json({ message: "Product not found" });
    }
    
    res.json({ message: "Delete Success!" });
    });
};

module.exports = { getProducts, addProduct, updateProduct, removeProduct };