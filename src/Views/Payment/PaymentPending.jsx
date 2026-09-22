import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentResult.css";

function PaymentPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};
  const { serviceName = "tu servicio", date = "", time = "" } = booking;

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
        <div className="payment-result-icon pending">⏳</div>

        <h1 className="payment-result-title">Pago en revisión</h1>
        <p className="payment-result-message">
          Estamos confirmando el pago de la seña para <strong>{serviceName}</strong>. Te
          avisaremos por email en cuanto se apruebe.
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

export default PaymentPending;