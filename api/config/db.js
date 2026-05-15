const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "coffee_shop_db"
});

db.query("SELECT 1", (err, result) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

module.exports = db;