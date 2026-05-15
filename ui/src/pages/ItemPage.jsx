import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./ItemPage.css";

function ItemPage({ setUser }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addons, setAddons] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/products/${id}`);
        const data = await res.json();
        // If the backend returns an error message instead of a product object
        if (data.message) {
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.log(err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity,
      addons,
      cartId: Date.now() + Math.random(),
    };
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`${product.name} added to cart!`);
  };

  const handlePurchase = () => {
    const order = {
      ...product,
      quantity,
      addons,
      date: new Date().toLocaleString(),
      orderId: Date.now(),
      status: "ordered",
    };
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
    showToast("Purchase successful! Redirecting to orders...");
    setTimeout(() => navigate("/orders"), 1800);
  };

  if (loading) {
    return (
      <>
        <Navbar setUser={setUser} />
        <div className="item-loading">
          <div className="item-spinner" />
          <p>Loading product...</p>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar setUser={setUser} />
        <div className="item-not-found">
          <h2>Product not found.</h2>
          <button onClick={() => navigate("/products")}>← Back to Shop</button>
        </div>
      </>
    );
  }

  const imageUrl =
    product.image_url && product.image_url.trim() !== ""
      ? product.image_url
      : "https://via.placeholder.com/600x500?text=No+Image";

  const total = (parseFloat(product.price) * quantity).toFixed(2);

  return (
    <>
      <Navbar setUser={setUser} />

      {toast && (
        <div className={`item-toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="item-page">
        <button className="item-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="item-container">

          {/* ── LEFT: IMAGE ── */}
          <div className="item-image-section">
            <div className="item-image-wrapper">
              <img
                src={imageUrl}
                alt={product.name}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/600x500?text=Image+Error";
                }}
              />
            </div>
          </div>

          {/* ── RIGHT: DETAILS ── */}
          <div className="item-details-section">
            {product.category && (
              <span className="item-category-badge">{product.category}</span>
            )}

            <h1 className="item-name">{product.name}</h1>

            <div className="item-price-row">
              <span className="item-price">₱{product.price}</span>
              {product.stock > 0 ? (
                <span className="item-stock in-stock">
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="item-stock out-stock">Out of Stock</span>
              )}
            </div>

            {product.description && (
              <p className="item-description">{product.description}</p>
            )}

            <div className="item-divider" />

            {/* ADD-ONS */}
            <div className="item-field">
              <label className="item-label">
                Add-ons / Special Instructions
              </label>
              <input
                className="item-input"
                type="text"
                placeholder="e.g. extra shot, less sugar, oat milk..."
                value={addons}
                onChange={(e) => setAddons(e.target.value)}
              />
            </div>

            {/* QUANTITY */}
            <div className="item-field">
              <label className="item-label">Quantity</label>
              <div className="item-qty-row">
                <button
                  className="item-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="item-qty-value">{quantity}</span>
                <button
                  className="item-qty-btn"
                  onClick={() =>
                    setQuantity((q) =>
                      product.stock ? Math.min(product.stock, q + 1) : q + 1
                    )
                  }
                >
                  +
                </button>
                <span className="item-qty-stock">
                  {product.stock ? `${product.stock} available` : ""}
                </span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="item-total-row">
              <span className="item-total-label">Total:</span>
              <span className="item-total-value">₱{total}</span>
            </div>

            {/* BUTTONS — Add to Cart + Buy Now */}
            <div className="item-action-buttons">
              <button
                className="item-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                🛒 Add to Cart
              </button>
              <button
                className="item-buy-btn"
                onClick={handlePurchase}
                disabled={product.stock === 0}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ItemPage;