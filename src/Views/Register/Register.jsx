import { useState } from "react";
import "../Login/Login.css";
import Navbar from "../../components/Header/Navbar";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(e) {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (fieldErrors[name]) {
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }
}

  function validateName() {
  if (formData.name.trim().length < 3) {
    setFieldErrors((prev) => ({
      ...prev,
      name: "El nombre debe tener al menos 3 caracteres.",
    }));
  }
}

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(formData.email)) {
    setFieldErrors((prev) => ({
      ...prev,
      email: "Ingresá una dirección de correo electrónico válida.",
    }));
  }
}

function validatePhone() {
  if (!formData.phone.trim()) {
    setFieldErrors((prev) => ({
      ...prev,
      phone: "Ingresá un número de teléfono.",
    }));
  }
}

function validatePassword() {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,15}$/;

  if (!passwordRegex.test(formData.password)) {
    setFieldErrors((prev) => ({
      ...prev,
      password:
        "La contraseña debe tener entre 8 y 15 caracteres e incluir una mayúscula, una minúscula, un número y un símbolo.",
    }));
  }
}

function validateConfirmPassword() {
  if (formData.confirmPassword !== formData.password) {
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: "Las contraseñas no coinciden.",
    }));
  }
}

  function getRegisterErrorMessage(data) {
    const backendMessage = Array.isArray(data.message)
      ? data.message.join(" ")
      : data.message || "";

    const message = backendMessage.toLowerCase();

    if (message.includes("password")) {
      return "La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un símbolo.";
    }

    if (message.includes("email ya esta registrado")) {
      return "Ya existe una cuenta registrada con este correo electrónico.";
    }

    if (message.includes("telefono ya esta registrado")) {
      return "Ya existe una cuenta registrada con este número de teléfono.";
    }

    return backendMessage || "No se pudo crear la cuenta. Intentá nuevamente.";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Por favor completá todos los campos.");
      return;
    }   

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    

    if (!emailRegex.test(formData.email)) {
      setError("Ingresá una dirección de correo electrónico válida.");
      return;
    }   

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
       let message = Array.isArray(data.message)
        ? data.message.join(" ")
        : data.message;
        throw new Error(getRegisterErrorMessage(data));
      }

      navigate("/login");
    } catch (err) {
      setError(err.message || "Ocurrió un error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleRegister() {
    // TODO: Aca se va a conectar con el flujo de autenticación de Google cuando esté disponible
    console.log("Continuar con Google");
  }

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
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">T</div>
            <span>Turnify</span>
          </Link>

          <h1 className="loginTitle">Crear cuenta</h1>

          <p className="loginSubtitle">
            Completá el formulario para registrarte.
          </p>

          <button
            type="button"
            className="googleButton"
            onClick={handleGoogleRegister}
          >
            <svg
              className="googleIcon"
              viewBox="0 0 18 18"
              aria-hidden="true"
            >
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

          <form onSubmit={handleSubmit} className="loginForm" noValidate>
            <div className="inputGroup">
              <label className="label" htmlFor="name">
                Nombre completo
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={validateName}
                className={`input ${fieldErrors.name ? "inputError" : ""}`}
                placeholder="Valentina Reyes"
                
              />
              {fieldErrors.name && (
                <p className="fieldError">{fieldErrors.name}</p>
              )}
            </div>

            <div className="inputGroup">
              <label className="label" htmlFor="email">
                Correo electrónico
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={validateEmail}
                className={`input ${fieldErrors.email ? "inputError" : ""}`}
                placeholder="hola@email.com"
                
              />
              {fieldErrors.email && (<p className="fieldError">{fieldErrors.email}</p>)}
            </div>

            <div className="inputGroup">
              <label className="label" htmlFor="phone">
                Teléfono
              </label>
              
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={validatePhone}
                className={`input ${fieldErrors.phone ? "inputError" : ""}`}
                placeholder="+54 341 1234567"
                
              />
              {fieldErrors.phone && (
                <p className="fieldError">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="inputGroup">
              <label className="label" htmlFor="password">
                Contraseña
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={validatePassword}
                className={`input ${fieldErrors.password ? "inputError" : ""}`}
                placeholder="••••••••"
                
              />
              {fieldErrors.password && (
                <p className="fieldError">{fieldErrors.password}</p>
              )}
              <p className="password-hint">
                Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.
              </p>

            </div>

            <div className="inputGroup">
              <label className="label" htmlFor="confirmPassword">
                Confirmar contraseña
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={validateConfirmPassword}
                className={`input ${
                  fieldErrors.confirmPassword ? "inputError" : ""
                }`}
                placeholder="••••••••"
                
              />
              {fieldErrors.confirmPassword && (
              <p className="fieldError">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            

            {error && <p className="loginError">{error}</p>}

            <button
              type="submit"
              className="submitButton"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <p className="registerRow">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="registerLink">
              Iniciar Sesión
            </Link>
          </p>

          <p className="loginTip">
            Tip: Usá "admin@" para acceder como Admin, "pro@" para Profesional
          </p>
        </div>
      </div>
    </div>
  </>
);
}

export default Register;