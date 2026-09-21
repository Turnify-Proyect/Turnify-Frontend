import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import {
  fetchClients,
  fetchClientAppointments,
} from "./adminClientsApi";

import "./AdminClients.css";

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
  expired: "Expirado",
};

const AdminClients = () => {
  const { token } = useAuth();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedClient, setSelectedClient] =
    useState(null);

  const [
    clientAppointments,
    setClientAppointments,
  ] = useState([]);

  const [
    loadingAppointments,
    setLoadingAppointments,
  ] = useState(false);

  const getClients = async () => {
    try {
      setError("");

      const data = await fetchClients(
        token,
        1,
        100
      );

      setClients(data.users || []);
    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error al obtener los clientes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClients();
  }, [token]);

  const openClientDetail = async (client) => {
    try {
      setError("");

      setSelectedClient(client);
      setClientAppointments([]);
      setLoadingAppointments(true);

      const appointments =
        await fetchClientAppointments(
          client.id,
          token
        );

      setClientAppointments(
        Array.isArray(appointments)
          ? appointments
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "No se pudo obtener el historial del cliente."
      );

      setClientAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const closeClientModal = () => {
    setSelectedClient(null);
    setClientAppointments([]);
    setError("");
  };

  const filteredClients = clients.filter(
    (client) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const name =
        client.name?.toLowerCase() || "";

      const email =
        client.email?.toLowerCase() || "";

      const phone =
        client.phone?.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        phone.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          client.isActive) ||
        (statusFilter === "inactive" &&
          !client.isActive);

      return matchesSearch && matchesStatus;
    }
  );

  const sortedAppointments = [
    ...clientAppointments,
  ].sort(
    (a, b) =>
      new Date(b.startAt) -
      new Date(a.startAt)
  );

  const completedAppointments =
    clientAppointments.filter(
      (appointment) =>
        appointment.status === "completed"
    ).length;

  const upcomingAppointments =
    clientAppointments.filter(
      (appointment) =>
        (appointment.status === "pending" ||
          appointment.status === "confirmed") &&
        new Date(appointment.startAt) >
          new Date()
    ).length;

  if (loading) {
    return <p>Cargando clientes...</p>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Clientes</h1>

          <p>
            Consultá los clientes registrados y
            su historial de reservas.
          </p>
        </div>
      </div>

      {error && !selectedClient && (
        <p className="admin-error">
          {error}
        </p>
      )}

      <div className="admin-filters">
        <div className="admin-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            Todos los estados
          </option>

          <option value="active">
            Activos
          </option>

          <option value="inactive">
            Inactivos
          </option>
        </select>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Listado de clientes</h2>

          <span>
            {filteredClients.length} de{" "}
            {clients.length} clientes
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map(
                  (client) => (
                    <tr key={client.id}>
                      <td>
                        {client.name || "-"}
                      </td>

                      <td>
                        {client.email || "-"}
                      </td>

                      <td>
                        {client.phone || "-"}
                      </td>

                      <td>
                        {[
                          client.city,
                          client.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </td>

                      <td>
                        <span
                          className={`client-status ${
                            client.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {client.isActive
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-detail-button"
                          onClick={() =>
                            openClientDetail(
                              client
                            )
                          }
                        >
                          Ver detalle
                        </button>
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
                    No se encontraron clientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETALLE CLIENTE */}
      {selectedClient && (
        <div
          className="admin-modal-overlay"
          onClick={closeClientModal}
        >
          <div
            className="admin-modal client-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div>
                <h2>Detalle del cliente</h2>

                <p>
                  {selectedClient.email}
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeClientModal}
              >
                ×
              </button>
            </div>

            <div className="admin-modal-scroll">
              <div className="admin-modal-body">

                {error && (
                  <p className="admin-error">
                    {error}
                  </p>
                )}

                <div className="client-detail-grid">
                  <div className="admin-detail-row">
                    <span>Nombre</span>

                    <strong>
                      {selectedClient.name ||
                        "-"}
                    </strong>
                  </div>

                  <div className="admin-detail-row">
                    <span>Email</span>

                    <strong>
                      {selectedClient.email ||
                        "-"}
                    </strong>
                  </div>

                  <div className="admin-detail-row">
                    <span>Teléfono</span>

                    <strong>
                      {selectedClient.phone ||
                        "-"}
                    </strong>
                  </div>

                  <div className="admin-detail-row">
                    <span>Estado</span>

                    <span
                      className={`client-status ${
                        selectedClient.isActive
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {selectedClient.isActive
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </div>

                  <div className="admin-detail-row">
                    <span>País</span>

                    <strong>
                      {selectedClient.country ||
                        "-"}
                    </strong>
                  </div>

                  <div className="admin-detail-row">
                    <span>Ciudad</span>

                    <strong>
                      {selectedClient.city ||
                        "-"}
                    </strong>
                  </div>

                  <div className="admin-detail-row">
                    <span>Dirección</span>

                    <strong>
                      {selectedClient.address ||
                        "-"}
                    </strong>
                  </div>
                </div>

                <div className="client-summary">
                  <div className="client-summary-card">
                    <strong>
                      {
                        clientAppointments.length
                      }
                    </strong>

                    <span>
                      Reservas totales
                    </span>
                  </div>

                  <div className="client-summary-card">
                    <strong>
                      {completedAppointments}
                    </strong>

                    <span>
                      Completadas
                    </span>
                  </div>

                  <div className="client-summary-card">
                    <strong>
                      {upcomingAppointments}
                    </strong>

                    <span>
                      Próximas
                    </span>
                  </div>
                </div>

                <div className="client-history">
                  <h3>
                    Historial de reservas
                  </h3>

                  {loadingAppointments ? (
                    <p>
                      Cargando reservas...
                    </p>
                  ) : sortedAppointments.length >
                    0 ? (
                    <div className="client-history-table-wrapper">
                      <table className="client-history-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Servicio</th>
                            <th>
                              Profesional
                            </th>
                            <th>Estado</th>
                          </tr>
                        </thead>

                        <tbody>
                          {sortedAppointments.map(
                            (appointment) => (
                              <tr
                                key={
                                  appointment.id
                                }
                              >
                                <td>
                                  {new Date(
                                    appointment.startAt
                                  ).toLocaleDateString(
                                    "es-AR"
                                  )}
                                  {" "}
                                  {new Date(
                                    appointment.startAt
                                  ).toLocaleTimeString(
                                    "es-AR",
                                    {
                                      hour:
                                        "2-digit",
                                      minute:
                                        "2-digit",
                                    }
                                  )}
                                </td>

                                <td>
                                  {appointment
                                    .service
                                    ?.name ||
                                    "-"}
                                </td>

                                <td>
                                  {appointment
                                    .professional
                                    ?.user
                                    ?.name ||
                                    "-"}
                                </td>

                                <td>
                                  <span
                                    className={`appointment-status ${appointment.status}`}
                                  >
                                    {STATUS_LABELS[
                                      appointment
                                        .status
                                    ] ||
                                      appointment.status}
                                  </span>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="admin-empty">
                      El cliente todavía no
                      tiene reservas.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-action-secondary"
                onClick={closeClientModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;