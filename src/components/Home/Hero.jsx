import "./Hero.css";

const Hero = () => {
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
          <button className="hero-primary-button">
            Reservar mi turno <span>→</span>
          </button>

          <button className="hero-secondary-button">
            Ver servicios
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;