import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Header/Navbar";
import "./ClientDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function ClientDashboard() {
  const { token, logout  } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigate = useNavigate();

  const [tab, setTab] = useState("appointments");

  const [profile, setProfile] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
  });

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

        setProfileData({
          name: profileDataResponse.name ?? "",
          email: profileDataResponse.email ?? "",
          phone: profileDataResponse.phone ?? "",
          country: profileDataResponse.country ?? "",
          city: profileDataResponse.city ?? "",
          address: profileDataResponse.address ?? "",
        });

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
      paid: "Pagado",
      pending: "Pendiente",
    };

    return labels[status] ?? status;
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      paid: "Pagado",
      pending: "Pendiente",
    };

    return labels[status] ?? status;
  };

  const getInitials = () => {
    if (!profileData.name) return "";

    return profileData.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

     const handleSaveProfile = async () => {
     try {
       const response = await fetch(`${API_URL}/users/${profile.id}`, {
         method: "PUT",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
           name: profileData.name,
           email: profileData.email,
           phone: profileData.phone,
           country: profileData.country,
           city: profileData.city,
           address: profileData.address,
         }),
       }); 

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(
           errorData.message || "No se pudo actualizar el perfil"
         );
       }   

       const updatedUser = await response.json();  

       setProfile((currentProfile) => ({
         ...currentProfile,
         ...profileData,
       }));    

       alert("Perfil actualizado correctamente");
     } catch (error) {
       alert(error.message);
     }
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

      alert("Turno cancelado correctamente");
    } catch (error) {
      alert(error.message);
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

  return (
    <>
    <Navbar />
    <div className="client-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-welcome">Hola de nuevo 👋</p>
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
            className={tab === "appointments" ? "active" : ""}
            onClick={() => setTab("appointments")}
          >
            Mis Turnos
          </button>

          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => setTab("profile")}
          >
            Mi Perfil
          </button>


          {/* <button className={tab === "payments" ? "active" : ""} onClick={() => setTab("payments")}>
            Pagos
          </button> */} {/* No contemplado en las historias de usuario, se deja comentado por el momento. */}

        </div>

        {tab === "appointments" && (
          <section className="appointments-list">
            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3>No tenés turnos registrados</h3>
                <p>
                  Cuando reserves un turno, vas a poder verlo desde acá.
                </p>

                <button onClick={() => navigate("/booking")}>
                  Reservar turno
                </button>
              </div>
            ) : (
              appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="appointment-card"
                >
                  <div className="appointment-main">
                    <div className="appointment-icon">💆</div>

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
  <span
    className={`status-badge ${appointment.status}`}
  >
    {getStatusLabel(appointment.status)}
  </span>

  {appointment.paymentStatus && (
    <span className={`payment-badge ${appointment.paymentStatus}`}>
      {getPaymentStatusLabel(appointment.paymentStatus)}
      {appointment.paymentStatus === "paid" && appointment.depositAmount
        ? ` ($${Number(appointment.depositAmount).toLocaleString("es-AR")})`
        : ""}
    </span>
  )}

  {(appointment.status === "confirmed" ||
    appointment.status === "pending") && (
    <>
      <button className="cancel-button" onClick={() => handleCancelAppointment(appointment.id)}>
        Cancelar
      </button>

      <button className="reschedule-button" onClick={() => navigate("/booking", {
            state: {
              mode: "reschedule",
              appointmentId: appointment.id,
            },
          })
        }
      >
        Reprogramar
      </button>
    </>
  )}
</div>
                </article>
              ))
            )}
          </section>
        )}

        {tab === "profile" && (
          <section className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {getInitials()}
              </div>

              <div>
                <h3>{profileData.name}</h3>
              </div>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>País</label>
                <input
                  value={profileData.country}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      country: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Ciudad</label>
                <input
                  value={profileData.city}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      city: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      address: e.target.value,
                    })
                  }
                />
              </div>

            <button className="save-profile-button" onClick={handleSaveProfile}>
                Guardar cambios
            </button>
            </div>
          </section>
        )}

        {/* {tab === "payments" && (
          <section className="payments-card">
            <h3>Historial de Pagos</h3>

            <div className="empty-payments">
              <p>
                Todavía no conectamos el historial de pagos con el backend.
              </p>
            </div>
          </section> /* No contemplado en las historias de usuario, se deja comentado por el momento.
        )} */}
      </div>
    </div>
  </>
  );
 
}

export default ClientDashboard;