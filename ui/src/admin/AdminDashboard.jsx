import { useEffect, useState, useRef } from "react";
import AdminNavbar from "./AdminNavbar";
import "./AdminStyle.css";

const FIXED_CATEGORIES = [
  "Espresso",
  "Latte",
  "Tea",
  "Pastries",
  "Beans",
  "Equipment",
];

function AdminDashboard() {
  // ======================
  // STATES
  // ======================
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image_url: "",
  });

  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const usersRef = useRef(null);

  // ======================
  // FETCH PRODUCTS
  // ======================
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts(data.reverse());
    } catch (err) {
      console.log("fetchProducts error:", err);
    }
  };

  // ======================
  // FETCH USERS
  // ======================
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("fetchUsers error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  // ======================
  // SCROLL TO USERS
  // ======================
  const scrollToUsers = () => {
    usersRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ======================
  // DELETE USER
  // ======================
  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete account of "${name}"? This cannot be undone.`)) return;

    try {
      await fetch(`http://localhost:5000/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      console.log("deleteUser error:", err);
    }
  };

  // ======================
  // IMAGE UPLOAD
  // ======================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm({ ...form, image_url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, category: form.category.trim() };

    try {
      if (editId) {
        await fetch(`http://localhost:5000/products/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setEditId(null);
      } else {
        await fetch("http://localhost:5000/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setForm({ name: "", category: "", price: "", stock: "", image_url: "" });
      setImagePreview(null);
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // DELETE PRODUCT
  // ======================
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`http://localhost:5000/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  // ======================
  // EDIT PRODUCT
  // ======================
  const editProduct = (product) => {
    setForm({
      name: product.name,
      category: FIXED_CATEGORIES.includes(product.category) ? product.category : "",
      price: product.price,
      stock: product.stock || "",
      image_url: product.image_url || "",
    });
    setImagePreview(product.image_url || null);
    setEditId(product.product_id);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: "", category: "", price: "", stock: "", image_url: "" });
    setImagePreview(null);
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="admin-container">

      <AdminNavbar />

      {/* TITLE ROW */}
      <div className="admin-title-row">
        <h1 className="admin-title">Admin Product Management</h1>
        <button className="goto-users-btn" onClick={scrollToUsers}>
          👥 Go to Users
        </button>
      </div>

      {/* ====================== */}
      {/* PRODUCT FORM            */}
      {/* ====================== */}
      <div className="admin-form-box">
        <h2 className="admin-subtitle">
          {editId ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-fields-row">
            <input
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="admin-input"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="admin-input"
            >
              <option value="">Select Category</option>
              {FIXED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="admin-input"
            />
            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="admin-image-row">
            <div className="admin-upload-box">
              <label className="upload-label">
                {imagePreview ? (
                  <img src={imagePreview} className="preview-image" alt="preview" />
                ) : (
                  <div className="upload-placeholder">📷 Click to upload</div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setImagePreview(null);
                    setForm({ ...form, image_url: "" });
                  }}
                >
                  Remove Image
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", alignSelf: "flex-end" }}>
              <button
                type="submit"
                className={`admin-submit-btn ${editId ? "update-btn" : "add-btn"}`}
              >
                {editId ? "Update Product" : "Add Product"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="admin-submit-btn"
                  onClick={cancelEdit}
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ====================== */}
      {/* PRODUCTS TABLE          */}
      {/* ====================== */}
      <h2 className="admin-subtitle" style={{ marginBottom: "16px" }}>
        All Products
      </h2>

      <table className="admin-table" style={{ marginBottom: "48px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p.product_id}>
                <td>{p.product_id}</td>
                <td>
                  {p.image_url ? (
                    <img src={p.image_url} className="table-image" alt={p.name} />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                </td>
                <td>{p.name}</td>
                <td>
                  {p.category ? (
                    <span className="category-badge">{p.category}</span>
                  ) : "—"}
                </td>
                <td>₱{p.price}</td>
                <td>{p.stock}</td>
                <td>
                  <button onClick={() => editProduct(p)} className="edit-btn">Edit</button>
                  <button onClick={() => deleteProduct(p.product_id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-products">No products found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ====================== */}
      {/* USERS TABLE             */}
      {/* ====================== */}
      <h2
        className="admin-subtitle"
        ref={usersRef}
        style={{ marginBottom: "16px" }}
      >
        All Users
      </h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Age</th>
            <th>Address</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span
                    className="category-badge"
                    style={
                      u.role === "admin"
                        ? { background: "rgba(231,76,60,0.2)", color: "#e74c3c", borderColor: "rgba(231,76,60,0.3)" }
                        : {}
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td>{u.age || "—"}</td>
                <td>{u.address || "—"}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteUser(u.user_id, u.name)}
                    disabled={u.role === "admin"}
                    style={u.role === "admin" ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                    title={u.role === "admin" ? "Cannot delete admin" : "Delete account"}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-products">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
}

export default AdminDashboard;
