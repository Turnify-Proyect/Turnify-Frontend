import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};

  const {
    serviceName = "Servicio",
    professionalName = "—",
    date = "",
    time = "",
    totalPrice = 0,
    deposit = 0,
  } = booking;

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!cardNumber || !cardHolderName || !expiry || !cvc) {
      setError("Completá todos los datos de la tarjeta.");
      return;
    }

    setLoading(true);
    try {
      // TODO: integrar con Stripe y el endpoint real del backend cuando esté disponible.
      // const response = await fetch(`${API_URL}/payments`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      //   body: JSON.stringify({ appointmentId, amount: deposit }),
      // });
      // if (!response.ok) navigate("/payment/failure", { state: booking });

      // Mientras no hay backend, navegamos directo a Success para poder demostrar el flujo.
      navigate("/payment/success", { state: booking });
    } catch (err) {
      setError(err.message || "Ocurrió un error al procesar el pago.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-page">
      <header className="checkout-topbar">
        <div className="checkout-brand">
          <div className="checkout-logo-icon">T</div>
          <div>
            <p className="checkout-brand-name">Turnify</p>
            <p className="checkout-brand-subtitle">Pago seguro</p>
          </div>
        </div>

        <div className="checkout-stripe-badge">
          <span>🔒</span> Procesado por Stripe
        </div>
      </header>

      <div className="checkout-content">
        <section className="checkout-form-card">
          <h1 className="checkout-form-title">Datos de pago</h1>
          <p className="checkout-form-subtitle">
            Ingresá los datos de tu tarjeta para confirmar la seña.
          </p>

          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-field">
              <label className="checkout-label" htmlFor="cardNumber">
                Número de tarjeta
              </label>
              <input
                id="cardNumber"
                className="checkout-input"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>

            <div className="checkout-field">
              <label className="checkout-label" htmlFor="cardHolderName">
                Nombre del titular
              </label>
              <input
                id="cardHolderName"
                className="checkout-input"
                placeholder="VALENTINA REYES"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
              />
            </div>

            <div className="checkout-row">
              <div className="checkout-field">
                <label className="checkout-label" htmlFor="expiry">
                  Vencimiento
                </label>
                <input
                  id="expiry"
                  className="checkout-input"
                  placeholder="MM/AA"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>

              <div className="checkout-field">
                <label className="checkout-label" htmlFor="cvc">
                  CVC
                </label>
                <input
                  id="cvc"
                  className="checkout-input"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <button type="submit" className="checkout-pay-button" disabled={loading}>
              🔒 {loading ? "Procesando..." : `Pagar $${deposit.toLocaleString("es-AR")}`}
            </button>
          </form>

          <div className="checkout-security-row">
            <span>🛡️ Pago 100% seguro</span>
            <span>🔒 SSL encriptado</span>
            <span>✓ Cumple con PCI DSS</span>
          </div>

          <div className="checkout-card-brands">
            <span className="checkout-brand-chip">VISA</span>
            <span className="checkout-brand-chip">Mastercard</span>
            <span className="checkout-brand-chip">AMEX</span>
            <span className="checkout-brand-chip">stripe</span>
          </div>
        </section>

        <aside className="checkout-summary-card">
          <div className="checkout-summary-header">
            <p className="checkout-summary-label">RESUMEN DEL TURNO</p>
            <h2 className="checkout-summary-service">{serviceName}</h2>
          </div>

          <div className="checkout-summary-body">
            <div className="checkout-summary-row">
              <span>👤 Profesional</span>
              <strong>{professionalName}</strong>
            </div>

            <div className="checkout-summary-row">
              <span>📅 Fecha</span>
              <strong>{formattedDate}</strong>
            </div>

            <div className="checkout-summary-row">
              <span>🕒 Hora</span>
              <strong>{time || "—"}</strong>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>Precio total del servicio</span>
              <strong>${totalPrice.toLocaleString("es-AR")}</strong>
            </div>

            <div className="checkout-summary-row">
              <span>Saldo a pagar en el centro</span>
              <strong>
                {totalPrice.toLocaleString("es-AR")} — {deposit.toLocaleString("es-AR")}
              </strong>
            </div>

            <div className="checkout-deposit-box">
              <span>Seña a pagar ahora</span>
              <strong>${deposit.toLocaleString("es-AR")}</strong>
            </div>

            <div className="checkout-warning-box">
              ⚠️ La seña se descuenta del total. La cancelación con menos de 24 hs de
              anticipación no es reembolsable.
            </div>
          </div>

          <ul className="checkout-info-list">
            <li>🔒 Tu información está protegida con encriptación de 256 bits.</li>
            <li>🛡️ Reembolso garantizado si cancelás con más de 24 hs de anticipación.</li>
            <li>💬 Soporte disponible vía chat ante cualquier inconveniente.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;