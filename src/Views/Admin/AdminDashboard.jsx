import { useState } from "react";
import "./AdminDashboard.css";
import "../../components/Admin/AdminShared.css";

import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminOverview from "../../components/Admin/AdminOverview/AdminOverview";
import AdminAppointments from "../../components/Admin/AdminAppointments/AdminAppointments";
import AdminProfessionals from "../../components/Admin/AdminProfessionals/AdminProfessionals";
import AdminUsers from "../../components/Admin/AdminUsers/AdminUsers";
import AdminClients from "../../components/Admin/AdminClients/AdminClients";
import AdminServices from "../../components/Admin/AdminServices/AdminServices";
import AdminAvailability from "../../components/Admin/AdminAvailability/AdminAvailabitily";

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
        return <AdminClients />;

      case "services":
        return <AdminServices />;

      case "availability":
        return <AdminAvailability />; 

      case "users":
        return <AdminUsers />;

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