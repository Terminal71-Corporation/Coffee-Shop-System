import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./ItemPage.css";

const STATUS_STYLE = {
  "Available":     { color: "#3cb371", bg: "rgba(46,139,87,0.2)",   border: "rgba(46,139,87,0.3)" },
  "Not Available": { color: "#e74c3c", bg: "rgba(192,57,43,0.2)",   border: "rgba(192,57,43,0.3)" },
  "Best Seller":   { color: "#d4a055", bg: "rgba(212,160,85,0.2)",  border: "rgba(212,160,85,0.3)" },
};

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

  const buildCartItem = () => ({
    ...product,
    quantity,
    addons,
    cartId: Date.now() + Math.random(),
  });

  const handleAddToCart = () => {
    if (product.status === "Not Available") return;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(buildCartItem());
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`${product.name} added to cart!`);
  };

  // "Buy Now" — adds item to cart then goes straight to /cart
  const handleBuyNow = () => {
    if (product.status === "Not Available") return;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(buildCartItem());
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
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
  const productStatus = product.status || "Available";
  const statusStyle = STATUS_STYLE[productStatus] || STATUS_STYLE["Available"];
  const isUnavailable = productStatus === "Not Available";

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
                  e.target.src = "https://via.placeholder.com/600x500?text=Image+Error";
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
              <span
                className="item-stock"
                style={{
                  color: statusStyle.color,
                  background: statusStyle.bg,
                  border: `1px solid ${statusStyle.border}`,
                }}
              >
                {productStatus}
              </span>
            </div>

            {product.description && (
              <p className="item-description">{product.description}</p>
            )}

            <div className="item-divider" />

            {/* ADD-ONS */}
            <div className="item-field">
              <label className="item-label">Add-ons / Special Instructions</label>
              <input
                className="item-input"
                type="text"
                placeholder="e.g. extra shot, less sugar, oat milk..."
                value={addons}
                onChange={(e) => setAddons(e.target.value)}
                disabled={isUnavailable}
              />
            </div>

            {/* QUANTITY */}
            <div className="item-field">
              <label className="item-label">Quantity</label>
              <div className="item-qty-row">
                <button
                  className="item-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isUnavailable}
                >−</button>
                <span className="item-qty-value">{quantity}</span>
                <button
                  className="item-qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={isUnavailable}
                >+</button>
              </div>
            </div>

            {/* TOTAL */}
            <div className="item-total-row">
              <span className="item-total-label">Total:</span>
              <span className="item-total-value">₱{total}</span>
            </div>

            {/* BUTTONS */}
            <div className="item-action-buttons">
              <button
                className="item-cart-btn"
                onClick={handleAddToCart}
                disabled={isUnavailable}
              >
                🛒 Add to Cart
              </button>
              <button
                className="item-buy-btn"
                onClick={handleBuyNow}
                disabled={isUnavailable}
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