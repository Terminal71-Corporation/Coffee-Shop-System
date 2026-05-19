import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PaymentModal from "../components/PaymentModal";
import "./Cart.css";

// ── Generate a 5-digit order number like "No.01021" ──
function generateOrderNumber() {
  const last = parseInt(localStorage.getItem("lastOrderNumber") || "1000", 10);
  const next = last + 1;
  localStorage.setItem("lastOrderNumber", String(next));
  return "No." + String(next).padStart(5, "0");
}

function Cart({ setUser }) {
  const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadCart(); }, []);

  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
    // Select all by default on load
    setSelectedIds(new Set(stored.map((item) => item.cartId)));
  };

  // ── Selection helpers ──
  const allSelected = cart.length > 0 && selectedIds.size === cart.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < cart.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cart.map((item) => item.cartId)));
    }
  };

  const toggleSelectItem = (cartId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cartId)) next.delete(cartId);
      else next.add(cartId);
      return next;
    });
  };

  const removeItem = (cartId) => {
    const updated = cart.filter((item) => item.cartId !== cartId);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(cartId);
      return next;
    });
  };

  const removeSelected = () => {
    if (!selectedIds.size) return;
    if (window.confirm(`Remove ${selectedIds.size} selected item(s)?`)) {
      const updated = cart.filter((item) => !selectedIds.has(item.cartId));
      localStorage.setItem("cart", JSON.stringify(updated));
      setCart(updated);
      setSelectedIds(new Set());
    }
  };

  const updateQty = (cartId, delta) => {
    const updated = cart.map((item) => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
  };

  const clearCart = () => {
    if (window.confirm("Clear entire cart?")) {
      localStorage.setItem("cart", JSON.stringify([]));
      setCart([]);
      setSelectedIds(new Set());
    }
  };

  // ── Called by PaymentModal — only checks out SELECTED items ──
  const handlePaymentConfirm = ({ fulfillment, paymentMethod, deliveryInfo, gcashRef }) => {
    const now = new Date().toLocaleString();
    const sessionUser = JSON.parse(localStorage.getItem("user") || "{}");
    const customerName = sessionUser?.name || sessionUser?.email || "Guest";
    const orderNumber = generateOrderNumber();

    const selectedItems = cart.filter((item) => selectedIds.has(item.cartId));

    const newOrder = {
      orderId: Date.now() + Math.random(),
      orderNumber,
      date: now,
      status: "ordered",
      fulfillment,
      paymentMethod,
      deliveryInfo: deliveryInfo || null,
      customerName,
      gcashRef: paymentMethod === "gcash" ? gcashRef : null,
      gcashPaid: paymentMethod === "gcash" ? false : null,
      items: selectedItems.map((item) => ({
        cartId: item.cartId,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url || "",
        addons: item.addons || "",
      })),
      total: selectedItems
        .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
        .toFixed(2),
    };

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders = [...orders, newOrder];
    localStorage.setItem("orders", JSON.stringify(orders));

    // Remove only checked-out items from cart
    const remaining = cart.filter((item) => !selectedIds.has(item.cartId));
    localStorage.setItem("cart", JSON.stringify(remaining));
    setCart(remaining);
    setSelectedIds(new Set(remaining.map((i) => i.cartId)));
    setShowPayment(false);
    navigate("/orders");
  };

  const selectedItems = cart.filter((item) => selectedIds.has(item.cartId));
  const total = selectedItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <>
      <Navbar setUser={setUser} />

      <div className="cart-page">
        <div className="cart-header">
          <h1>🛒 My Cart</h1>
          {cart.length > 0 && (
            <button className="cart-clear-btn" onClick={clearCart}>Clear All</button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add items from the shop to get started.</p>
            <button onClick={() => navigate("/products")}>Browse Products</button>
          </div>
        ) : (
          <>
            {/* ── Select All bar ── */}
            <div className="cart-select-bar">
              <label className="cart-checkbox-label">
                <input
                  type="checkbox"
                  className="cart-checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleSelectAll}
                />
                <span className="cart-checkbox-custom" />
                <span className="cart-select-text">
                  {allSelected
                    ? "All selected"
                    : selectedIds.size > 0
                    ? `${selectedIds.size} of ${cart.length} selected`
                    : "Select all"}
                </span>
              </label>

              {selectedIds.size > 0 && selectedIds.size < cart.length && (
                <button className="cart-remove-selected-btn" onClick={removeSelected}>
                  Remove selected
                </button>
              )}
            </div>

            <div className="cart-list">
              {cart.map((item) => (
                <CartItem
                  key={item.cartId}
                  item={item}
                  selected={selectedIds.has(item.cartId)}
                  onToggle={toggleSelectItem}
                  onRemove={removeItem}
                  onQty={updateQty}
                />
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-inner">
                <div className="cart-summary-row">
                  <span>Selected items</span>
                  <span>{selectedIds.size}</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
                <button
                  className="cart-checkout-btn"
                  disabled={selectedIds.size === 0}
                  onClick={() => setShowPayment(true)}
                >
                  Checkout {selectedIds.size > 0 ? `(${selectedIds.size})` : ""} →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showPayment && (
        <PaymentModal
          total={total}
          onConfirm={handlePaymentConfirm}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}

function CartItem({ item, selected, onToggle, onRemove, onQty }) {
  const imageUrl =
    item.image_url && item.image_url.trim() !== ""
      ? item.image_url
      : "https://via.placeholder.com/100x100?text=No+Image";

  const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);

  return (
    <div className={`cart-item${selected ? " cart-item--selected" : ""}`}>
      {/* Checkbox */}
      <label className="cart-checkbox-label cart-item-checkbox">
        <input
          type="checkbox"
          className="cart-checkbox"
          checked={selected}
          onChange={() => onToggle(item.cartId)}
        />
        <span className="cart-checkbox-custom" />
      </label>

      <img
        src={imageUrl}
        alt={item.name}
        onError={(e) => { e.target.src = "https://via.placeholder.com/100x100?text=Err"; }}
      />
      <div className="cart-item-info">
        <h3>{item.name}</h3>
        {item.addons && <p className="cart-item-addons">Add-ons: {item.addons}</p>}
        <p className="cart-item-price">₱{item.price} each</p>
      </div>
      <div className="cart-item-controls">
        <div className="cart-qty-row">
          <button onClick={() => onQty(item.cartId, -1)}>−</button>
          <span>{item.quantity}</span>
          <button onClick={() => onQty(item.cartId, 1)}>+</button>
        </div>
        <p className="cart-item-subtotal">₱{subtotal}</p>
        <button className="cart-remove-btn" onClick={() => onRemove(item.cartId)}>Remove</button>
      </div>
    </div>
  );
}

export default Cart;