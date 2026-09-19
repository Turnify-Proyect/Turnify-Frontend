import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchProfessionals,
  fetchProfessionalServices,
  activateProfessionalApi,
  deactivateProfessionalApi,
  updateProfessionalApi,
} from "./adminProfessionalsApi";

import "./AdminProfessionals.css";

const PROFESSIONAL_SPECIALTIES = [
  { value: "cosmetología", label: "Cosmetología" },
  { value: "masajes", label: "Masajes" },
  { value: "manicuría", label: "Manicuría" },
  { value: "pedicuría", label: "Pedicuría" },
  { value: "depilación", label: "Depilación" },
];

const AdminProfessionals = () => {
  const { token } = useAuth();

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedProfessional, setSelectedProfessional] =
    useState(null);

  const [professionalServices, setProfessionalServices] =
    useState([]);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editSpecialty, setEditSpecialty] = useState("");

  const getProfessionals = async () => {
    try {
      setError("");

      const data = await fetchProfessionals(token);

      setProfessionals(data);
    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error al obtener los profesionales."
      );
    } finally {
      setLoading(false);
    }
  };

  const openProfessionalDetail = async (professional) => {
  try {
    setError("");

    setSelectedProfessional(professional);
    setEditSpecialty(professional.specialty || "");
    setIsEditing(false);

    const services = await fetchProfessionalServices(
      professional.id
    );

    setProfessionalServices(services);
  } catch (err) {
    setError(
      err.message ||
        "No se pudieron obtener los servicios del profesional."
    );

    setProfessionalServices([]);
  }
};

  const closeProfessionalModal = () => {
  setSelectedProfessional(null);
  setProfessionalServices([]);
  setIsEditing(false);
  setEditSpecialty("");
  setError("");
};

  const changeProfessionalStatus = async () => {
    try {
      setError("");

      if (selectedProfessional.isActive) {
        await deactivateProfessionalApi(
          selectedProfessional.id,
          token
        );
      } else {
        await activateProfessionalApi(
          selectedProfessional.id,
          token
        );
      }

      await getProfessionals();
      closeProfessionalModal();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo modificar el estado del profesional."
      );
    }
  };

  const saveProfessionalChanges = async () => {
  if (!editSpecialty) {
    setError("Seleccioná una especialidad.");
    return;
  }

  try {
    setError("");

    await updateProfessionalApi(
      selectedProfessional.id,
      {
        specialty: editSpecialty,
      },
      token
    );

    await getProfessionals();

    setSelectedProfessional((current) => ({
      ...current,
      specialty: editSpecialty,
    }));

    setIsEditing(false);
  } catch (err) {
    setError(
      err.message ||
        "No se pudo actualizar el profesional."
    );
  }
};

  useEffect(() => {
    getProfessionals();
  }, [token]);

  const filteredProfessionals = professionals.filter(
    (professional) => {
      const searchValue = search.toLowerCase().trim();

      const name =
        professional.user?.name?.toLowerCase() || "";

      const email =
        professional.user?.email?.toLowerCase() || "";

      const specialty =
        professional.specialty?.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        specialty.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          professional.isActive) ||
        (statusFilter === "inactive" &&
          !professional.isActive);

      return matchesSearch && matchesStatus;
    }
  );

  if (loading) {
    return <p>Cargando profesionales...</p>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Profesionales</h1>

        <p>
          Consultá y administrá los profesionales registrados
          en la plataforma.
        </p>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-filters">
        <div className="admin-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Buscar por nombre, email o especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Listado de profesionales</h2>

          <span>
            {filteredProfessionals.length} de{" "}
            {professionals.length} profesionales
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Especialidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredProfessionals.map((professional) => (
                <tr key={professional.id}>
                  <td>
                    {professional.user?.name || "-"}
                  </td>

                  <td>
                    {professional.user?.email || "-"}
                  </td>

                  <td>
                    {professional.specialty || "-"}
                  </td>

                  <td>
                    <span
                      className={`professional-status ${
                        professional.isActive
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {professional.isActive
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="admin-detail-button"
                      onClick={() =>
                        openProfessionalDetail(professional)
                      }
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}

              {filteredProfessionals.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="admin-empty"
                  >
                    No se encontraron profesionales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProfessional && (
        <div
          className="admin-modal-overlay"
          onClick={closeProfessionalModal}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Detalle del profesional</h2>
                <p>
                  Información y gestión del profesional.
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeProfessionalModal}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="admin-modal-scroll">
              <div className="admin-modal-body">
                <div className="admin-detail-row">
                  <span>Nombre</span>
                  <strong>
                    {selectedProfessional.user?.name || "-"}
                  </strong>
                </div>

                <div className="admin-detail-row">
                  <span>Email</span>
                  <strong>
                    {selectedProfessional.user?.email || "-"}
                  </strong>
                </div>

                <div className="admin-detail-row">
                  <span>Teléfono</span>
                  <strong>
                    {selectedProfessional.user?.phone || "-"}
                  </strong>
                </div>

                <div className="admin-detail-row">
                  <span>Especialidad</span>
                    
                  {isEditing ? (
                    <select
                      className="professional-specialty-select"
                      value={editSpecialty}
                      onChange={(e) => setEditSpecialty(e.target.value)}
                    >
                      {PROFESSIONAL_SPECIALTIES.map((specialty) => (
                        <option
                          key={specialty.value}
                          value={specialty.value}
                        >
                          {specialty.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <strong>
                      {selectedProfessional.specialty || "-"}
                    </strong>
                  )}
                </div>

                <div className="admin-detail-row">
                  <span>Estado</span>

                  <span
                    className={`professional-status ${
                      selectedProfessional.isActive
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {selectedProfessional.isActive
                      ? "Activo"
                      : "Inactivo"}
                  </span>
                </div>

                <div className="professional-services">
                  <span className="professional-services-title">
                    Servicios
                  </span>

                  {professionalServices.length > 0 ? (
                    <div className="professional-services-list">
                      {professionalServices.map((item) => (
                        <span
                          key={item.serviceId}
                          className="professional-service"
                        >
                          {item.service?.name || "Servicio"}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="professional-no-services">
                      No tiene servicios asociados.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="admin-action-secondary"
                        onClick={() => {
                          setEditSpecialty(
                            selectedProfessional.specialty || ""
                          );
                          setIsEditing(false);
                          setError("");
                        }}
                      >
                        Cancelar edición
                      </button>
                    
                      <button
                        type="button"
                        className="admin-action-primary"
                        onClick={saveProfessionalChanges}
                      >
                        Guardar cambios
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={
                          selectedProfessional.isActive
                            ? "admin-action-danger"
                            : "admin-action-primary"
                        }
                        onClick={changeProfessionalStatus}
                      >
                        {selectedProfessional.isActive
                          ? "Desactivar profesional"
                          : "Activar profesional"}
                      </button>
                        
                      <button
                        type="button"
                        className="admin-action-secondary"
                        onClick={() => setIsEditing(true)}
                      >
                        Editar
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

export default AdminProfessionals;