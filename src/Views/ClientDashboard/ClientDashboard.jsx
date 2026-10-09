import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Navbar from "../../components/Header/Navbar";
import UserProfile from "../../components/Profile/UserProfile";
import "./ClientDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function ClientDashboard() {
  const { token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigate = useNavigate();

  const [tab, setTab] = useState("appointments");

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, appointmentsResponse] = await Promise.all([
          fetch(`${API_URL}/users/me`, { headers }),
          fetch(`${API_URL}/appointments/me`, { headers }),
        ]);

        if (!profileResponse.ok) {
          throw new Error("No se pudo obtener el perfil del usuario");
        }

        if (!appointmentsResponse.ok) {
          throw new Error("No se pudieron obtener los turnos");
        }

        const profileDataResponse = await profileResponse.json();
        const appointmentsData = await appointmentsResponse.json();

        setProfile(profileDataResponse);

        setAppointments(appointmentsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      cancelled: "Cancelado",
      completed: "Completado",
      expired: "Expirado",
    };

    return labels[status] ?? status;
  };


  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(
        `${API_URL}/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.message || "No se pudo cancelar el turno"
        );
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: "cancelled" }
            : appointment
        )
      );

      toast.info("Turno cancelado correctamente");
    } catch (error) {
      toast.error(error.message || "Error al cancelar el turno");
    }
  };

  if (loading) {
    return <div className="dashboard-state">Cargando...</div>;
  }

  if (!token) {
    return (
      <div className="dashboard-state">
        No hay una sesión iniciada.
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-state">{error}</div>;
  }

  const groupedAppointments = appointments.reduce(
    (groups, appointment) => {
      const orderId =
        appointment.orderDetail?.order?.order_id ||
        appointment.id;

      if (!groups[orderId]) {
        groups[orderId] = {
          orderId,
          order: appointment.orderDetail?.order,
          appointments: [],
        };
      }

      groups[orderId].appointments.push(appointment);

      return groups;
    },
    {}
  );

  const appointmentGroups = Object.values(groupedAppointments).sort(
    (a, b) => {
      const dateA = Math.max(
        ...a.appointments.map((appointment) =>
          new Date(appointment.createdAt).getTime()
        )
      );

      const dateB = Math.max(
        ...b.appointments.map((appointment) =>
          new Date(appointment.createdAt).getTime()
        )
      );

      return dateB - dateA;
    }
  );

  const handlePayOrder = (group) => {
    const { order, appointments } = group;

    if (!order?.order_id) {
      return;
    }

    const totalPrice = Number(
      appointments.reduce(
        (total, appointment) =>
          total + Number(appointment.service?.price || 0),
        0
      )
    );

    const deposit =
      Math.round(totalPrice * 0.3 * 100) / 100;

    navigate(`/checkout/${order.order_id}`, {
      state: {
        orderId: order.order_id,
        appointments,
        totalPrice,
        deposit,

        // Los mantenemos por compatibilidad con
        // el Checkout actual mientras lo adaptamos.
        serviceName:
          appointments.length === 1
            ? appointments[0].service?.name
            : `${appointments.length} servicios`,

        professionalName:
          appointments.length === 1
            ? appointments[0].professional?.user?.name
            : "Varios profesionales",

        date:
          appointments.length === 1
            ? appointments[0].startAt?.split("T")[0]
            : "",

        time:
          appointments.length === 1
            ? formatTime(appointments[0].startAt)
            : "",
      },
    });
  };

  return (
    <>
      <Navbar />

      <div className="client-dashboard">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div>
              <p className="dashboard-welcome">
                Hola de nuevo 👋
              </p>

              <h1>{profile?.name}</h1>
            </div>

            <div className="dashboard-actions">
              <button
                className="new-appointment-button"
                onClick={() => navigate("/booking")}
              >
                + Nuevo Turno
              </button>
            </div>
          </div>

          <div className="dashboard-tabs">
            <button
              className={
                tab === "appointments" ? "active" : ""
              }
              onClick={() => setTab("appointments")}
            >
              Mis Turnos
            </button>

            <button
              className={
                tab === "profile" ? "active" : ""
              }
              onClick={() => setTab("profile")}
            >
              Mi Perfil
            </button>
          </div>

          {tab === "appointments" && (
            <section className="appointments-list">
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    📅
                  </div>

                  <h3>No tenés turnos registrados</h3>

                  <p>
                    Cuando reserves un turno, vas a poder
                    verlo desde acá.
                  </p>

                  <button
                    onClick={() => navigate("/booking")}
                  >
                    Reservar turno
                  </button>
                </div>
              ) : (
                appointmentGroups.map((group) => {
                  const {
                    order,
                    appointments: groupAppointments,
                  } = group;

                  const pendingPayment =
                    order?.status === "pending" &&
                    groupAppointments.some(
                      (appointment) =>
                        appointment.status === "pending"
                    );

                  return (
                    <article
                      key={group.orderId}
                      className="appointment-order-card"
                    >
                      <div className="appointment-order-header">
                        <div>
                          <span className="appointment-order-label">
                            {order?.status === "pending"
                              ? "Reserva pendiente"
                              : "Reserva"}
                          </span>

                          {groupAppointments.length > 1 && (
                            <span className="appointment-order-count">
                              {groupAppointments.length} turnos
                            </span>
                          )}
                        </div>

                        {pendingPayment && (
                          <span className="status-badge pending">
                            Pendiente de pago
                          </span>
                        )}
                      </div>

                      <div className="appointment-order-items">
                        {groupAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="appointment-order-item"
                          >
                            <div className="appointment-main">
                              <div className="appointment-icon">
                                💆
                              </div>

                              <div>
                                <h3>{appointment.service?.name}</h3>

                                <p>
                                  con{" "}
                                  {appointment.professional?.user?.name ??
                                    "Profesional"}
                                </p>

                                <p>
                                  {formatDate(appointment.startAt)} ·{" "}
                                  {formatTime(appointment.startAt)} hs
                                </p>
                              </div>
                            </div>

                            <div className="appointment-actions">
                              {!pendingPayment && (
                                <span
                                  className={`status-badge ${appointment.status}`}
                                >
                                  {getStatusLabel(appointment.status)}
                                </span>
                              )}

                              {(appointment.status === "confirmed" ||
                                appointment.status === "pending") && (
                                <>
                                  <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                      handleCancelAppointment(
                                        appointment.id
                                      )
                                    }
                                  >
                                    Cancelar
                                  </button>

                                  {(appointment.rescheduleCount ?? 0) < 2 ? (
                                    <button
                                      type="button"
                                      className="reschedule-button"
                                      onClick={() =>
                                        navigate("/booking", {
                                          state: {
                                            mode: "reschedule",
                                            appointmentId: appointment.id,
                                            serviceId: appointment.service?.id,
                                          },
                                        })
                                      }
                                    >
                                      Reprogramar
                                    </button>
                                  ) : (
                                    <span className="reschedule-limit-message">
                                      Máximo de reprogramaciones alcanzado.
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {pendingPayment && (
                        <div className="appointment-order-payment">
                          <div>
                            <strong>Seña pendiente</strong>

                            <p>
                              Aboná la seña para confirmar{" "}
                              {groupAppointments.length === 1
                                ? "este turno."
                                : `estos ${groupAppointments.length} turnos.`}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="appointment-pay-button"
                            onClick={() => handlePayOrder(group)}
                          >
                            Pagar seña
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </section>
          )}
          {tab === "profile" && <UserProfile />}
        </div>
      </div>
    </>
  );
}

export default ClientDashboard;