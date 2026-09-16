import Navbar from "../../components/Header/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Contact.css";

const contactCards = [
  {
    id: "email",
    icon: "✉️",
    title: "Correo Electrónico",
    value: "contacto@turnify.com",
    detail: "Escribinos para consultas generales o soporte técnico.",
  },
  {
    id: "phone",
    icon: "📞",
    title: "Teléfono / WhatsApp",
    value: "+54 9 3413 793177",
    detail: "Atención personalizada de Lunes a Viernes de 9 a 18 hs.",
  },
  {
    id: "location",
    icon: "📍",
    title: "Ubicación",
    value: "Rosario, Argentina",
    detail: "Oficinas centrales del equipo de desarrollo de Turnify.",
  },
];

const faqItems = [
  {
    id: "faq-1",
    icon: "📅",
    question: "¿Cómo reservo un turno en Turnify?",
    answer:
      "Explorá nuestro catálogo de servicios, elegí el profesional de tu preferencia y seleccioná la fecha y hora que mejor se adapten a vos.",
  },
  {
    id: "faq-2",
    icon: "🔐",
    question: "¿Necesito estar registrado para solicitar una cita?",
    answer:
      "Podés explorar los servicios libremente. Para confirmar la reserva, podés ingresar rápidamente con tu cuenta de Google o registrarte en segundos.",
  },
  {
    id: "faq-3",
    icon: "🚀",
    question: "¿Cómo puedo sumar mi negocio a Turnify?",
    answer:
      "Contactanos por nuestros canales oficiales de correo o WhatsApp y te asesoramos para habilitar el panel de gestión de tu comercio.",
  },
  {
    id: "faq-4",
    icon: "⏰",
    question: "¿Con cuánta anticipación puedo cancelar o reprogramar?",
    answer:
      "Podés gestionar o cancelar tus turnos agendados directamente desde tu panel de cliente en cualquier momento.",
  },
  {
    id: "faq-5",
    icon: "💳",
    question: "¿Qué medios de pago están disponibles?",
    answer:
      "Podés abonar la seña de forma online y completar el pago del servicio directamente en el establecimiento.",
  },
  {
    id: "faq-6",
    icon: "🛡️",
    question: "¿Mis datos personales están seguros?",
    answer:
      "Sí, contamos con protocolos de autenticación seguros y encriptación de datos para proteger tu privacidad.",
  },
];

const Contact = () => {
  return (
    <>
      <Navbar />
      <main className="contact-page">
        <section className="contact-hero">
          <div className="contact-container">
            <p className="contact-label">ESTAMOS PARA AYUDARTE</p>
            <h1>Contacto</h1>
            <p className="contact-subtitle">
              ¿Tenés dudas, consultas o querés sumar tu negocio a Turnify? Escribinos por nuestros canales oficiales.
            </p>
          </div>
        </section>

        <section className="contact-info-section">
          <div className="contact-container">
            <div className="contact-cards-grid">
              {contactCards.map((card) => (
                <div key={card.id} className="contact-card">
                  <span className="contact-card-icon">{card.icon}</span>
                  <h3>{card.title}</h3>
                  <p className="contact-card-value">{card.value}</p>
                  <p className="contact-card-detail">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-faq-section">
          <div className="contact-container">
            <div className="contact-faq-header">
              <p className="contact-label">RESOLVÉ TUS DUDAS</p>
              <h2>Preguntas Frecuentes</h2>
              <p className="faq-subtitle">
                Todo lo que necesitás saber sobre el uso de Turnify
              </p>
            </div>

            <div className="contact-faq-grid">
              {faqItems.map((faq) => (
                <div key={faq.id} className="faq-card">
                  <div className="faq-icon-wrapper">
                    <span className="faq-icon">{faq.icon}</span>
                  </div>
                  <div className="faq-content">
                    <h4>{faq.question}</h4>
                    <p>{faq.answer}</p>
                  </div>
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

export default Contact;
