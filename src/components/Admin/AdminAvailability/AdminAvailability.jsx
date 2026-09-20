import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import {
  fetchProfessionals,
  fetchAvailabilityByProfessional,
  createAvailabilityApi,
  updateAvailabilityApi,
  deleteAvailabilityApi,
} from "./adminAvailabilityApi";

import "./AdminAvailability.css";

const DAYS = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const EMPTY_FORM = {
  dayOfWeek: "monday",
  startTime: "",
  endTime: "",
};

const AdminAvailability = () => {
  const { token } = useAuth();

  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionalId, setSelectedProfessionalId] =
    useState("");

  const [availability, setAvailability] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [selectedAvailability, setSelectedAvailability] =
    useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  // =========================
  // PROFESIONALES
  // =========================

  const getProfessionals = async () => {
    try {
      setError("");

      const data = await fetchProfessionals(token);

      setProfessionals(
        Array.isArray(data)
          ? data.filter((professional) => professional.isActive)
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error al obtener los profesionales."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfessionals();
  }, [token]);

  // =========================
  // DISPONIBILIDAD
  // =========================

  const getAvailability = async (professionalId) => {
    if (!professionalId) {
      setAvailability([]);
      return;
    }

    try {
      setLoadingAvailability(true);
      setError("");

      const data =
        await fetchAvailabilityByProfessional(
          professionalId,
          token
        );

      setAvailability(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error al obtener la disponibilidad."
      );

      setAvailability([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleProfessionalChange = async (e) => {
    const professionalId = e.target.value;

    setSelectedProfessionalId(professionalId);
    setAvailability([]);
    setError("");

    if (professionalId) {
      await getAvailability(professionalId);
    }
  };

  // =========================
  // FORMULARIO
  // =========================

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.dayOfWeek) {
      setError("Seleccioná un día.");
      return false;
    }

    if (!form.startTime || !form.endTime) {
      setError(
        "Ingresá el horario de inicio y finalización."
      );
      return false;
    }

    if (form.startTime >= form.endTime) {
      setError(
        "El horario de finalización debe ser posterior al horario de inicio."
      );
      return false;
    }

    return true;
  };

  // =========================
  // CREAR
  // =========================

  const openCreateModal = () => {
    if (!selectedProfessionalId) {
      setError(
        "Seleccioná un profesional antes de agregar disponibilidad."
      );
      return;
    }

    setError("");
    setForm(EMPTY_FORM);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setForm(EMPTY_FORM);
    setError("");
  };

  const createAvailability = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");

      await createAvailabilityApi(
        selectedProfessionalId,
        {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        },
        token
      );

      await getAvailability(selectedProfessionalId);

      closeCreateModal();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo crear la disponibilidad."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDITAR
  // =========================

  const openEditModal = (item) => {
    setError("");

    setSelectedAvailability(item);

    setForm({
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime?.slice(0, 5) || "",
      endTime: item.endTime?.slice(0, 5) || "",
    });
  };

  const closeEditModal = () => {
    setSelectedAvailability(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const updateAvailability = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");

      await updateAvailabilityApi(
        selectedAvailability.id,
        {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        },
        token
      );

      await getAvailability(selectedProfessionalId);

      closeEditModal();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo actualizar la disponibilidad."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // ELIMINAR
  // =========================

  const deleteAvailability = async () => {
    if (!selectedAvailability) return;

    try {
      setSaving(true);
      setError("");

      await deleteAvailabilityApi(
        selectedAvailability.id,
        token
      );

      await getAvailability(selectedProfessionalId);

      closeEditModal();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo eliminar la disponibilidad."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // AGRUPAR POR DÍA
  // =========================

  const availabilityByDay = useMemo(() => {
    const grouped = {};

    DAYS.forEach((day) => {
      grouped[day.value] = [];
    });

    availability.forEach((item) => {
      if (grouped[item.dayOfWeek]) {
        grouped[item.dayOfWeek].push(item);
      }
    });

    Object.values(grouped).forEach((items) => {
      items.sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
    });

    return grouped;
  }, [availability]);

  const selectedProfessional =
    professionals.find(
      (professional) =>
        professional.id === selectedProfessionalId
    );

  const renderForm = () => (
    <div className="availability-form">
      <label>
        Día

        <select
          name="dayOfWeek"
          value={form.dayOfWeek}
          onChange={handleFormChange}
        >
          {DAYS.map((day) => (
            <option
              key={day.value}
              value={day.value}
            >
              {day.label}
            </option>
          ))}
        </select>
      </label>

      <div className="availability-form-row">
        <label>
          Desde

          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleFormChange}
          />
        </label>

        <label>
          Hasta

          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleFormChange}
          />
        </label>
      </div>
    </div>
  );

  if (loading) {
    return <p>Cargando disponibilidad...</p>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Disponibilidad</h1>

        <p>
          Configurá los días y horarios de atención de cada
          profesional.
        </p>
      </div>

      {error &&
        !showCreateModal &&
        !selectedAvailability && (
          <p className="admin-error">{error}</p>
        )}

      <div className="admin-filters availability-toolbar">
        <div className="availability-professional-select">
          <label htmlFor="availabilityProfessional">
            Profesional
          </label>

          <select
            id="availabilityProfessional"
            className="admin-filter-select"
            value={selectedProfessionalId}
            onChange={handleProfessionalChange}
          >
            <option value="">
              Seleccionar profesional
            </option>

            {professionals.map((professional) => (
              <option
                key={professional.id}
                value={professional.id}
              >
                {professional.user?.name ||
                  "Profesional"}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="admin-create-button"
          onClick={openCreateModal}
          disabled={!selectedProfessionalId}
        >
          <span>+</span>
          Agregar horario
        </button>
      </div>

      {!selectedProfessionalId ? (
        <div className="admin-card availability-empty-state">
          <h2>Seleccioná un profesional</h2>

          <p>
            Elegí un profesional para consultar y administrar
            su disponibilidad semanal.
          </p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2>
                Disponibilidad semanal
              </h2>

              <span>
                {selectedProfessional?.user?.name || ""}
              </span>
            </div>

            <span>
              {availability.length}{" "}
              {availability.length === 1
                ? "bloque"
                : "bloques"}
            </span>
          </div>

          {loadingAvailability ? (
            <p className="availability-loading">
              Cargando horarios...
            </p>
          ) : (
            <div className="availability-week">
              {DAYS.map((day) => {
                const dayAvailability =
                  availabilityByDay[day.value];

                return (
                  <div
                    className="availability-day"
                    key={day.value}
                  >
                    <div className="availability-day-name">
                      <strong>{day.label}</strong>
                    </div>

                    <div className="availability-day-slots">
                      {dayAvailability.length > 0 ? (
                        dayAvailability.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="availability-slot"
                            onClick={() =>
                              openEditModal(item)
                            }
                          >
                            <span>
                              {item.startTime?.slice(0, 5)}
                            </span>

                            <span>—</span>

                            <span>
                              {item.endTime?.slice(0, 5)}
                            </span>

                            <small>Editar</small>
                          </button>
                        ))
                      ) : (
                        <span className="availability-no-slots">
                          Sin atención
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Agregar disponibilidad</h2>

                <p>
                  {selectedProfessional?.user?.name ||
                    "Profesional"}
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
                onClick={closeCreateModal}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="admin-action-primary"
                onClick={createAvailability}
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : "Agregar horario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDITAR */}
      {selectedAvailability && (
        <div
          className="admin-modal-overlay"
          onClick={closeEditModal}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Editar disponibilidad</h2>

                <p>
                  Modificá el día o el horario del bloque.
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeEditModal}
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

                {renderForm()}
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-action-danger"
                onClick={deleteAvailability}
                disabled={saving}
              >
                Eliminar horario
              </button>

              <button
                type="button"
                className="admin-action-secondary"
                onClick={closeEditModal}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="admin-action-primary"
                onClick={updateAvailability}
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAvailability;