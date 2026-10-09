import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiUser, FiCalendar  } from "react-icons/fi";

const ProfessionalSidebar = ({ section, setSection }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      key: "agenda",
      label: "Mi Agenda",
      icon: <FiCalendar />,
    },
    {
      key: "services",
      label: "Mis Servicios",
      icon: "✦",
    },
    {
      key: "availability",
      label: "Mi Disponibilidad",
      icon: "◷",
    },
      {
      key: "profile",
      label: "Mi Perfil",
      icon: <FiUser />,
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <div className="admin-logo-icon">T</div>
          <span className="admin-logo-name">Turnify</span>
        </div>
      </div>

      {user?.name && (
        <div style={{ padding: "12px 20px", fontSize: "0.85rem", color: "#94a3b8", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
          Hola, <strong style={{ color: "#f8fafc" }}>{user.name}</strong>
        </div>
      )}

      <nav className="admin-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className={`admin-nav-item ${section === item.key ? "active" : ""}`}
          >
            <span className="admin-nav-icon">{item.icon}</span>
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

export default ProfessionalSidebar;
