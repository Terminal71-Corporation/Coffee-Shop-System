const db = require('../config/db');

// View items in cart
const getCart = (req, res) => {
    const {user_id} = req.params;

    const sql = `SELECT * FROM cart WHERE user_id = ?`

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
};

// add item to cart
const addToCart = (req, res) => {
    const {user_id, product_id, quantity } = req.body;

    const sql = `INSERT INTO cart (user_id, product_id, quantity)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`; // if duplicated, add

    db.query(sql, [user_id, product_id, quantity], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json({ message: "Item added to cart "});
    });
};

module.exports = {getCart, addToCart}