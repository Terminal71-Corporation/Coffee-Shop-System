import { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminMessenger from "./AdminMessenger";
import AdminOrdersBoard from "./AdminOrdersBoard";

import "./AdminStyle.css";
import "./AdminOrdersBoard.css";

const FIXED_CATEGORIES = [
  "Espresso",
  "Latte",
  "Tea",
];

function AdminDashboard() {
  // ======================
  // VIEW STATE
  // ======================
  const [activeView, setActiveView] = useState("products");

  // ======================
  // DATA
  // ======================
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  // ======================
  // MODAL STATE
  // ======================
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ======================
  // FORM STATE
  // ======================
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image_url: "",
  });

  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ======================
  // FETCH PRODUCTS
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

  // ======================
  // FETCH USERS
  // ======================
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
  // SUBMIT PRODUCT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

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
      setForm({ name: "", category: "", price: "", stock: "", image_url: "" });
      setImagePreview(null);
      setIsModalOpen(false);
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
      category: product.category,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
    });

    setImagePreview(product.image_url);
    setEditId(product.product_id);
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: "", category: "", price: "", stock: "", image_url: "" });
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

      {/* SIDEBAR */}
      <AdminNavbar activeView={activeView} setActiveView={setActiveView} />

      {/* CONTENT */}
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
                  setForm({ name: "", category: "", price: "", stock: "", image_url: "" });
                  setImagePreview(null);
                  setIsModalOpen(true);
                }}
              >
                + Add Product
              </button>
            </div>

            <table className="admin-table">
              <tbody>
                {products.map((p) => (
                  <tr key={p.product_id}>
                    <td><img src={p.image_url} className="table-image" /></td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>₱{p.price}</td>
                    <td>{p.stock}</td>
                    <td>
                      <button className="edit-btn" onClick={() => editProduct(p)}>Edit</button>
                      <button className="delete-btn" onClick={() => deleteProduct(p.product_id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ================= USERS ================= */}
        {activeView === "users" && (
          <>
            <h1 className="admin-title">Users</h1>
            <table className="admin-table">
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <button className="delete-btn" onClick={() => deleteUser(u.user_id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ================= ORDERS (Trello Board) ================= */}
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
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Category</option>
                {FIXED_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {imagePreview && <img src={imagePreview} className="preview-image" />}
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
