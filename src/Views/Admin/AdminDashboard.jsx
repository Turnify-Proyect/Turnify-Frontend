import { useState } from "react";
import "./AdminDashboard.css";
import "../../components/Admin/AdminShared.css";

import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminOverview from "../../components/Admin/Overview";
import AdminAppointments from "../../components/Admin/AdminAppointments/AdminAppointments";
import AdminProfessionals from "../../components/Admin/AdminProfessionals/AdminProfessionals";

const AdminDashboard = () => {
  const [section, setSection] = useState("overview");

  const renderSection = () => {
    switch (section) {
      case "overview":
        return <AdminOverview />;

      case "bookings":
         return <AdminAppointments />;

      case "professionals":
         return <AdminProfessionals />;

      case "clients":
        return <h1>Gestión de Clientes</h1>;

      case "services":
        return <h1>Gestión de Servicios</h1>;

      case "availability":
        return <h1>Gestión de Disponibilidad</h1>;

      case "users":
        return <h1>Gestión de Usuarios</h1>;

      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar
        section={section}
        setSection={setSection}
      />

      <main className="admin-content">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminDashboard;