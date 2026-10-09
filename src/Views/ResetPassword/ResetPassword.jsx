import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Header/Navbar";
import "../Login/Login.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => navigate("/login"), 3000);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("El enlace es inválido, ya fue usado o expiró.");
        }
        const data = await response.json().catch(() => ({}));
        let message = data.message;
        if (Array.isArray(message)) message = message.join(" ");
        throw new Error(message || "No se pudo restablecer la contraseña.");
      }

      setSuccess(true);
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

            {!token ? (
              <>
                <h1 className="loginTitle">Enlace inválido</h1>
                <p className="loginSubtitle">
                  No se encontró un token de recuperación en el enlace.
                </p>
                <p className="registerRow">
                  <Link to="/forgot-password">Solicitar un nuevo enlace</Link>
                </p>
              </>
            ) : success ? (
              <>
                <h1 className="loginTitle">¡Contraseña actualizada!</h1>
                <p className="loginSubtitle">
                  Ya podés iniciar sesión con tu nueva contraseña. Te estamos
                  redirigiendo...
                </p>
              </>
            ) : (
              <>
                <h1 className="loginTitle">Nueva contraseña</h1>
                <p className="loginSubtitle">
                  Ingresá tu nueva contraseña (mínimo 8 caracteres).
                </p>

                <form onSubmit={handleSubmit} className="loginForm" noValidate>
                  <div className="inputGroup">
                    <label className="label" htmlFor="newPassword">
                      Nueva contraseña
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError("");
                      }}
                      className={`input ${error ? "inputError" : ""}`}
                      placeholder="••••••••••"
                    />
                  </div>

                  {error && <p className="loginError">{error}</p>}

                  <button
                    type="submit"
                    className="submitButton"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Restablecer contraseña"}
                  </button>
                </form>

                {error.includes("enlace") && (
                  <p className="registerRow">
                    <Link to="/forgot-password">Solicitar un nuevo enlace</Link>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}