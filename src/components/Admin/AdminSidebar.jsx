import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminSidebar = ({ section, setSection }) => {

    const { logout } = useAuth();
    const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  const navItems = [
  {
    key: "overview",
    label: "Resumen",
    icon: "◉",
  },
  {
    key: "bookings",
    label: "Reservas",
    icon: "▣",
  },
  {
    key: "professionals",
    label: "Profesionales",
    icon: "♙",
  },
  {
    key: "clients",
    label: "Clientes",
    icon: "♢",
  },
  {
    key: "services",
    label: "Servicios",
    icon: "✦",
  },
  {
    key: "availability",
    label: "Disponibilidad",
    icon: "◷",
  },
  {
    key: "users",
    label: "Usuarios",
    icon: "▦",
  },
];
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <div className="admin-logo-icon">
            T
          </div>

          <span className="admin-logo-name">
            Turnify
          </span>
        </div>

        <span className="admin-role">
          Admin
        </span>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className={`admin-nav-item ${
              section === item.key ? "active" : ""
            }`}
          >
            <span className="admin-nav-icon">
              {item.icon}
            </span>

            {item.label}
          </button>
        ))}
      </nav>

       <div className="admin-sidebar-footer">
        <Link to="/" className="admin-back-button">
          <span>←</span>
          Volver al sitio
        </Link>

        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;