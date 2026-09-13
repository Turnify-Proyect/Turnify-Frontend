import "./Footer.css";

const footerSections = [
  {
    title: "Servicios",
    links: ["Masajes", "Faciales", "Manicura", "Peluquería"],
  },
  {
    title: "Empresa",
    links: ["Sobre Nosotros", "Blog", "Trabaja con nosotros"],
  },
  {
    title: "Legal",
    links: ["Privacidad", "Términos", "Cookies"],
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">T</div>
              <span>Turnify</span>
            </div>

            <p>Tu plataforma de bienestar de confianza.</p>
          </div>

          {/* {footerSections.map((section) => (
            <div className="footer-section" key={section.title}>
              <h4>{section.title}</h4>

              <ul>
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))} */} {/*  comentar hasta que decidamos si implementamos todo esto */}
        </div>

        <div className="footer-bottom">
          <p>© 2026 Turnify. Todos los derechos reservados.</p>

          <div className="footer-social">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;