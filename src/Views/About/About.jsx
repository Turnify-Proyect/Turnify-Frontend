import Navbar from "../../components/Header/Navbar";
import Footer from "../../components/Footer/Footer";
import "./About.css";

const aboutSections = [
  {
    id: "info",
    title: "¿Qué es Turnify?",
    description:
      "Turnify es la plataforma digital integral diseñada para conectar a clientes con profesionales del bienestar, la estética y la salud en tiempo real. Ofrecemos un ecosistema simple, rápido y transparente para gestionar reservas sin complicaciones.",
  },
  {
    id: "origin",
    title: "¿Por qué nacimos?",
    description:
      "Nacimos para eliminar la fricción de la gestión manual de turnos por mensajería. Sabemos lo valioso que es el tiempo tanto para el profesional como para el cliente, por eso automatizamos el agendamiento 24/7 de forma eficiente.",
  },
];

const missionCards = [
  {
    id: "mission",
    title: "Nuestra Misión",
    description:
      "Facilitar el acceso al bienestar para todos, simplificando la conexión entre profesionales y clientes a través de tecnología accesible e intuitiva.",
  },
  {
    id: "vision",
    title: "Nuestra Visión",
    description:
      "Convertirnos en la plataforma de gestión de turnos líder de la región, inspirando una vida más organizada, cuidada y saludable.",
  },
];

const valuesList = [
  {
    id: "confianza",
    icon: "🤝",
    title: "Confianza",
    description: "Transparencia y seguridad en cada reserva.",
  },
  {
    id: "innovacion",
    icon: "💡",
    title: "Innovación",
    description: "Mejora continua para una mejor experiencia de usuario.",
  },
  {
    id: "bienestar",
    icon: "💆",
    title: "Bienestar",
    description: "Priorizamos la calidad de vida de nuestros usuarios.",
  },
  {
    id: "comunidad",
    icon: "🌐",
    title: "Comunidad",
    description: "Impulsamos el crecimiento de emprendedores y profesionales.",
  },
];

const About = () => {
  return (
    <>
      <Navbar />
      <main className="about-page">
        <section className="about-hero">
          <div className="about-container">
            <p className="about-label">CONOCÉ MÁS</p>
            <h1>Sobre Nosotros</h1>
            <p className="about-subtitle">
              Transformando la gestión de turnos para tu bienestar
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="about-container">
            <div className="about-grid">
              {aboutSections.map((item) => (
                <div key={item.id} className="about-card">
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-mission">
          <div className="about-container">
            <div className="about-header">
              <h2>Nuestra Misión y Visión</h2>
            </div>

            <div className="about-grid">
              {missionCards.map((card) => (
                <div key={card.id} className="mission-card">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="about-container">
            <div className="about-header">
              <h2>Nuestros Valores</h2>
            </div>

            <div className="values-grid">
              {valuesList.map((val) => (
                <div key={val.id} className="value-item">
                  <span className="value-icon">{val.icon}</span>
                  <h4>{val.title}</h4>
                  <p>{val.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
