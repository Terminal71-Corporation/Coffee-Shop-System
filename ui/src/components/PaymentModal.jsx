import { useState } from "react";
import "./PaymentModal.css";
import gcashQR from "../assets/gcash-qr.png";

// ── GCash config ──────────────────────────────────────────────────
const GCASH_QR_URL = gcashQR;

const GCASH_ACCOUNT = {
  name: "CoffeeShop",
  number: "+63 997 749 ••••",
};
// ─────────────────────────────────────────────────────────────────

const FULFILLMENT_OPTIONS = [
  {
    id: "counter",
    icon: "🏪",
    label: "Counter Pick-up",
    sublabel: "Come to the shop and pay at the counter",
    accent: "#27ae60",
    accentBg: "rgba(39,174,96,0.12)",
    accentBorder: "rgba(39,174,96,0.35)",
  },
  {
    id: "delivery",
    icon: "🚚",
    label: "Address / Delivery",
    sublabel: "We'll deliver to your address",
    accent: "#d4a055",
    accentBg: "rgba(212,160,85,0.12)",
    accentBorder: "rgba(212,160,85,0.35)",
  },
];

// Counter → Cash to Counter | GCash (in-store scan)
// Delivery → Cash on Delivery | GCash (online transfer)
const PAYMENT_METHODS = {
  counter: [
    {
      id: "cash",
      icon: "💵",
      label: "Cash to Counter",
      sublabel: "Pay in cash when you pick up at the shop",
      accent: "#27ae60",
      accentBg: "rgba(39,174,96,0.12)",
      accentBorder: "rgba(39,174,96,0.35)",
    },
    {
      id: "gcash",
      icon: "📱",
      label: "GCash",
      sublabel: "Scan the QR code at the counter to pay",
      accent: "#00b4ff",
      accentBg: "rgba(0,180,255,0.12)",
      accentBorder: "rgba(0,180,255,0.35)",
    },
  ],
  delivery: [
    {
      id: "cod",
      icon: "🚗",
      label: "Cash on Delivery",
      sublabel: "Pay cash when your order arrives at your door",
      accent: "#d4a055",
      accentBg: "rgba(212,160,85,0.12)",
      accentBorder: "rgba(212,160,85,0.35)",
    },
    {
      id: "gcash",
      icon: "📲",
      label: "GCash (Online Transfer)",
      sublabel: "Send payment via GCash before delivery",
      accent: "#00b4ff",
      accentBg: "rgba(0,180,255,0.12)",
      accentBorder: "rgba(0,180,255,0.35)",
    },
  ],
};

// step flow:
//   counter:  fulfillment → payment → [gcash-qr]
//   delivery: fulfillment → address → payment → [gcash-qr]

function PaymentModal({ total, onConfirm, onClose }) {
  const [step, setStep] = useState("fulfillment");
  const [fulfillment, setFulfillment] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(null);

  const STEP_TITLES = {
    fulfillment: "How to Receive?",
    address: "Delivery Details",
    payment: "Payment Method",
    "gcash-qr": "GCash Payment",
  };

  const BACK_MAP = {
    address: "fulfillment",
    payment: fulfillment === "delivery" ? "address" : "fulfillment",
    "gcash-qr": "payment",
  };

  const goBack = () => {
    const prev = BACK_MAP[step];
    if (prev) {
      setStep(prev);
      if (prev === "fulfillment") setPaymentMethod(null);
    }
  };

  const progressIndex =
    step === "fulfillment" || step === "address" ? 0
    : step === "payment" || step === "gcash-qr" ? 1
    : 2;

  /* ── Handlers ── */
  const handleFulfillmentNext = () => {
    if (!fulfillment) return;
    setPaymentMethod(null);
    setStep(fulfillment === "delivery" ? "address" : "payment");
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.address.trim()) e.address = "Delivery address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddressNext = () => {
    if (validateForm()) setStep("payment");
  };

  const handlePaymentNext = () => {
    if (!paymentMethod) return;
    if (paymentMethod === "gcash") {
      setStep("gcash-qr");
    } else {
      onConfirm({
        fulfillment,
        paymentMethod,
        deliveryInfo: fulfillment === "delivery" ? form : null,
      });
    }
  };

  const handleGcashPaid = () => {
    onConfirm({
      fulfillment,
      paymentMethod: "gcash",
      deliveryInfo: fulfillment === "delivery" ? form : null,
    });
  };

  const availablePayments = fulfillment ? PAYMENT_METHODS[fulfillment] : [];

  return (
    <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal">

        {/* ── Header ── */}
        <div className="pm-header">
          <div className="pm-header-left">
            {step !== "fulfillment" && (
              <button className="pm-back-btn" onClick={goBack}>← Back</button>
            )}
          </div>
          <h2 className="pm-title">{STEP_TITLES[step]}</h2>
          <button className="pm-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* ── Progress ── */}
        <div className="pm-progress">
          {["Receive", "Payment", "Done"].map((label, i) => (
            <div key={i} className="pm-progress-item">
              <div className={`pm-progress-dot ${i <= progressIndex ? "active" : ""}`}>{i + 1}</div>
              <span className={`pm-progress-label ${i <= progressIndex ? "active" : ""}`}>{label}</span>
              {i < 2 && <div className={`pm-progress-line ${i < progressIndex ? "active" : ""}`} />}
            </div>
          ))}
        </div>

        {/* ── Total ── */}
        <div className="pm-total-row">
          <span>Total Amount</span>
          <span className="pm-total-amount">₱{total.toFixed(2)}</span>
        </div>

        {/* ══════════════════════════════════════
            STEP 1 — Fulfillment
        ══════════════════════════════════════ */}
        {step === "fulfillment" && (
          <>
            <p className="pm-subtitle">How would you like to receive your order?</p>
            <div className="pm-methods">
              {FULFILLMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`pm-method-card ${fulfillment === opt.id ? "selected" : ""}`}
                  style={fulfillment === opt.id ? { borderColor: opt.accentBorder, background: opt.accentBg } : {}}
                  onClick={() => setFulfillment(opt.id)}
                >
                  <span className="pm-method-icon">{opt.icon}</span>
                  <div className="pm-method-text">
                    <span className="pm-method-label" style={fulfillment === opt.id ? { color: opt.accent } : {}}>
                      {opt.label}
                    </span>
                    <span className="pm-method-sublabel">{opt.sublabel}</span>
                  </div>
                  <span
                    className="pm-method-radio"
                    style={fulfillment === opt.id ? { borderColor: opt.accent, background: opt.accent } : {}}
                  >
                    {fulfillment === opt.id && <span className="pm-radio-dot" />}
                  </span>
                </button>
              ))}
            </div>
            <button className="pm-confirm-btn" disabled={!fulfillment} onClick={handleFulfillmentNext}>
              {!fulfillment
                ? "Select an option"
                : fulfillment === "delivery"
                ? "Enter Delivery Details →"
                : "Choose Payment →"}
            </button>
          </>
        )}

        {/* ══════════════════════════════════════
            STEP 2 — Address (delivery only)
        ══════════════════════════════════════ */}
        {step === "address" && (
          <>
            <p className="pm-subtitle">Where should we deliver your order?</p>
            <div className="pm-address-form">

              <div className="pm-field">
                <label className="pm-field-label">Full Name</label>
                <input
                  className={`pm-field-input ${errors.name ? "error" : ""}`}
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                  value={form.name}
                  onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: "" })); }}
                />
                {errors.name && <span className="pm-field-error">{errors.name}</span>}
              </div>

              <div className="pm-field">
                <label className="pm-field-label">Phone Number</label>
                <input
                  className={`pm-field-input ${errors.phone ? "error" : ""}`}
                  type="tel"
                  placeholder="e.g. 09XX XXX XXXX"
                  value={form.phone}
                  onChange={(e) => { setForm((p) => ({ ...p, phone: e.target.value })); setErrors((p) => ({ ...p, phone: "" })); }}
                />
                {errors.phone && <span className="pm-field-error">{errors.phone}</span>}
              </div>

              <div className="pm-field">
                <label className="pm-field-label">Delivery Address</label>
                <textarea
                  className={`pm-field-input pm-field-textarea ${errors.address ? "error" : ""}`}
                  placeholder="House/Unit No., Street, Barangay, City"
                  value={form.address}
                  rows={3}
                  onChange={(e) => { setForm((p) => ({ ...p, address: e.target.value })); setErrors((p) => ({ ...p, address: "" })); }}
                />
                {errors.address && <span className="pm-field-error">{errors.address}</span>}
              </div>

              <div className="pm-field">
                <label className="pm-field-label">
                  Note for Rider <span className="pm-field-optional">(optional)</span>
                </label>
                <input
                  className="pm-field-input"
                  type="text"
                  placeholder="e.g. Blue gate, 2nd floor"
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                />
              </div>

            </div>
            <button className="pm-confirm-btn" onClick={handleAddressNext}>
              Choose Payment →
            </button>
          </>
        )}

        {/* ══════════════════════════════════════
            STEP 3 — Payment
        ══════════════════════════════════════ */}
        {step === "payment" && (
          <>
            <p className="pm-subtitle">
              {fulfillment === "delivery"
                ? "How will you pay for your delivery?"
                : "How will you pay when you pick up?"}
            </p>

            {/* Summary pill */}
            <div className="pm-fulfillment-summary">
              <span>{fulfillment === "delivery" ? "🚚" : "🏪"}</span>
              <span>
                {fulfillment === "delivery"
                  ? `Delivering to: ${form.address}`
                  : "Counter Pick-up — pay at the shop"}
              </span>
            </div>

            <div className="pm-methods">
              {availablePayments.map((method) => (
                <button
                  key={method.id}
                  className={`pm-method-card ${paymentMethod === method.id ? "selected" : ""}`}
                  style={paymentMethod === method.id ? { borderColor: method.accentBorder, background: method.accentBg } : {}}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <span className="pm-method-icon">{method.icon}</span>
                  <div className="pm-method-text">
                    <span className="pm-method-label" style={paymentMethod === method.id ? { color: method.accent } : {}}>
                      {method.label}
                    </span>
                    <span className="pm-method-sublabel">{method.sublabel}</span>
                  </div>
                  <span
                    className="pm-method-radio"
                    style={paymentMethod === method.id ? { borderColor: method.accent, background: method.accent } : {}}
                  >
                    {paymentMethod === method.id && <span className="pm-radio-dot" />}
                  </span>
                </button>
              ))}
            </div>

            <button className="pm-confirm-btn" disabled={!paymentMethod} onClick={handlePaymentNext}>
              {paymentMethod === "gcash"
                ? "View QR Code →"
                : paymentMethod
                ? "Confirm Order →"
                : "Select a payment method"}
            </button>
          </>
        )}

        {/* ══════════════════════════════════════
            STEP 4 — GCash QR
        ══════════════════════════════════════ */}
        {step === "gcash-qr" && (
          <div className="pm-gcash">
            <p className="pm-gcash-instruction">
              {fulfillment === "counter"
                ? <>Scan using your <strong>GCash app</strong> and pay exactly <strong className="pm-gcash-amount">₱{total.toFixed(2)}</strong> at the counter</>
                : <>Scan using your <strong>GCash app</strong> and send exactly <strong className="pm-gcash-amount">₱{total.toFixed(2)}</strong> before delivery</>
              }
            </p>

            <div className="pm-qr-card">
              <div className="pm-qr-gcash-header">
                <span className="pm-qr-gcash-logo">G</span>
                <span className="pm-qr-gcash-brand">GCash</span>
              </div>
              <img src={GCASH_QR_URL} alt="GCash QR Code" className="pm-qr-img" />
              <div className="pm-qr-account">
                <span className="pm-qr-account-name">{GCASH_ACCOUNT.name}</span>
                <span className="pm-qr-account-number">{GCASH_ACCOUNT.number}</span>
              </div>
            </div>

            <div className="pm-gcash-steps">
              {[
                "Open your GCash app",
                <span key="s2">Tap <strong>Pay QR</strong> and scan the code above</span>,
                <span key="s3">Enter amount: <strong>₱{total.toFixed(2)}</strong></span>,
                <span key="s4">Tap <strong>"I've Paid"</strong> below once done</span>,
              ].map((text, i) => (
                <div className="pm-gcash-step" key={i}>
                  <span className="pm-gcash-num">{i + 1}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <button className="pm-confirm-btn pm-gcash-paid-btn" onClick={handleGcashPaid}>
              ✓ I've Paid via GCash
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default PaymentModal;
