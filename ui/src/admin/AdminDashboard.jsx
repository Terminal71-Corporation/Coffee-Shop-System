import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminMessenger from "./AdminMessenger";
import AdminOrdersBoard from "./AdminOrdersBoard";

import "./AdminStyle.css";
import "./AdminOrdersBoard.css";

const FIXED_CATEGORIES = [
  "Espresso",
  "Latte",
  "Tea",
  "Pastries",
  "Beans",
  "Equipment",
];

const PRODUCT_STATUSES = ["Available", "Not Available", "Best Seller"];

const STATUS_STYLE = {
  "Available":     { color: "#3cb371", bg: "rgba(46,139,87,0.15)" },
  "Not Available": { color: "#e74c3c", bg: "rgba(192,57,43,0.15)" },
  "Best Seller":   { color: "#d4a055", bg: "rgba(212,160,85,0.15)" },
};

function AdminDashboard() {
  const navigate = useNavigate();

  // ── ADMIN GUARD ──
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/home");
    }
  }, []);

  const [activeView, setActiveView] = useState("products");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    status: "Available",
    image_url: "",
  });

  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ======================
  // FETCH
  // ======================
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts([...data].reverse());
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  // ======================
  // IMAGE UPLOAD
  // ======================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm((prev) => ({ ...prev, image_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price) };

    try {
      if (editId) {
        await fetch(`http://localhost:5000/products/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("http://localhost:5000/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setEditId(null);
      setForm({ name: "", category: "", price: "", status: "Available", image_url: "" });
      setImagePreview(null);
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // DELETE / EDIT PRODUCT
  // ======================
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`http://localhost:5000/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const editProduct = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      status: product.status || "Available",
      image_url: product.image_url || "",
    });
    setImagePreview(product.image_url || null);
    setEditId(product.product_id);
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: "", category: "", price: "", status: "Available", image_url: "" });
    setImagePreview(null);
    setIsModalOpen(false);
  };

  // ======================
  // DELETE USER
  // ======================
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await fetch(`http://localhost:5000/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="admin-layout">

      <AdminNavbar activeView={activeView} setActiveView={setActiveView} />

      <div className="admin-content">

        {/* ================= PRODUCTS ================= */}
        {activeView === "products" && (
          <>
            <div className="title-bar">
              <h1 className="admin-title">Products</h1>
              <button
                className="add-btn admin-submit-btn"
                onClick={() => {
                  setEditId(null);
                  setForm({ name: "", category: "", price: "", status: "Available", image_url: "" });
                  setImagePreview(null);
                  setIsModalOpen(true);
                }}
              >
                + Add Product
              </button>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const s = STATUS_STYLE[p.status] || STATUS_STYLE["Available"];
                  return (
                    <tr key={p.product_id}>
                      <td>
                        {p.image_url
                          ? <img src={p.image_url} className="table-image" alt={p.name} />
                          : <div className="no-image-placeholder">No Image</div>
                        }
                      </td>
                      <td>{p.name}</td>
                      <td><span className="category-badge">{p.category}</span></td>
                      <td>₱{p.price}</td>
                      <td>
                        <span
                          className="category-badge"
                          style={{ background: s.bg, color: s.color, borderColor: s.color + "55" }}
                        >
                          {p.status || "Available"}
                        </span>
                      </td>
                      <td>
                        <button className="edit-btn" onClick={() => editProduct(p)}>Edit</button>
                        <button className="delete-btn" onClick={() => deleteProduct(p.product_id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {/* ================= USERS ================= */}
        {activeView === "users" && (
          <>
            <h1 className="admin-title">Users</h1>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className="category-badge"
                        style={u.role === "admin"
                          ? { background: "rgba(231,76,60,0.2)", color: "#e74c3c" }
                          : {}}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteUser(u.user_id)}
                        disabled={u.role === "admin"}
                        style={u.role === "admin" ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ================= ORDERS ================= */}
        {activeView === "orders" && (
          <>
            <h1 className="admin-title">Orders Board</h1>
            <AdminOrdersBoard />
          </>
        )}

        {/* ================= MESSAGES ================= */}
        {activeView === "messages" && (
          <>
            <h1 className="admin-title">Messages</h1>
            <AdminMessenger />
          </>
        )}

      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{editId ? "Edit Product" : "Add Product"}</h2>
            <form className="modal-form" onSubmit={handleSubmit}>

              <input
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {FIXED_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {imagePreview && (
                <img src={imagePreview} className="preview-image" alt="preview" />
              )}

              <div className="modal-actions">
                <button type="submit">{editId ? "Update" : "Add"}</button>
                <button type="button" onClick={cancelEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;