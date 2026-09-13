import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

        <div className="navbar-actions">{isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-login">
                Mi cuenta
              </Link>
          
              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`navbar-login ${isLogin ? "active" : ""}`}>
                Iniciar Sesión
              </Link>
          
              <Link to="/register" className={`navbar-register ${isRegister ? "active" : ""}`}>
                Registrarse
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;