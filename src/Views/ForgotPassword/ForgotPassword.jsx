import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Header/Navbar";
import "../Login/Login.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Ingresá tu correo electrónico.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Ingresá una dirección de correo electrónico válida.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        let message = data.message;
        if (Array.isArray(message)) message = message.join(" ");
        throw new Error(message || "No se pudo procesar la solicitud.");
      }

      setSent(true);
    } catch (err) {
      setError(err.message || "Ocurrió un error. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="loginPage">
        <div className="loginVisual" />
        <div className="loginFormSide">
          <div className="loginFormWrap">
            <div className="navbar-logo">
              <div className="navbar-logo-icon">T</div>
              <span>Turnify</span>
            </div>

            {sent ? (
              <>
                <h1 className="loginTitle">Revisá tu correo</h1>
                <p className="loginSubtitle">
                  Si el correo está registrado, te enviamos un enlace para
                  restablecer tu contraseña. El enlace vence en 30 minutos.
                </p>
                <p className="registerRow">
                  <Link to="/login">Volver a Iniciar Sesión</Link>
                </p>
              </>
            ) : (
              <>
                <h1 className="loginTitle">Recuperar contraseña</h1>
                <p className="loginSubtitle">
                  Ingresá tu correo y te enviamos un enlace para crear una
                  nueva contraseña.
                </p>

                <form onSubmit={handleSubmit} className="loginForm" noValidate>
                  <div className="inputGroup">
                    <label className="label" htmlFor="email">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className={`input ${error ? "inputError" : ""}`}
                      placeholder="hola@email.com"
                    />
                  </div>

                  {error && <p className="loginError">{error}</p>}

                  <button
                    type="submit"
                    className="submitButton"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar enlace"}
                  </button>
                </form>

                <p className="registerRow">
                  <Link to="/login">Volver a Iniciar Sesión</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}