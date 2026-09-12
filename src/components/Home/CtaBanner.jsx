import "./CtaBanner.css";

const CtaBanner = () => {
  return (
    <section className="cta-banner">
      <div className="cta-banner-container">
        <h2>¿Lista para tu momento de bienestar?</h2>

        <p>
          Reservá ahora y obtené un descuento en tu primera cita.
        </p>

        <button className="cta-banner-button">
          Comenzar ahora
        </button>
      </div>
    </section>
  );
};

export default CtaBanner;