import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./AdminAppointments.css";
import {
  fetchAppointments,
  fetchServices,
  fetchProfessionalsByService,
  fetchProfessionalAvailability,
  cancelAppointmentApi,
  updateAppointmentStatusApi,
  rescheduleAppointmentApi,
} from "./adminAppointmentsApi";


const AdminAppointments = () => {
  const { token } = useAuth();

  // Reservas
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Reprogramación
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [services, setServices] = useState([]);
  const [rescheduleProfessionals, setRescheduleProfessionals] = useState([]);
  const [professionalAvailability, setProfessionalAvailability] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [rescheduleServiceId, setRescheduleServiceId] = useState("");
  const [rescheduleProfessionalId, setRescheduleProfessionalId] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartAt, setRescheduleStartAt] = useState("");

  const statusLabels = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado",
    expired: "Expirado",
  };

  const getDayOfWeek = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return days[date.getDay()];
};

  // Obtener todos los turnos
 const getAppointments = async () => {
  try {
    setError("");

    const data = await fetchAppointments(token);

    setAppointments(data);
  } catch (err) {
    setError(
      err.message || "Ocurrió un error al obtener las reservas."
    );
  } finally {
    setLoading(false);
  }
};

  // Obtener servicios activos
  const getServices = async () => {
  try {
    const data = await fetchServices();

    setServices(data);
  } catch (err) {
    setError(
      err.message || "Ocurrió un error al obtener los servicios."
    );
  }
};

  // Obtener profesionales que realizan un servicio
  const getProfessionalsByService = async (serviceId) => {
  try {
    const data = await fetchProfessionalsByService(serviceId);

    setRescheduleProfessionals(data);
  } catch (err) {
    setError(
      err.message ||
        "Ocurrió un error al obtener los profesionales."
    );

    setRescheduleProfessionals([]);
  }
};

  // Obtener disponibilidad configurada del profesional
const getProfessionalAvailability = async (
  professionalId
) => {
  try {
    const data = await fetchProfessionalAvailability(
      professionalId,
      token
    );

    setProfessionalAvailability(data);

    return data;
  } catch (err) {
    setError(
      err.message ||
        "Ocurrió un error al obtener la disponibilidad."
    );

    setProfessionalAvailability([]);
    return [];
  }
};



  // Iniciar reprogramación
  const startRescheduling = async () => {
  const serviceId = selectedAppointment.service?.id;
  const professionalId =
    selectedAppointment.professional?.id;

  setRescheduleServiceId(serviceId || "");
  setRescheduleProfessionalId(professionalId || "");
  setRescheduleDate("");
  setRescheduleStartAt("");
  setAvailableSlots([]);

  if (serviceId) {
    await getProfessionalsByService(serviceId);
  }

  if (professionalId) {
    await getProfessionalAvailability(professionalId);
  }

  setIsRescheduling(true);
};

  // Cancelar turno
 const cancelAppointment = async (id) => {
  try {
    setError("");

    await cancelAppointmentApi(id, token);

    await getAppointments();
  } catch (err) {
    setError(
      err.message || "Ocurrió un error al cancelar la reserva."
    );
  }
};

  //función para obtener los horarios disponibles
  const generateAvailableSlots = (
  date,
  professionalId,
  serviceId,
  availabilities
) => {
  if (!date || !professionalId || !serviceId) {
    setAvailableSlots([]);
    return;
  }

  const service = services.find(
    (service) => service.id === serviceId
  );

  if (!service) {
    setAvailableSlots([]);
    return;
  }

  const duration = service.durationMinutes;

  const dayOfWeek = getDayOfWeek(date);

  const dayAvailabilities = availabilities.filter(
    (availability) => availability.dayOfWeek === dayOfWeek
  );

  const slots = [];

  dayAvailabilities.forEach((availability) => {
    const [startHour, startMinute] = availability.startTime
      .slice(0, 5)
      .split(":")
      .map(Number);

    const [endHour, endMinute] = availability.endTime
      .slice(0, 5)
      .split(":")
      .map(Number);

    const [year, month, day] = date.split("-").map(Number);

    let current = new Date(
      year,
      month - 1,
      day,
      startHour,
      startMinute
    );

    const availabilityEnd = new Date(
      year,
      month - 1,
      day,
      endHour,
      endMinute
    );

    while (
      current.getTime() + duration * 60 * 1000 <=
      availabilityEnd.getTime()
    ) {
      const slotStart = new Date(current);

      const slotEnd = new Date(
        slotStart.getTime() + duration * 60 * 1000
      );

      const overlapsAppointment = appointments.some((appointment) => {
        // Ignoramos el turno que estamos reprogramando
        if (appointment.id === selectedAppointment?.id) {
          return false;
        }

        // Solo importan los turnos del profesional seleccionado
        if (appointment.professional?.id !== professionalId) {
          return false;
        }

        // Cancelados y expirados no ocupan agenda
        if (
          appointment.status === "cancelled" ||
          appointment.status === "expired"
        ) {
          return false;
        }

        const appointmentStart = new Date(appointment.startAt);
        const appointmentEnd = new Date(appointment.endAt);

        return (
          slotStart < appointmentEnd &&
          slotEnd > appointmentStart
        );
      });

      const isPast = slotStart <= new Date();

      if (!overlapsAppointment && !isPast) {
        slots.push({
          startAt: slotStart.toISOString(),
          label: slotStart.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }

      current = new Date(
        current.getTime() + duration * 60 * 1000
      );
    }
  });

  setAvailableSlots(slots);
};

  // Cambiar estado del turno
 const updateAppointmentStatus = async (id, status) => {
  try {
    setError("");

    await updateAppointmentStatusApi(
      id,
      status,
      token
    );

    await getAppointments();
  } catch (err) {
    setError(
      err.message ||
        "Ocurrió un error al modificar el estado."
    );
  }
};

  // Cerrar modal
  const closeAppointmentModal = () => {
    setSelectedAppointment(null);

    setIsRescheduling(false);

    setRescheduleServiceId("");
    setRescheduleProfessionalId("");
    setRescheduleProfessionals([]);

    setRescheduleDate("");
    setRescheduleStartAt("");

    setError("");
  };

  // Cargar datos iniciales
  useEffect(() => {
    getAppointments();
    getServices();
  }, [token]);

  // Filtrar reservas
  const filteredAppointments = appointments.filter((appointment) => {
    const searchValue = search.toLowerCase().trim();

    const clientName =
      appointment.user?.name?.toLowerCase() || "";

    const serviceName =
      appointment.service?.name?.toLowerCase() || "";

    const professionalName =
      appointment.professional?.user?.name?.toLowerCase() || "";

    const matchesSearch =
      clientName.includes(searchValue) ||
      serviceName.includes(searchValue) ||
      professionalName.includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <p>Cargando reservas...</p>;
  }

  // Guardar reprogramación
const rescheduleAppointment = async (id) => {
  if (
    !rescheduleServiceId ||
    !rescheduleProfessionalId ||
    !rescheduleStartAt
  ) {
    setError(
      "Seleccioná servicio, profesional, fecha y horario."
    );
    return;
  }

  try {
    setError("");

    await rescheduleAppointmentApi(
      id,
      {
        serviceId: rescheduleServiceId,
        professionalId: rescheduleProfessionalId,
        startAt: rescheduleStartAt,
      },
      token
    );

    await getAppointments();
    closeAppointmentModal();
  } catch (err) {
    setError(
      err.message ||
        "Ocurrió un error al reprogramar la reserva."
    );
  }
};

  // --------

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Reservas</h1>
        <p>
          Consultá y administrá los turnos registrados en la plataforma.
        </p>
      </div>

      {error && (
        <p className="admin-error">{error}</p>
      )}

      <div className="admin-filters">
          <div className="admin-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Buscar por cliente, servicio o profesional..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmados</option>
            <option value="completed">Completados</option>
            <option value="cancelled">Cancelados</option>
            <option value="expired">Expirados</option>
          </select>

          <button
            type="button"
            className="admin-create-button"
          >
            <span>+</span>
            Crear nuevo
          </button>
    </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Listado de reservas</h2>

          <span>
              {filteredAppointments.length} de {appointments.length} reservas
            </span>
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
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map((appointment) => (
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
                    {appointment.professional?.user?.name || "-"}
                  </td>

                  <td>
                    <span className={`appointment-status ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </td>

                  <td>

                    <button
                      type="button"
                      className="admin-detail-button"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      Ver detalle
                    </button>
            
                    </td>
                </tr>
              ))}

              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-empty">
                    No se encontraron reservas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAppointment && (
  <div
    className="admin-modal-overlay"
    onClick={() => closeAppointmentModal()}
  >
    <div
      className="admin-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="admin-modal-header">
        <div>
          <h2>Detalle de la reserva</h2>
          <p>Información y gestión del turno.</p>
        </div>

        <button
          type="button"
          className="admin-modal-close"
          onClick={() => closeAppointmentModal()}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
      <div className="admin-modal-scroll">

        <div className="admin-modal-body">

        <div className="admin-detail-row">
          <span>Cliente</span>
          <strong>
            {selectedAppointment.user?.name || "-"}
          </strong>
        </div>

        <div className="admin-detail-row">
          <span>Servicio</span>
          <strong>
            {selectedAppointment.service?.name || "-"}
          </strong>
        </div>

        <div className="admin-detail-row">
          <span>Profesional</span>
          <strong>
            {selectedAppointment.professional?.user?.name || "-"}
          </strong>
        </div>

        <div className="admin-detail-row">
          <span>Fecha</span>
          <strong>
            {new Date(
              selectedAppointment.startAt
            ).toLocaleDateString("es-AR")}
          </strong>
        </div>

        <div className="admin-detail-row">
          <span>Horario</span>
          <strong>
            {new Date(
              selectedAppointment.startAt
            ).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" - "}
            {new Date(
              selectedAppointment.endAt
            ).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </strong>
        </div>

        <div className="admin-detail-row">
          <span>Estado</span>

          <span
            className={`appointment-status ${selectedAppointment.status}`}
          >
            {statusLabels[selectedAppointment.status] ||
              selectedAppointment.status}
          </span>
        </div>

        <div className="admin-detail-row">
          <span>Reprogramaciones</span>
          <strong>
            {selectedAppointment.rescheduleCount ?? 0} de 2
          </strong>
        </div>

        </div>

        {isRescheduling && (
  <div className="appointment-reschedule">
    <h3>Reprogramar reserva</h3>

    {error && (
      <p className="appointment-reschedule-error">
        {error}
      </p>
    )}

    <div className="appointment-reschedule-fields">

      {/* SERVICIO */}
      <div className="appointment-reschedule-field">
        <label htmlFor="rescheduleService">
          Servicio
        </label>

        <select
          id="rescheduleService"
          value={rescheduleServiceId}
          onChange={async (e) => {
            const serviceId = e.target.value;

            setRescheduleServiceId(serviceId);
            setRescheduleProfessionalId("");
            setRescheduleDate("");
            setRescheduleStartAt("");
            setProfessionalAvailability([]);
            setAvailableSlots([]);

            if (serviceId) {
              await getProfessionalsByService(serviceId);
            } else {
              setRescheduleProfessionals([]);
            }
          }}
        >
          <option value="">
            Seleccionar servicio
          </option>

          {services.map((service) => (
            <option
              key={service.id}
              value={service.id}
            >
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* PROFESIONAL */}
      <div className="appointment-reschedule-field">
        <label htmlFor="rescheduleProfessional">
          Profesional
        </label>

        <select
          id="rescheduleProfessional"
          value={rescheduleProfessionalId}
          disabled={!rescheduleServiceId}
          onChange={async (e) => {
            const professionalId = e.target.value;

            setRescheduleProfessionalId(professionalId);
            setRescheduleDate("");
            setRescheduleStartAt("");
            setAvailableSlots([]);

            if (professionalId) {
              await getProfessionalAvailability(
                professionalId
              );
            } else {
              setProfessionalAvailability([]);
            }
          }}
        >
          <option value="">
            Seleccionar profesional
          </option>

         {rescheduleProfessionals.map((item) => (
            <option
              key={item.professionalId}
              value={item.professionalId}
            >
              {item.professional?.user?.name || "Profesional"}
            </option>
          ))}
          </select>
      </div>

      {/* FECHA */}
      <div className="appointment-reschedule-field">
        <label htmlFor="rescheduleDate">
          Nueva fecha
        </label>

        <input
          id="rescheduleDate"
          type="date"
          value={rescheduleDate}
          disabled={!rescheduleProfessionalId}
          onChange={(e) => {
            const date = e.target.value;

            setRescheduleDate(date);
            setRescheduleStartAt("");

            generateAvailableSlots(
              date,
              rescheduleProfessionalId,
              rescheduleServiceId,
              professionalAvailability
            );
          }}
        />
      </div>
    </div>

    {/* HORARIOS DISPONIBLES */}
    {rescheduleDate && (
      <div className="appointment-reschedule-field">
        <label>Horario disponible</label>

        {availableSlots.length > 0 ? (
          <div className="appointment-slots">
            {availableSlots.map((slot) => (
              <button
                key={slot.startAt}
                type="button"
                className={`appointment-slot ${
                  rescheduleStartAt === slot.startAt
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setRescheduleStartAt(slot.startAt)
                }
              >
                {slot.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="appointment-no-slots">
            No hay horarios disponibles para esta fecha.
          </p>
        )}
      </div>
    )}
  </div>
)}
</div>

        <div className="admin-modal-actions">
                
          {!isRescheduling ? (
            <>
              {selectedAppointment.status === "pending" && (
                <button
                  type="button"
                  className="admin-action-primary"
                  onClick={async () => {
                    await updateAppointmentStatus(
                      selectedAppointment.id,
                      "confirmed"
                    );
                
                    closeAppointmentModal();
                  }}
                >
                  Confirmar reserva
                </button>
              )}
        
              {(selectedAppointment.status === "pending" ||
                selectedAppointment.status === "confirmed") &&
                (selectedAppointment.rescheduleCount ?? 0) < 2 && (
                  <button
                    type="button"
                    className="admin-action-secondary"
                    onClick={startRescheduling}
                  >
                    Reprogramar
                  </button>
                )}

                {(selectedAppointment.status === "pending" ||
                  selectedAppointment.status === "confirmed") &&
                  (selectedAppointment.rescheduleCount ?? 0) >= 2 && (
                    <p className="appointment-reschedule-limit">
                      Máximo de reprogramaciones alcanzado.
                    </p>
                  )}
        
              {(selectedAppointment.status === "pending" ||
                selectedAppointment.status === "confirmed") && (
                <button
                  type="button"
                  className="admin-action-danger"
                  onClick={async () => {
                    await cancelAppointment(selectedAppointment.id);
                    closeAppointmentModal();
                  }}
                >
                  Cancelar reserva
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                className="admin-action-secondary"
                onClick={() => {
                  setIsRescheduling(false);
                  setRescheduleServiceId("");
                  setRescheduleProfessionalId("");
                  setRescheduleProfessionals([]);
                  setProfessionalAvailability([]);
                  setRescheduleDate("");
                  setRescheduleStartAt("");
                  setAvailableSlots([]);
                }}
              >
                Volver
              </button>
            
              <button
                type="button"
                className="admin-action-primary"
                disabled={!rescheduleStartAt}
                onClick={() =>
                  rescheduleAppointment(selectedAppointment.id)
                }
              >
                Guardar nuevo horario
              </button>
            </>
          )}

</div>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminAppointments;