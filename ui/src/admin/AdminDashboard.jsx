import { useEffect, useState } from "react";
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
      setProducts(data.reverse());
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
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
      setForm({ ...form, image_url: reader.result });
    };

    reader.readAsDataURL(file);
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      category: form.category.trim(),
    };

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

      setForm({
        name: "",
        category: "",
        price: "",
        stock: "",
        image_url: "",
      });

      setImagePreview(null);
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // DELETE
  // ======================
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`http://localhost:5000/products/${id}`, {
      method: "DELETE",
    });

    fetchProducts();
  };

  // ======================
  // EDIT
  // ======================
  const editProduct = (product) => {
    setForm({
      name: product.name,
      category: FIXED_CATEGORIES.includes(product.category)
        ? product.category
        : "",
      price: product.price,
      stock: product.stock || "",
      image_url: product.image_url || "",
    });

    setImagePreview(product.image_url || null);
    setEditId(product.product_id);
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Product Management</h1>

      {/* FORM */}
      <div className="admin-form-box">
        <h2 className="admin-subtitle">
          {editId ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="admin-form">
          {/* ROW 1 */}
          <div className="admin-fields-row">

            <input
              placeholder="Product Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
              className="admin-input"
            />

            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="admin-input"
            >
              <option value="">Select Category</option>

              {FIXED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="admin-input"
            />

            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: e.target.value })
              }
              className="admin-input"
            />
          </div>

          {/* ROW 2 */}
          <div className="admin-image-row">

            <div className="admin-upload-box">
              <label className="upload-label">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="preview-image"
                    alt="preview"
                  />
                ) : (
                  <div className="upload-placeholder">
                    📷 Click to upload
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
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

            <button
              type="submit"
              className={`admin-submit-btn ${
                editId ? "update-btn" : "add-btn"
              }`}
            >
              {editId ? "Update Product" : "Add Product"}
            </button>

          </div>
        </form>
      </div>

      {/* TABLE */}
      <table className="admin-table">
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
          {products.map((p) => (
            <tr key={p.product_id}>
              <td>{p.product_id}</td>
              <td>
                <img src={p.image_url} className="table-image" />
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>₱{p.price}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => editProduct(p)} className="edit-btn">
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p.product_id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;