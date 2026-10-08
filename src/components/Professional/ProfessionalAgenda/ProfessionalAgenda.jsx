import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import {
  fetchAppointments,
  completeAppointmentApi,
  markNoShowAppointmentApi,
  fetchMyProfessionalProfile,
} from "../professionalApi";
import AppointmentDetailModal from "./AppointmentDetailModal";
import "./ProfessionalAgenda.css";
import {
  formatArgentinaDate,
  formatArgentinaTime,
  formatArgentinaDateKey,
} from "../../../helpers/formatLocalDate";

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
  no_show: "Ausente",
  expired: "Expirado",
};

const statusClasses = {
  pending: "status-badge status-pending",
  confirmed: "status-badge status-confirmed",
  completed: "status-badge status-completed",
  cancelled: "status-badge status-cancelled",
  no_show: "status-badge status-cancelled",
  expired: "status-badge status-expired",
};

const ProfessionalAgenda = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // 'today', 'upcoming', 'all'
  const [customDate, setCustomDate] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const getAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const professional = await fetchMyProfessionalProfile(token);
      const data = await fetchAppointments(token, professional.id);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar agenda:", err);
      setError(err.message || "Ocurrió un error al obtener tu agenda de turnos.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await getAppointments();

    toast.success("Agenda actualizada.");
  };

  useEffect(() => {
    getAppointments();
  }, [token]);

  const handleComplete = async (appointmentId) => {
    try {
      await completeAppointmentApi(appointmentId, token);
      toast.success("¡Turno marcado como completado!");
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(null);
      }
      await getAppointments();
    } catch (err) {
      toast.error(err.message || "Error al completar el turno.");
    }
  };

  const handleNoShow = async (appointmentId) => {
    try {
      await markNoShowAppointmentApi(
        appointmentId,
        token
      );

      toast.info(
        "Turno marcado como ausente."
      );

      if (
        selectedAppointment?.id ===
        appointmentId
      ) {
        setSelectedAppointment(null);
      }

      await getAppointments();
    } catch (err) {
      toast.error(
        err.message ||
          "Error al marcar el turno como ausente."
      );
    }
  };

  //Filtros
  const todayStr = formatArgentinaDateKey(new Date());

  const filteredAppointments = appointments.filter((app) => {
  const clientName = (app.user?.name || app.client?.name || "" ).toLowerCase();

  const serviceName = ( app.service?.name || "" ).toLowerCase();

  const searchValue = search.toLowerCase().trim();

  const matchesSearch = clientName.includes(searchValue) || serviceName.includes(searchValue);

  const appStatus =
      (app.status || "").toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        (
          appStatus === "pending" ||
          appStatus === "confirmed"
        )) ||
      (statusFilter === "completed" &&
        appStatus === "completed") ||
      (statusFilter === "cancelled" &&
        (
          appStatus === "cancelled" ||
          appStatus === "no_show"
        ));

    const appDate =
      formatArgentinaDateKey(app.startAt);

    let matchesDate = true;

    if (customDate) {
      matchesDate =
        appDate === customDate;
    } else if (dateFilter === "today") {
      matchesDate =
        appDate === todayStr;
    } else if (dateFilter === "upcoming") {
      matchesDate =
        appDate > todayStr;
    }

    return (matchesSearch && matchesStatus && matchesDate);
  });

  return (
    <div className="admin-page professional-agenda">
      <div className="admin-page-header">
        <h1>Mi Agenda de Turnos</h1>
        <p>Consultá y gestioná las citas y turnos que tenés asignados.</p>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-filters">
        <div className="admin-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Buscar por cliente o servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-filter-select"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCustomDate("");
          }}
        >
          <option value="all">Todas las fechas</option>
          <option value="today">Agenda de Hoy</option>
          <option value="upcoming">Próximos Turnos</option>
        </select>

        <input
          type="date"
          className="admin-filter-select"
          style={{ width: "auto", minWidth: "150px" }}
          value={customDate}
          onChange={(e) => {
            setCustomDate(e.target.value);
            setDateFilter("custom");
          }}
        />

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes / Confirmados</option>
          <option value="completed">Completados</option>
          <option value="cancelled">Ausentes / Cancelados</option>
        </select>

        <button type="button" className="btn-refresh" onClick={handleRefresh} title="Actualizar agenda">
          ↻
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Cargando agenda...</p>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <h3>No se encontraron turnos</h3>
          <p>No tenés turnos programados con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((app) => {
                const clientName = app.user?.name || app.client?.name || "Cliente";
                const serviceName = app.service?.name || "Servicio";
                const duration = app.service?.durationMinutes ? `${app.service.durationMinutes} min` : "-";
                const dateStr = formatArgentinaDate(app.startAt);
                const timeStr = formatArgentinaTime(app.startAt);
                const appStatus = (app.status || "pending").toLowerCase();

                return (
                  <tr key={app.id}>
                    <td>
                      <div className="table-datetime">
                        <span className="datetime-date">{dateStr}</span>
                        <span className="datetime-time">{timeStr} hs</span>
                      </div>
                    </td>
                    <td>
                      <span className="table-client-name">{clientName}</span>
                    </td>
                    <td>{serviceName}</td>
                    <td>{duration}</td>
                    <td>
                      <span className={statusClasses[appStatus] || "status-badge"}>
                        {statusLabels[appStatus] || appStatus}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="action-btn action-view"
                          onClick={() => setSelectedAppointment(app)}
                          title="Ver detalle del turno"
                        >
                          👁 Detalle
                        </button>

                        {appStatus !== "completed" && (
                          <button
                            type="button"
                            className="action-btn action-complete"
                            onClick={() => handleComplete(app.id)}
                            title="Marcar como completado"
                          >
                            ✓
                          </button>
                        )}

                        {appStatus !== "cancelled" && appStatus !== "no_show" && (
                          <button
                            type="button"
                            className="action-btn action-cancel"
                            onClick={() => handleNoShow(app.id)}
                            title="Marcar como ausente / cancelar"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onComplete={handleComplete}
          onNoShow={handleNoShow}
        />
      )}
    </div>
  );
};

export default ProfessionalAgenda;
