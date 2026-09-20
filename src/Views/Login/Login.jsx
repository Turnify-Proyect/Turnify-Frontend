import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Header/Navbar";
import "./Login.css";
import { GoogleLogin } from "@react-oauth/google";
import CompleteGoogleRegistration from "../../components/Auth/CompleteGoogleRegistration";

const API_URL = import.meta.env.VITE_API_URL;

function getDestinationByRole(token) {
  try {
    const payload = token.split(".")[1];

    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

        console.log("JWT DECODIFICADO:", decodedPayload);


    if (decodedPayload.roles?.includes("admin")) {
      return "/admin";
    }

    if (decodedPayload.roles?.includes("professional")) {
      return "/professional";
    }

    return "/dashboard";
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error);
    return "/dashboard";
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const isProcessingGoogle = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Estado para el flujo de registro con Google cuando falta el teléfono
  const [needsPhone, setNeedsPhone] = useState(false);
  const [registrationToken, setRegistrationToken] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Ingresá tu correo electrónico.",
      }));
      return;
    }

    if (!emailRegex.test(email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Ingresá una dirección de correo electrónico válida.",
      }));
    }
  }

  function validatePassword() {
    if (!password) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "Ingresá tu contraseña.",
      }));
    }
  }

  function getLoginDestination(token, from) {
  const roleDestination = getDestinationByRole(token);

  if (
    roleDestination === "/admin" ||
    roleDestination === "/professional"
  ) {
    return roleDestination;
  }

  return from || roleDestination;
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Ingresá tu correo electrónico.";
    }

    if (!password) {
      newErrors.password = "Ingresá tu contraseña.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      newErrors.email = "Ingresá una dirección de correo electrónico válida.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let message = data.message;

        if (Array.isArray(message)) {
          message = message.join(" ");
        }

        if (response.status === 401) {
          message = "El correo electrónico o la contraseña son incorrectos.";
        }

        throw new Error(message || "No se pudo iniciar sesión.");
      }

      login(data.token);
      const destination = getLoginDestination(
          data.token,
          location.state?.from
        );
        navigate(destination);
    } catch (err) {
      setError(err.message || "Ocurrió un error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (isProcessingGoogle.current) return;
    isProcessingGoogle.current = true;

    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo iniciar sesión con Google.");
      }

      if (data.needsPhone) {
        setRegistrationToken(data.registrationToken);
        setNeedsPhone(true);
        return;
      }

      login(data.token);
      console.log("Login Google exitoso");
      console.log("Token recibido:", !!data.token);
      const destination = getLoginDestination(
          data.token,
          location.state?.from
        );
        navigate(destination);

    } catch (err) {
      setError(err.message || "Ocurrió un error al iniciar sesión con Google.");
    } finally {
      setTimeout(() => {
        isProcessingGoogle.current = false;
      }, 1000);
    }
  };

  const handleCompleteGoogleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/google/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationToken, phone, country, address, city }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo completar el registro.");
      }

      login(data.token);
      console.log("Login Google exitoso");
      console.log("Token recibido:", !!data.token);
      const destination = getLoginDestination(
        data.token,
        location.state?.from
      );
      navigate(destination);
    } catch (err) {
      setError(err.message || "Ocurrió un error al completar el registro.");
    }
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

            {needsPhone ? (
                <CompleteGoogleRegistration
                  phone={phone}
                  setPhone={setPhone}
                  country={country}
                  setCountry={setCountry}
                  city={city}
                  setCity={setCity}
                  address={address}
                  setAddress={setAddress}
                  error={error}
                  onSubmit={handleCompleteGoogleSignUp}
                />
              ) : (
              <>
                <h1 className="loginTitle">Bienvenida de vuelta</h1>
                <p className="loginSubtitle">Ingresá tus datos para continuar.</p>

                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("No se pudo iniciar sesión con Google.")}
                />

                <div className="loginDivider">
                  <span>o</span>
                </div>

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
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            email: "",
                          }));
                        }
                        if (error) {
                          setError("");
                        }
                      }}
                      onBlur={validateEmail}
                      className={`input ${fieldErrors.email ? "inputError" : ""}`}
                      placeholder="hola@email.com"
                    />
                    {fieldErrors.email && (
                      <p className="fieldError">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="inputGroup">
                    <label className="label" htmlFor="password">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);

                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            password: "",
                          }));
                        }

                        if (error) {
                          setError("");
                        }
                      }}
                      onBlur={validatePassword}
                      className={`input ${fieldErrors.password ? "inputError" : ""}`}
                      placeholder="••••••••••"
                    />
                    {fieldErrors.password && (
                      <p className="fieldError">{fieldErrors.password}</p>
                    )}
                  </div>

                  {error && <p className="loginError">{error}</p>}

                  <a href="#forgot" className="forgotLink">
                    ¿Olvidaste tu contraseña?
                  </a>

                  <button type="submit" className="submitButton" disabled={loading}>
                    {loading ? "Ingresando..." : "Iniciar Sesión"}
                  </button>
                </form>

                <p className="registerRow">
                  ¿No tenés cuenta? <Link to="/register">Registrate</Link>
                </p>

                <p className="loginTip">
                  Tip: Usá "admin@" para acceder como Admin, "pro@" para
                  Profesional
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}