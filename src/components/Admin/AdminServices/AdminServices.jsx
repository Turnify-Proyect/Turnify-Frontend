import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import {
  fetchAllServices,
  createServiceApi,
  updateServiceApi,
  deactivateServiceApi,
  reactivateServiceApi,
} from "./adminServicesApi";

import "./AdminServices.css";

const SERVICE_CATEGORIES = [
  { value: "Masajes", label: "Masajes" },
  { value: "Faciales", label: "Faciales" },
  { value: "Uñas", label: "Uñas" },
  { value: "Pedicuría", label: "Pedicuría" },
  { value: "Cabello", label: "Cabello" },
  { value: "Spa", label: "Spa" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  price: "",
  durationMinutes: "",
  imageUrl: "",
};

const AdminServices = () => {
  const { token } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedService, setSelectedService] =
    useState(null);

  const [isEditing, setIsEditing] =
    useState(false);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [saving, setSaving] =
    useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError("");


    const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

const data = await response.json();


      if (data.secure_url) {

        setForm((current) => ({
          ...current,
          imageUrl: data.secure_url,
        }));
        return data.secure_url;
      } else {
        setError("No se pudo procesar la respuesta de la imagen.");
        return null;
      }
    } catch (err) {
      console.error("Error Cloudinary:", err);
      setError("Error al subir la imagen al servidor.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };


  const getServices = async () => {
    try {
      setError("");

      const data =
        await fetchAllServices(token);

      setServices(data);
    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error al obtener los servicios."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getServices();
  }, [token]);

  const fillForm = (service) => {
    setForm({
      name: service.name || "",
      description:
        service.description || "",
      category:
        service.category || "",
      price:
        service.price?.toString() || "",
      durationMinutes:
        service.durationMinutes?.toString() ||
        "",
      imageUrl:
        service.imageUrl || "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError(
        "Ingresá el nombre del servicio."
      );
      return false;
    }

    if (!form.category) {
      setError(
        "Seleccioná una categoría."
      );
      return false;
    }

    if (
      !form.price ||
      Number(form.price) < 0
    ) {
      setError(
        "Ingresá un precio válido."
      );
      return false;
    }

    if (
      !form.durationMinutes ||
      Number(form.durationMinutes) < 1
    ) {
      setError(
        "Ingresá una duración válida."
      );
      return false;
    }

    return true;
  };


  const openCreateModal = () => {
    setError("");
    setForm(EMPTY_FORM);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setForm(EMPTY_FORM);
    setError("");
  };

  const createService = async () => {
    if (!validateForm()) return;

    if (isUploading) {
      setError("Esperá a que termine de subir la imagen.");
    return;
    }
    if (!form.imageUrl) {
    setError("Subí una imagen antes de crear el servicio.");
    return;
  }
    
    try {
      setSaving(true);
      setError("");

          const payload = {
      ...form,
      durationMinutes: Number(form.durationMinutes),
    };



      await createServiceApi(
        payload,
        token
      );

      await getServices();

      closeCreateModal();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo crear el servicio."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DETALLE / EDITAR
  // =========================

  const openServiceDetail = (
    service
  ) => {
    setError("");
    setSelectedService(service);
    setIsEditing(false);
    fillForm(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
    setIsEditing(false);
    setForm(EMPTY_FORM);
    setError("");
  };

  const startEditing = () => {
    fillForm(selectedService);
    setError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    fillForm(selectedService);
    setError("");
    setIsEditing(false);
  };

  const saveServiceChanges =
    async () => {
      if (!validateForm()) return;

      try {
        setSaving(true);
        setError("");

        const updated =
          await updateServiceApi(
            selectedService.id,
            handleImageUpload(),
            token
          );

        setSelectedService(updated);

        await getServices();

        setIsEditing(false);
      } catch (err) {
        setError(
          err.message ||
            "No se pudo actualizar el servicio."
        );
      } finally {
        setSaving(false);
      }
    };

  // =========================
  // ESTADO
  // =========================

  const changeServiceStatus =
    async () => {
      try {
        setError("");

        let updated;

        if (selectedService.isActive) {
          updated =
            await deactivateServiceApi(
              selectedService.id,
              token
            );
        } else {
          updated =
            await reactivateServiceApi(
              selectedService.id,
              token
            );
        }

        setSelectedService(updated);

        await getServices();
      } catch (err) {
        setError(
          err.message ||
            "No se pudo modificar el estado del servicio."
        );
      }
    };

  // =========================
  // FILTROS
  // =========================

  const filteredServices =
    services.filter((service) => {
      const value = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        service.name
          ?.toLowerCase()
          .includes(value) ||
        service.category
          ?.toLowerCase()
          .includes(value) ||
        service.description
          ?.toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          service.isActive) ||
        (statusFilter === "inactive" &&
          !service.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const formatPrice = (price) => {
    const value = Number(price);

    if (Number.isNaN(value)) {
      return "-";
    }

    return value.toLocaleString(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
      }
    );
  };

  if (loading) {
    return (
      <p>Cargando servicios...</p>
    );
  }

  const renderForm = () => (
    <div className="service-form">
      <label>
        Nombre *

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleFormChange}
          maxLength={100}
        />
      </label>

      <label>
        Categoría *

        <select
          name="category"
          value={form.category}
          onChange={handleFormChange}
        >
          <option value="">
            Seleccionar categoría
          </option>

          {SERVICE_CATEGORIES.map(
            (category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            )
          )}
        </select>
      </label>

      <div className="service-form-row">
        <label>
          Precio *

          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleFormChange}
            min="0"
            step="0.01"
          />
        </label>

        <label>
          Duración (minutos) *

          <input
            type="number"
            name="durationMinutes"
            value={
              form.durationMinutes
            }
            onChange={handleFormChange}
            min="1"
            step="1"
          />
        </label>
      </div>

      <label>
        Descripción

        <textarea
          name="description"
          value={form.description}
          onChange={handleFormChange}
          rows="4"
        />
      </label>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "15px" }}>
  <span style={{ fontWeight: "600" }}>Imagen del servicio</span>

  <input
    type="file"
    id="serviceImageUpload"
    accept="image/*"
    onChange={handleImageUpload}
    disabled={isUploading || saving}
    style={{ display: "none" }}
  />

  <label
    htmlFor="serviceImageUpload"
    className="admin-create-button"
    style={{
      cursor: isUploading || saving ? "not-allowed" : "pointer",
      opacity: isUploading || saving ? 0.6 : 1,
      display: "inline-block",
      width: "fit-content",
    }}
  >
    {isUploading ? "Subiendo..." : "Seleccionar imagen"}
  </label>

  {isUploading && (
    <p style={{ fontSize: "0.85rem", color: "#666", margin: "4px 0 0 0" }}>
      Subiendo archivo a Cloudinary...
    </p>
  )}

  {form.imageUrl && (
    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <p style={{ fontSize: "0.85rem", color: "green", margin: 0 }}>
        ✓ Imagen lista para guardar
      </p>
      <img
        src={form.imageUrl}
        alt="Vista previa del servicio"
        style={{
          width: "120px",
          height: "120px",
          objectFit: "cover",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
    </div>
  )}
</div>

    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Servicios</h1>

        <p>
          Administrá los servicios
          disponibles en la plataforma.
        </p>
      </div>

      {error &&
        !selectedService &&
        !showCreateModal && (
          <p className="admin-error">
            {error}
          </p>
        )}

      <div className="admin-filters">
        <div className="admin-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Buscar por nombre, categoría o descripción..."
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
            setStatusFilter(
              e.target.value
            )
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

        <button
          type="button"
          className="admin-create-button"
          onClick={openCreateModal}
        >
          <span>+</span>
          Crear nuevo
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            Listado de servicios
          </h2>

          <span>
            {filteredServices.length} de{" "}
            {services.length} servicios
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map(
                (service) => (
                  <tr key={service.id}>
                    <td>
                      {service.name}
                    </td>

                    <td>
                      {service.category ||
                        "-"}
                    </td>

                    <td>
                      {formatPrice(
                        service.price
                      )}
                    </td>

                    <td>
                      {
                        service.durationMinutes
                      }{" "}
                      min
                    </td>

                    <td>
                      <span
                        className={`service-status ${
                          service.isActive
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {service.isActive
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-detail-button"
                        onClick={() =>
                          openServiceDetail(
                            service
                          )
                        }
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                )
              )}

              {filteredServices.length ===
                0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="admin-empty"
                  >
                    No se encontraron
                    servicios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETALLE */}
      {selectedService && (
        <div
          className="admin-modal-overlay"
          onClick={closeServiceModal}
        >
          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div>
                <h2>
                  {isEditing
                    ? "Editar servicio"
                    : "Detalle del servicio"}
                </h2>

                <p>
                  Información y gestión del
                  servicio.
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  closeServiceModal
                }
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

                {isEditing ? (
                  renderForm()
                ) : (
                  <>
                    {selectedService.imageUrl && (
                      <img
                        className="service-detail-image"
                        src={
                          selectedService.imageUrl
                        }
                        alt={
                          selectedService.name
                        }
                      />
                    )}

                    <div className="admin-detail-row">
                      <span>Nombre</span>
                      <strong>
                        {
                          selectedService.name
                        }
                      </strong>
                    </div>

                    <div className="admin-detail-row">
                      <span>
                        Categoría
                      </span>
                      <strong>
                        {selectedService.category ||
                          "-"}
                      </strong>
                    </div>

                    <div className="admin-detail-row">
                      <span>Precio</span>
                      <strong>
                        {formatPrice(
                          selectedService.price
                        )}
                      </strong>
                    </div>

                    <div className="admin-detail-row">
                      <span>Duración</span>
                      <strong>
                        {
                          selectedService.durationMinutes
                        }{" "}
                        minutos
                      </strong>
                    </div>

                    <div className="admin-detail-row">
                      <span>
                        Descripción
                      </span>
                      <strong>
                        {selectedService.description ||
                          "-"}
                      </strong>
                    </div>

                    <div className="admin-detail-row">
                      <span>Estado</span>

                      <span
                        className={`service-status ${
                          selectedService.isActive
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {selectedService.isActive
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="admin-modal-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="admin-action-secondary"
                    onClick={
                      cancelEditing
                    }
                    disabled={saving}
                  >
                    Cancelar edición
                  </button>

                  <button
                    type="button"
                    className="admin-action-primary"
                    onClick={
                      saveServiceChanges
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={
                      selectedService.isActive
                        ? "admin-action-danger"
                        : "admin-action-primary"
                    }
                    onClick={
                      changeServiceStatus
                    }
                  >
                    {selectedService.isActive
                      ? "Desactivar servicio"
                      : "Activar servicio"}
                  </button>

                  <button
                    type="button"
                    className="admin-action-secondary"
                    onClick={
                      startEditing
                    }
                  >
                    Editar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREAR */}
      {showCreateModal && (
        <div
          className="admin-modal-overlay"
          onClick={closeCreateModal}
        >
          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div>
                <h2>
                  Crear servicio
                </h2>

                <p>
                  Ingresá los datos del
                  nuevo servicio.
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  closeCreateModal
                }
              >
              </button>
            </div>

            <div className="admin-modal-scroll">
              <div className="admin-modal-body">
                {error && (
                  <p className="admin-error">
                    {error}
                  </p>
                )}

                {renderForm()}
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-action-secondary"
                onClick={
                  closeCreateModal
                }
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="admin-action-primary"
                onClick={createService}
                disabled={isUploading || saving}
              >
                {saving
                  ? "Creando..."
                  : "Crear servicio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;