import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentResult.css";

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};
  const { serviceName = "tu servicio", date = "", time = "", deposit = 0 } = booking;

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

  return (
    <div className="payment-result-page">
      <div className="payment-result-card">
        <div className="payment-result-icon success">✓</div>

        <h1 className="payment-result-title">¡Pago confirmado!</h1>
        <p className="payment-result-message">
          Tu seña para <strong>{serviceName}</strong> fue procesada correctamente. Te
          enviamos la confirmación por email.
        </p>

        <div className="payment-result-summary">
          <div className="payment-result-row">
            <span>Fecha</span>
            <strong>{formattedDate}</strong>
          </div>
          <div className="payment-result-row">
            <span>Hora</span>
            <strong>{time || "—"}</strong>
          </div>
          <div className="payment-result-row">
            <span>Seña pagada</span>
            <strong>${deposit.toLocaleString("es-AR")}</strong>
          </div>
        </div>

        <button
          type="button"
          className="payment-result-primary-button"
          onClick={() => navigate("/dashboard")}
        >
          Ir a Mis Turnos
        </button>

        <button
          type="button"
          className="payment-result-secondary-button"
          onClick={() => navigate("/")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;