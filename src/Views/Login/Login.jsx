import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Header/Navbar";
import "./Login.css";

const API_URL = "http://localhost:3000";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Correo o contraseña incorrectos"
        );
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "Ocurrió un error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Iniciar sesión con Google");
  };

  return (
    <>
      <Navbar />
      <div className="loginPage">
        <div className="loginVisual">
          <blockquote className="loginQuote">
            <p className="loginQuoteText">
              "Turnify cambió mi rutina de bienestar"
            </p>
            <cite className="loginQuoteAuthor">— Camila Torres</cite>
          </blockquote>
        </div>

        <div className="loginFormSide">
          <div className="loginFormWrap">
            <div className="navbar-logo">
              <div className="navbar-logo-icon">T</div>
              <span>Turnify</span>
            </div>

            <h1 className="loginTitle">Bienvenida de vuelta</h1>
            <p className="loginSubtitle">Ingresá tus datos para continuar.</p>

            <button
              type="button"
              className="googleButton"
              onClick={handleGoogleLogin}
            >
              <svg className="googleIcon" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58z"
                />
              </svg>
              Continuar con Google
            </button>

            <div className="loginDivider">
              <span>o</span>
            </div>

            <form onSubmit={handleSubmit} className="loginForm">
              {error && <p className="loginError">{error}</p>}

              <div className="inputGroup">
                <label className="label" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="hola@email.com"
                  required
                />
              </div>

              <div className="inputGroup">
                <label className="label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••••"
                  required
                />
              </div>

              <a href="#forgot" className="forgotLink">
                ¿Olvidaste tu contraseña?
              </a>

              <button type="submit" className="submitButton" disabled={loading}>
                {loading ? "Ingresando..." : "Iniciar Sesión"}
              </button>
            </form>

            <p className="registerRow">
              ¿No tenés cuenta?{" "}
              <a href="#register" className="registerLink">
                Registrate
              </a>
            </p>

            <p className="loginTip">
              Tip: Usá "admin@" para acceder como Admin, "pro@" para
              Profesional
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
