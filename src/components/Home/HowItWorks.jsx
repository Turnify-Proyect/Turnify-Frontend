import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    icon: "💆",
    title: "Elegí tu servicio",
  },
  {
    number: "02",
    icon: "👩‍⚕️",
    title: "Seleccioná tu profesional",
  },
  {
    number: "03",
    icon: "📅",
    title: "Elegí fecha y hora",
  },
  {
    number: "04",
    icon: "✅",
    title: "Confirmá y pagá",
  },
];

const HowItWorks = () => {
  return (
    <section className="how-it-works">
      <div className="how-it-works-container">
        <div className="how-it-works-header">
          <h2>¿Cómo funciona?</h2>
          <p>Reserva en 4 simples pasos</p>
        </div>

        <div className="how-it-works-grid">
          {steps.map((step, index) => (
            <div className="how-it-works-step" key={step.number}>
              <div className="how-it-works-card">
                <div className="how-it-works-icon">{step.icon}</div>
                <span className="how-it-works-number">{step.number}</span>
                <h3>{step.title}</h3>
              </div>

              {index < steps.length - 1 && (
                <span className="how-it-works-arrow">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;