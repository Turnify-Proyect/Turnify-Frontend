import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../Payment/PaymentResult.css";

const API_URL = import.meta.env.VITE_API_URL;

function VerifyEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("No se encontró un token de verificación en el enlace.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error("El enlace es inválido, ya fue usado o expiró.");
        }

        setStatus("success");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setErrorMessage(err.message || "No se pudo verificar el email.");
      }
    };

    verifyEmail();
  }, [navigate]);

  if (status === "loading") {
    return (
      <div className="payment-result-page">
        <div className="payment-result-card">
          <div className="payment-result-icon pending">⏳</div>
          <h1 className="payment-result-title">Verificando tu email...</h1>
          <p className="payment-result-message">
            Esto solo toma un momento.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="payment-result-page">
        <div className="payment-result-card">
          <div className="payment-result-icon success">✓</div>
          <h1 className="payment-result-title">¡Email verificado!</h1>
          <p className="payment-result-message">
            Tu cuenta fue confirmada correctamente. Te estamos redirigiendo al
            inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="payment-result-card">
        <div className="payment-result-icon failure">✕</div>
        <h1 className="payment-result-title">No pudimos verificar tu email</h1>
        <p className="payment-result-message">{errorMessage}</p>

        <button
          type="button"
          className="payment-result-primary-button"
          onClick={() => navigate("/login")}
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    </div>
  );
}

export default VerifyEmail;

