import { useState } from "react";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Por favor completá todos los campos.");
      return;
    }

    setLoading(true);
    try {
        
      // TODO: conectar al endpoint de registro real cuando esté disponible
      // const response = await fetch("URL_DEL_ENDPOINT/auth/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error("No se pudo crear la cuenta");
      // const data = await response.json();

      console.log("Datos listos para enviar:", formData);
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
    <div className="register-page">
      <div className="register-image">
        <div className="register-testimonial">
          <p className="register-testimonial-text">
            "Turnify cambió mi rutina de bienestar"
          </p>
          <p className="register-testimonial-author">— Camila Torres</p>
        </div>
      </div>

      <div className="register-form-section">
        <div className="register-form-wrapper">
          <a href="/" className="register-logo">
            <span className="register-logo-icon">T</span>
            <span className="register-logo-text">Turnify</span>
          </a>

          <h1 className="register-title">Crear cuenta</h1>
          <p className="register-subtitle">
            Completá el formulario para registrarte.
          </p>

          <button
            type="button"
            className="register-google-button"
            onClick={handleGoogleRegister}
          >
            Continuar con Google
          </button>

          <div className="register-divider">
            <span className="register-divider-line" />
            <span className="register-divider-text">o</span>
            <span className="register-divider-line" />
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-field">
              <label htmlFor="name" className="register-label">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Valentina Reyes"
                className="register-input"
              />
            </div>

            <div className="register-field">
              <label htmlFor="email" className="register-label">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hola@email.com"
                className="register-input"
              />
            </div>

            <div className="register-field">
              <label htmlFor="password" className="register-label">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="register-input"
              />
            </div>

            {error && <p className="register-error">{error}</p>}

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <p className="register-login-link">
            ¿Ya tenés cuenta? <a href="/login">Iniciar Sesión</a>
          </p>

          <p className="register-tip">
            Tip: Usá "admin@" para acceder como Admin, "pro@" para Profesional
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;