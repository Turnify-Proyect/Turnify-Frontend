import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="header">
      <div className="navbar-container">

        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">T</div>
          <span>Turnify</span>
        </Link>

        <nav className="navbar-links">
            <Link to="/services">Servicios</Link>
          <a href="#about">Sobre Nosotros</a>
          <a href="#contact">Contacto</a>
        </nav>

        <div className="navbar-actions">
          <button className="navbar-login">Iniciar Sesión</button>
          <button className="navbar-register">Registrarse</button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;