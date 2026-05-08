const db = require('../config/db');
const bcrypt = require('bcrypt');

// Register a new customer
const register = async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.json({ message: "Passwords do not match" });
    }

    // Check if username already exists
    db.query("SELECT user_id FROM users WHERE name=?", [username], async (err, result) => {

        if (result.length > 0) {
            return res.json({ message: "Username already exists" });
        }

    // Hash the password for security before saving
        const hashed = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
            [username, email, hashed],
            (err) => {
                if (err) {return res.json({ message: "Error registering" })};
                
                res.json({ message: "Registration successful" });
            }
        );
    });
};

// Login an existing user
const login = (req, res) => {
    const { username, password } = req.body;

        db.query("SELECT * FROM users WHERE name=?", [username], async (err, result) => {
        if (result.length === 0) {
            return res.json({ message: "User not found" });
        }

        const user = result[0];
        const match = await bcrypt.compare(password, user.password); // Check if passwords match

        if (!match) {
            return res.json({ message: "Invalid password" });
        }

        res.json({ message: "Login success" });
    });
};

module.exports = { register, login };