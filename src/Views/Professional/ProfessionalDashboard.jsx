import { useState } from "react";
import "./ProfessionalDashboard.css";
import "../../components/Admin/AdminShared.css";

import ProfessionalSidebar from "../../components/Professional/ProfessionalSidebar";
import ProfessionalAgenda from "../../components/Professional/ProfessionalAgenda/ProfessionalAgenda";
import ProfessionalServices from "../../components/Professional/ProfessionalServices/ProfessionalServices";
import AdminAvailability from "../../components/Admin/AdminAvailability/AdminAvailability";

const ProfessionalDashboard = () => {
  const [section, setSection] = useState("agenda");

  const renderSection = () => {
    switch (section) {
      case "agenda":
        return <ProfessionalAgenda />;

      case "services":
        return <ProfessionalServices />;

      case "availability":
         return <AdminAvailability professionalMode />;

      default:
        return <ProfessionalAgenda />;
    }
  };

  return (
    <div className="admin-dashboard">
      <ProfessionalSidebar section={section} setSection={setSection} />

      <main className="admin-content">
        {renderSection()}
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
