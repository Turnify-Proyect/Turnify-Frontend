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

const AdminAvailability = () => {
  const { token } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [pendingProfessionalId, setPendingProfessionalId] = useState("");
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const hasUnsavedChanges = availability.some((item) => item.isNew || item.isDirty);


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

  const changeProfessional = async (professionalId) => {
    setSelectedProfessionalId(professionalId);
    setAvailability([]);
    setError("");
    setShowUnsavedWarning(false);
    setPendingProfessionalId("");

    if (professionalId) {
      await getAvailability(professionalId);
    }
  };

  const handleProfessionalChange = async (e) => {
    const professionalId = e.target.value;

    if (
      professionalId !== selectedProfessionalId &&
      hasUnsavedChanges
    ) {
      setPendingProfessionalId(professionalId);
      setShowUnsavedWarning(true);

      return;
    }

    await changeProfessional(professionalId);
  };

  const handleSlotChange = (slotKey, field, value) => {
  setAvailability((current) =>
    current.map((item) => {
      const key = item.id || item.tempId;

      if (key !== slotKey) {
        return item;
      }

      return {
        ...item,
        [field]: value,
        isDirty: !item.isNew,
      };
    })
  );
};

  const discardChangesAndContinue = async () => {
    const professionalId = pendingProfessionalId;

    setShowUnsavedWarning(false);
    setPendingProfessionalId("");

    await changeProfessional(professionalId);
  };

  const keepEditing = () => {
    setShowUnsavedWarning(false);
    setPendingProfessionalId("");
  };

  const addMinutesToTime = (time, minutes) => {
      const [hours, mins] = time
        .split(":")
        .map(Number);

      const totalMinutes =
        hours * 60 + mins + minutes;

      const newHours = Math.floor(
        totalMinutes / 60
      );
    
      const newMinutes = totalMinutes % 60;
    
      if (newHours >= 24) {
        return "23:59";
      }
    
      return `${String(newHours).padStart(
        2,
        "0"
      )}:${String(newMinutes).padStart(2, "0")}`;
    };

  const addAvailabilitySlot = (dayOfWeek) => {
    if (!selectedProfessionalId) return;

    const daySlots = availability
      .filter(
        (item) =>
          item.dayOfWeek === dayOfWeek
      )
      .sort((a, b) =>
        (a.startTime || "").localeCompare(
          b.startTime || ""
        )
      );

    let startTime = "09:00";
    let endTime = "13:00";

    if (daySlots.length > 0) {
      const lastSlot =
        daySlots[daySlots.length - 1];

      const lastEnd =
        lastSlot.endTime?.slice(0, 5);

      if (lastEnd === "23:59") {
        setError(
          "No se puede agregar otra franja después de las 23:59."
        );
        return;
      }

      startTime = lastEnd || "09:00";

      endTime = addMinutesToTime(
        startTime,
        60
      );
    }

    const tempId = crypto.randomUUID();

    setAvailability((current) => [
      ...current,
      {
        tempId,
        dayOfWeek,
        startTime,
        endTime,
        isNew: true,
      },
    ]);

    setError("");
  };

  const validateSlot = (item) => {
    const startTime = item.startTime?.slice(0, 5);
    const endTime = item.endTime?.slice(0, 5);

    if (!startTime || !endTime) {
      setError(
        "Ingresá el horario de inicio y finalización."
      );
      return false;
    }

    if (startTime >= endTime) {
      setError(
        "El horario de finalización debe ser posterior al horario de inicio."
      );
      return false;
    }

    const currentKey = item.id || item.tempId;

    const overlapping = availability.some(
      (existing) => {
        const existingKey =
          existing.id || existing.tempId;

        if (existingKey === currentKey) {
          return false;
        }

        if (
          existing.dayOfWeek !== item.dayOfWeek
        ) {
          return false;
        }

        const existingStart =
          existing.startTime?.slice(0, 5);

        const existingEnd =
          existing.endTime?.slice(0, 5);

        if (!existingStart || !existingEnd) {
          return false;
        }

        return (
          startTime < existingEnd &&
          endTime > existingStart
        );
      }
    );

    if (overlapping) {
      setError(
        "Esta franja se superpone con otro horario configurado para el mismo día."
      );
      return false;
    }

    return true;
  };

  const saveAvailabilitySlot = async (item) => {
  if (!validateSlot(item)) return;

  const slotKey = item.id || item.tempId;

  try {
    setSavingId(slotKey);
    setError("");

    const data = {
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime.slice(0, 5),
      endTime: item.endTime.slice(0, 5),
    };

    if (item.isNew) {
        const created =
          await createAvailabilityApi(
            selectedProfessionalId,
            data,
            token
          );
        
        setAvailability((current) =>
          current.map((availability) =>
            availability.tempId === item.tempId
              ? created
              : availability
          )
        );
      
          }
        } catch (err) {
          setError(
            err.message ||
              "No se pudo guardar el horario."
    );
  } finally {
    setSavingId(null);
  }
};

  const removeAvailabilitySlot = async (item) => {
    const slotKey = item.id || item.tempId;

    if (item.isNew) {
      setAvailability((current) =>
        current.filter(
          (availability) =>
            availability.tempId !== item.tempId
        )
      );

      return;
    }

    try {
      setSavingId(slotKey);
      setError("");

      await deleteAvailabilityApi(
        item.id,
        token
      );

      await getAvailability(
        selectedProfessionalId
      );
    } catch (err) {
      setError(
        err.message ||
          "No se pudo eliminar la disponibilidad."
      );
    } finally {
      setSavingId(null);
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
        (a.startTime || "").localeCompare(
          b.startTime || ""
        )
      );
    });

    return grouped;
  }, [availability]);

  const selectedProfessional =
    professionals.find(
      (professional) =>
        professional.id === selectedProfessionalId
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

      {error && (
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

      </div>

      {showUnsavedWarning && (
        <div className="availability-unsaved-warning">
          <div>
            <strong>Tenés cambios sin guardar.</strong>

            <p>
              Si cambiás de profesional, se perderán las
              modificaciones pendientes.
            </p>
          </div>

          <div className="availability-unsaved-actions">
            <button
              type="button"
              className="admin-action-secondary"
              onClick={keepEditing}
            >
              Seguir editando
            </button>

            <button
              type="button"
              className="admin-action-danger"
              onClick={discardChangesAndContinue}
            >
              Descartar y continuar
            </button>
          </div>
        </div>
      )}

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
            
                  <span>
                    {dayAvailability.length
                      ? `${dayAvailability.length} ${
                          dayAvailability.length === 1
                            ? "franja"
                            : "franjas"
                        }`
                      : "Sin atención"}
                  </span>
                </div>
                      
                <div className="availability-day-content">
                  <div className="availability-day-slots">
                    {dayAvailability.map((item) => {
                      const slotKey =
                        item.id || item.tempId;
                    
                      const isSaving =
                        savingId === slotKey;
                    
                      return (
                        <div
                          className="availability-slot-row"
                          key={slotKey}
                        >
                          <div className="availability-time-field">
                            <span>Desde</span>
                      
                            <input
                              type="time"
                              value={
                                item.startTime?.slice(
                                  0,
                                  5
                                ) || ""
                              }
                              onChange={(e) =>
                                handleSlotChange(
                                  slotKey,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              disabled={isSaving}
                            />
                          </div>
                            
                          <span className="availability-time-separator">
                            —
                          </span>
                            
                          <div className="availability-time-field">
                            <span>Hasta</span>
                            
                            <input
                              type="time"
                              value={
                                item.endTime?.slice(
                                  0,
                                  5
                                ) || ""
                              }
                              onChange={(e) =>
                                handleSlotChange(
                                  slotKey,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              disabled={isSaving}
                            />
                          </div>
                            
                          <div className="availability-slot-actions">
                            <button
                              type="button"
                              className="availability-save-button"
                              onClick={() =>
                                saveAvailabilitySlot(
                                  item
                                )
                              }
                              disabled={isSaving}
                              title="Guardar horario"
                            >
                              {isSaving ? "..." : "✓"}
                            </button>
                            
                            <button
                              type="button"
                              className="availability-delete-button"
                              onClick={() =>
                                removeAvailabilitySlot(
                                  item
                                )
                              }
                              disabled={isSaving}
                              title="Eliminar horario"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
          </div>

          <button
            type="button"
            className="availability-add-slot"
            onClick={() =>
              addAvailabilitySlot(day.value)
            }
          >
            + Agregar franja
          </button>
        </div>
      </div>
    );
  })}
</div>
          )}
        </div>
      )}
  
    </div>
  );
};

export default AdminAvailability;