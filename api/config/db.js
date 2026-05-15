const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "coffee_shop_db"
}).promise();

db.query("SELECT 1")
  .then(() => console.log("MySQL Connected"))
  .catch((err) => console.log("Database connection failed:", err));

module.exports = db;