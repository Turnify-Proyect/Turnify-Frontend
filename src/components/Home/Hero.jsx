import "./Hero.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Hero = () => {

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  function handleBooking() {
    if (isAuthenticated) {
      navigate("/booking");
    } else {
      navigate("/login", {
        state: { from: "/booking" },
      });
    }
  }

  return (
    <section className="hero">
      <div className="hero-background"></div>
      <div className="hero-overlay"></div>

      <div className="hero-container">
        <p className="hero-label">Tu bienestar, sin esperas</p>

        <h1 className="hero-title">
          Bienvenido a
          <br />
          <span>Turnify</span>
        </h1>

        <p className="hero-description">
          Reserva turnos en tus centros de estética y bienestar favoritos en
          segundos. Sin llamadas, sin esperas.
        </p>

        <div className="hero-actions">
          <button onClick={handleBooking} className="hero-primary-button">
            Reservar mi turno <span>→</span>
          </button>

          <Link to="/services" className="hero-secondary-button">
            Ver servicios
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;