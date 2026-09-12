import "./Testimonials.css";

const testimonials = [
  {
    name: "Valentina Reyes",
    text: "Reservar mi turno nunca fue tan fácil. El servicio es impecable y el sistema es muy intuitivo.",
    avatar: "VR",
  },
  {
    name: "Lucía Méndez",
    text: "Me encanta poder elegir el profesional y el horario que más me conviene. 100% recomendado.",
    avatar: "LM",
  },
  {
    name: "Camila Torres",
    text: "La confirmación por correo y el recordatorio del turno son un detalle que agradezco mucho.",
    avatar: "CT",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <p>Lo que dicen nuestros clientes</p>
          <h2>Testimonios</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index}>★</span>
                ))}
              </div>

              <p className="testimonial-text">
                "{testimonial.text}"
              </p>

              <div className="testimonial-user">
                <div className="testimonial-avatar">
                  {testimonial.avatar}
                </div>

                <span>{testimonial.name}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;