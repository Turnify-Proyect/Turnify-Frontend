import "./Navbar.css";

const Navbar = () => {
  return (
    <header className="header">
      <div className="navbar-container">

        <div className="navbar-logo">
          <div className="navbar-logo-icon">T</div>
          <span>Turnify</span>
        </div>

        <nav className="navbar-links">
          <a href="#services">Servicios</a>
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