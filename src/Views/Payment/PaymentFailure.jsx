import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentResult.css";

function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};

  return (
    <div className="payment-result-page">
      <div className="payment-result-card">
        <div className="payment-result-icon failure">✕</div>

        <h1 className="payment-result-title">No pudimos procesar el pago</h1>
        <p className="payment-result-message">
          Hubo un problema al confirmar tu seña. No se realizó ningún cobro. Podés
          intentarlo de nuevo.
        </p>

        <button
          type="button"
          className="payment-result-primary-button"
          onClick={() => navigate("/checkout", { state: booking })}
        >
          Reintentar pago
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

export default PaymentFailure;