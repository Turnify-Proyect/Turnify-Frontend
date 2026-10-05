import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import {
  fetchOverviewAppointments,
  fetchOverviewProfessionals,
  fetchOverviewServices,
} from "./adminOverviewApi"

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
  expired: "Expirado",
};

const AdminOverview = ({ onNavigate }) => {
  const { token } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          appointmentsData,
          professionalsData,
          servicesData,
        ] = await Promise.all([
          fetchOverviewAppointments(token),
          fetchOverviewProfessionals(token),
          fetchOverviewServices(token),
        ]);


        setAppointments(
          Array.isArray(appointmentsData)
            ? appointmentsData
            : []
        );

        setProfessionals(
          Array.isArray(professionalsData)
            ? professionalsData
            : []
        );

        setServices(
          Array.isArray(servicesData)
            ? servicesData
            : []
        );
      } catch (err) {
        setError(
          err.message ||
            "No se pudo cargar el resumen del panel."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadOverview();
    }
  }, [token]);

  // =========================
  // FECHAS
  // =========================

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const todayAppointments = useMemo(() => {
    const today = new Date();

    return appointments.filter((appointment) =>
      isSameDay(new Date(appointment.startAt), today)
    );
  }, [appointments]);

  // =========================
  // TARJETAS
  // =========================

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending"
  ).length;

  const activeProfessionals = professionals.filter(
    (professional) => professional.isActive
  ).length;

  const activeServices = services.filter(
    (service) => service.isActive
  ).length;

  const stats = [
    {
      label: "Turnos de hoy",
      value: todayAppointments.length,
      icon: "◷",
      section: "bookings",
    },
    {
      label: "Turnos pendientes",
      value: pendingAppointments,
      icon: "!",
      section: "bookings",
    },
    {
      label: "Profesionales activos",
      value: activeProfessionals,
      icon: "P",
      section: "professionals",
    },
    {
      label: "Servicios activos",
      value: activeServices,
      icon: "✦",
      section: "services",
    },
  ];

  // =========================
  // ACTIVIDAD DE HOY
  // =========================

  const todayStatus = [
    {
      label: "Confirmados",
      value: todayAppointments.filter(
        (appointment) =>
          appointment.status === "confirmed"
      ).length,
    },
    {
      label: "Pendientes",
      value: todayAppointments.filter(
        (appointment) =>
          appointment.status === "pending"
      ).length,
    },
    {
      label: "Completados",
      value: todayAppointments.filter(
        (appointment) =>
          appointment.status === "completed"
      ).length,
    },
    {
      label: "Cancelados",
      value: todayAppointments.filter(
        (appointment) =>
          appointment.status === "cancelled"
      ).length,
    },
  ];

  // =========================
  // PRÓXIMOS TURNOS
  // =========================

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return appointments
      .filter((appointment) => {
        const startAt = new Date(appointment.startAt);

        return (
          startAt > now &&
          (appointment.status === "pending" ||
            appointment.status === "confirmed")
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startAt) - new Date(b.startAt)
      )
      .slice(0, 5);
  }, [appointments]);


  if (loading) {
    return <p>Cargando resumen...</p>;
  }

  return (
    <section className="admin-overview">
      <div className="admin-page-header">
        <div>
          <h1>Panel de administración</h1>
          <p>Resumen de la actividad de Turnify</p>
        </div>
      </div>

      {error && (
        <p className="admin-error">{error}</p>
      )}

      {/* MÉTRICAS */}
      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <button
            type="button"
            className="admin-stat-card admin-stat-card-clickable"
            key={stat.label}
            onClick={() =>
              onNavigate(stat.section)
            }
          >
            <div className="admin-stat-icon">
              {stat.icon}
            </div>
          
            <div>
              <span className="admin-stat-value">
                {stat.value}
              </span>
          
              <p>{stat.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="admin-overview-grid">
  {/* PRÓXIMOS TURNOS */}
  <div className="admin-overview-card admin-upcoming">
    <div className="admin-overview-title-row">
      <h2>Próximos turnos</h2>

      <button
        type="button"
        className="admin-overview-link"
        onClick={() => onNavigate("bookings")}
      >
        Ver reservas →
      </button>
    </div>

    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Profesional</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(
              (appointment) => (
                <tr key={appointment.id}>
                  <td>
                    {new Date(
                      appointment.startAt
                    ).toLocaleDateString("es-AR")}
                  </td>

                  <td>
                    {new Date(
                      appointment.startAt
                    ).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td>
                    {appointment.user?.name || "-"}
                  </td>

                  <td>
                    {appointment.service?.name || "-"}
                  </td>

                  <td>
                    {appointment.professional?.user
                      ?.name || "-"}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${appointment.status}`}
                    >
                      {STATUS_LABELS[
                        appointment.status
                      ] || appointment.status}
                    </span>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                colSpan="6"
                className="admin-empty"
              >
                No hay próximos turnos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* ACTIVIDAD DE HOY */}
  <div className="admin-overview-card">
    <h2>Actividad de hoy</h2>

    <div className="admin-status-list">
      {todayStatus.map((status) => (
        <div
          className="admin-status-row"
          key={status.label}
        >
          <span>{status.label}</span>
          <strong>{status.value}</strong>
        </div>
      ))}
    </div>
  </div>
</div>
    </section>
  );
};

export default AdminOverview;