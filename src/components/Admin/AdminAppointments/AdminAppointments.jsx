import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import "./AdminAppointments.css";
import {
  fetchAppointments,
  fetchServices,
  fetchProfessionalsByService,
  fetchProfessionalAvailability,
  fetchAvailableSlots,
  fetchClients,
  createAdminOrderApi,
  createAdminCheckoutSessionApi,
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
  const [availableSlots, setAvailableSlots] = useState([]);

  const [rescheduleServiceId, setRescheduleServiceId] = useState("");
  const [rescheduleProfessionalId, setRescheduleProfessionalId] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartAt, setRescheduleStartAt] = useState("");

  // Crear reserva
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [createProfessionals, setCreateProfessionals] = useState([]);
  const [createAvailableSlots, setCreateAvailableSlots] = useState([]);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [createdPayment, setCreatedPayment] = useState(null);
  const [paymentLinkCopied, setPaymentLinkCopied] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: "",
    serviceId: "",
    professionalId: "",
    date: "",
    time: "",
  });

  const statusLabels = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado",
    expired: "Expirado",
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

  // Obtener disponibilidad de un profesional
const getAvailableSlots = async (date, professionalId, serviceId, appointmentId = null) => {
  if (!date || !professionalId || !serviceId) {
    setAvailableSlots([]);
    return;
  }

  try {
    setError("");

    const data = await fetchAvailableSlots(
      professionalId,
      serviceId,
      date,
      token,
      appointmentId
    );

    setAvailableSlots(
      Array.isArray(data?.slots)
        ? data.slots
        : []
    );
  } catch (err) {
    setAvailableSlots([]);

    setError(
      err.message ||
        "No se pudieron obtener los horarios disponibles."
    );
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

  setIsRescheduling(true);
};

  // Cancelar turno
 const cancelAppointment = async (id) => {
  try {
    setError("");

    await cancelAppointmentApi(id, token);

    await getAppointments();
    toast.success("Reserva cancelada correctamente");
  } catch (err) {
    toast.error(
      err.message || "Ocurrió un error al cancelar la reserva."
    );
  }
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
     if (status === "confirmed") {
      toast.success("Reserva confirmada correctamente");
    } else if (status === "completed") {
      toast.success("Reserva completada correctamente");
    } else {
      toast.success("Estado de la reserva actualizado correctamente");
    }
   } catch (err) {
    toast.error(
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
    toast.error(
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
    toast.success("Reserva reprogramada correctamente");
    closeAppointmentModal();
  } catch (err) {
     toast.error(
      err.message ||
        "Ocurrió un error al reprogramar la reserva."
    );
  }
};

// Abrir modal de creación de reserva
const openCreateModal = async () => {
  try {
    setError("");
    setCreatedPayment(null);
    setPaymentLinkCopied(false);

    setCreateForm({
      userId: "",
      serviceId: "",
      professionalId: "",
      date: "",
      time: "",
    });

    setCreateProfessionals([]);
    setCreateAvailableSlots([]);

    const data = await fetchClients(token);

    setClients(data);
    setShowCreateModal(true);
  } catch (err) {
    setError(
      err.message ||
        "No se pudieron cargar los clientes."
    );
  }
};

// Cerrar modal de creación de reserva
const closeCreateModal = () => {
  setShowCreateModal(false);

  setCreateForm({
    userId: "",
    serviceId: "",
    professionalId: "",
    date: "",
    time: "",
  });

  setCreateProfessionals([]);
  setCreateAvailableSlots([]);
  setCreatedPayment(null);
  setPaymentLinkCopied(false);
};

const handleCreateServiceChange = async (serviceId) => {
  setCreateForm((current) => ({
    ...current,
    serviceId,
    professionalId: "",
    date: "",
    time: "",
  }));

  setCreateProfessionals([]);
  setCreateAvailableSlots([]);

  if (!serviceId) return;

  try {
    setError("");

    const data =
      await fetchProfessionalsByService(serviceId);

    setCreateProfessionals(data);
  } catch (err) {
    setError(
      err.message ||
        "No se pudieron obtener los profesionales."
    );
  }
};

const handleCreateProfessionalChange = (
  professionalId
) => {
  setCreateForm((current) => ({
    ...current,
    professionalId,
    date: "",
    time: "",
  }));

  setCreateAvailableSlots([]);
};

const handleCreateDateChange = async (date) => {
  setCreateForm((current) => ({
    ...current,
    date,
    time: "",
  }));

  setCreateAvailableSlots([]);

  if (
    !date ||
    !createForm.professionalId ||
    !createForm.serviceId
  ) {
    return;
  }

  try {
    setError("");

    const data = await fetchAvailableSlots(
      createForm.professionalId,
      createForm.serviceId,
      date,
      token
    );

    setCreateAvailableSlots(
      Array.isArray(data?.slots)
        ? data.slots
        : []
    );
  } catch (err) {
    setError(
      err.message ||
        "No se pudieron obtener los horarios disponibles."
    );
  }
};

const createAdminAppointment = async () => {
  if (
    !createForm.userId ||
    !createForm.serviceId ||
    !createForm.professionalId ||
    !createForm.date ||
    !createForm.time
  ) {
    toast.error(
      "Seleccioná cliente, servicio, profesional, fecha y horario."
    );
    return;
  }

  try {
    setCreatingAppointment(true);
    setError("");

    const startAt =
      `${createForm.date}T${createForm.time}:00-03:00`;

    const order = await createAdminOrderApi(
      {
        userId: createForm.userId,

        appointments: [
          {
            professionalId:
              createForm.professionalId,

            serviceId:
              createForm.serviceId,

            startAt,
          },
        ],
      },
      token
    );

    const payment =
      await createAdminCheckoutSessionApi(
        order.orderId,
        token
      );

    setCreatedPayment(payment);

    await getAppointments();
  } catch (err) {
    toast.error(
      err.message ||
        "No se pudo crear la reserva."
    );
  } finally {
    setCreatingAppointment(false);
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

          <button type="button" className="admin-create-button" onClick={openCreateModal}>
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

            getAvailableSlots(
              date,
              rescheduleProfessionalId,
              rescheduleServiceId,
              selectedAppointment.id
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
            {availableSlots.map((time) => (
              <button
                key={time}
                type="button"
                className={`appointment-slot ${
                  rescheduleStartAt ===
                  `${rescheduleDate}T${time}:00-03:00`
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setRescheduleStartAt(
                    `${rescheduleDate}T${time}:00-03:00`
                  )
                }
              >
                {time}
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

      {showCreateModal && (
        <div
          className="admin-modal-overlay"
          onClick={closeCreateModal}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Nueva reserva</h2>
      
                <p>
                  Creá una reserva para un cliente.
                </p>
              </div>
      
              <button
                type="button"
                className="admin-modal-close"
                onClick={closeCreateModal}
              >
                ×
              </button>
            </div>
      
            <div className="admin-modal-scroll">
              <div className="admin-modal-body">
      
                {!createdPayment ? (
                  <div className="appointment-reschedule">
                  
                    <div className="appointment-reschedule-fields">
                
                      {/* CLIENTE */}
                      <div className="appointment-reschedule-field">
                        <label htmlFor="createClient">
                          Cliente
                        </label>
                
                        <select
                          id="createClient"
                          value={createForm.userId}
                          onChange={(e) =>
                            setCreateForm((current) => ({
                              ...current,
                              userId: e.target.value,
                            }))
                          }
                        >
                          <option value="">
                            Seleccionar cliente
                          </option>
                        
                          {clients.map((client) => (
                            <option
                              key={client.id}
                              value={client.id}
                            >
                              {client.name} - {client.email}
                            </option>
                          ))}
                        </select>
                      </div>
                        
                      {/* SERVICIO */}
                      <div className="appointment-reschedule-field">
                        <label htmlFor="createService">
                          Servicio
                        </label>
                        
                        <select
                          id="createService"
                          value={createForm.serviceId}
                          onChange={(e) =>
                            handleCreateServiceChange(
                              e.target.value
                            )
                          }
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
                        <label htmlFor="createProfessional">
                          Profesional
                        </label>
                        
                        <select
                          id="createProfessional"
                          value={
                            createForm.professionalId
                          }
                          disabled={!createForm.serviceId}
                          onChange={(e) =>
                            handleCreateProfessionalChange(
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Seleccionar profesional
                          </option>
                        
                          {createProfessionals.map(
                            (item) => (
                              <option
                                key={
                                  item.professionalId
                                }
                                value={
                                  item.professionalId
                                }
                              >
                                {item.professional?.user
                                  ?.name ||
                                  "Profesional"}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                        
                      {/* FECHA */}
                      <div className="appointment-reschedule-field">
                        <label htmlFor="createDate">
                          Fecha
                        </label>
                        
                        <input
                          id="createDate"
                          type="date"
                          value={createForm.date}
                          disabled={
                            !createForm.professionalId
                          }
                          onChange={(e) =>
                            handleCreateDateChange(
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                        
                    {/* HORARIOS */}
                    {createForm.date && (
                      <div className="appointment-reschedule-field">
                        <label>
                          Horario disponible
                        </label>
                    
                        {createAvailableSlots.length > 0 ? (
                          <div className="appointment-slots">
                            {createAvailableSlots.map(
                              (time) => (
                                <button
                                  key={time}
                                  type="button"
                                  className={`appointment-slot ${
                                    createForm.time === time
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    setCreateForm(
                                      (current) => ({
                                        ...current,
                                        time,
                                      })
                                    )
                                  }
                                >
                                  {time}
                                </button>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="appointment-no-slots">
                            No hay horarios disponibles
                            para esta fecha.
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="appointment-create-result">
                  
                    <h3>
                      Reserva creada correctamente
                    </h3>
                
                    <p>
                      La reserva quedó pendiente de pago.
                    </p>
                
                    <p>
                      <strong>Cliente:</strong>{" "}
                      {createdPayment.email}
                    </p>
                
                    <p>
                      <strong>Seña:</strong>{" "}
                      $
                      {Number(
                        createdPayment.depositAmount
                      ).toLocaleString("es-AR")}
                    </p>
                    
                    <p>
                      {createdPayment.emailSent
                        ? "El enlace de pago fue enviado por correo al cliente."
                        : "No se pudo enviar el correo, pero el enlace de pago fue generado correctamente."}
                    </p>
                      
                    <button
                      type="button"
                      className={`admin-action-secondary ${
                        paymentLinkCopied ? "copied" : ""
                      }`}
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          createdPayment.checkoutUrl
                        );
                      
                        setPaymentLinkCopied(true);
                      }}
                    >
                      {paymentLinkCopied
                        ? "✓ Link copiado"
                        : "Copiar link de pago"}
                    </button>
                    
                  </div>
                )}

                {error && (
                  <p className="appointment-reschedule-error">
                    {error}
                  </p>
                )}
              </div>
            </div>
              
            <div className="admin-modal-actions">
              
              {!createdPayment ? (
                <>
                  <button
                    type="button"
                    className="admin-action-secondary"
                    onClick={closeCreateModal}
                  >
                    Cancelar
                  </button>
              
                  <button
                    type="button"
                    className="admin-action-primary"
                    disabled={
                      creatingAppointment ||
                      !createForm.userId ||
                      !createForm.serviceId ||
                      !createForm.professionalId ||
                      !createForm.date ||
                      !createForm.time
                    }
                    onClick={createAdminAppointment}
                  >
                    {creatingAppointment
                      ? "Creando..."
                      : "Crear reserva"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="admin-action-primary"
                  onClick={closeCreateModal}
                >
                  Cerrar
                </button>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;