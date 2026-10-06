import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { DayPicker } from "@daypicker/react";
import { es } from "@daypicker/react/locale";
import "@daypicker/react/style.css";
import { toast } from "react-toastify";

import {
  fetchProfessionals,
  fetchAvailabilityByProfessional,
  createAvailabilityApi,
  updateAvailabilityApi,
  deleteAvailabilityApi,
  fetchProfessionalBlocks,
  createProfessionalBlock,
  deleteProfessionalBlock,
} from "./adminAvailabilityApi";
import { fetchMyProfessionalProfile } from "../../Professional/professionalApi";

import "./AdminAvailability.css";

import {formatLocalDate, parseLocalDate } from "../../../helpers/formatLocalDate"

const DAYS = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const AdminAvailability = ({ professionalMode = false }) => {
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
  const [blocks, setBlocks] = useState([]);
  const [selectedRange, setSelectedRange] = useState(undefined);
  const [blockReason, setBlockReason] = useState("");
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [savingBlock, setSavingBlock] = useState(false);
  const [activeSection, setActiveSection] = useState("schedule");
  const [selectedScheduleDays, setSelectedScheduleDays] = useState([]);
  const [bulkStartTime, setBulkStartTime] = useState("09:00");
  const [bulkEndTime, setBulkEndTime] = useState("13:00");
  const [savingBulk, setSavingBulk] = useState(false);
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
  const initializeAvailability = async () => {
    if (!token) return;

    if (!professionalMode) {
      await getProfessionals();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const professional = await fetchMyProfessionalProfile(token);

      setProfessionals([professional]);
      setSelectedProfessionalId(professional.id);

      await Promise.all([
        getAvailability(professional.id),
        getBlocks(professional.id),
      ]);
    } catch (err) {
      setError(
        err.message ||
          "No se pudo obtener la información del profesional."
      );
    } finally {
      setLoading(false);
    }
  };

  initializeAvailability();
}, [token, professionalMode]);

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

  const toggleScheduleDay = (dayValue) => {
    setSelectedScheduleDays((current) =>
      current.includes(dayValue)
        ? current.filter(
            (day) => day !== dayValue
          )
        : [...current, dayValue]
    );
  };

  const saveBulkAvailability = async () => {
    if (hasUnsavedChanges) {
      setError(
        "Guardá o eliminá primero los cambios individuales pendientes."
      );
      return;
    }

    if (selectedScheduleDays.length === 0) {
      const message =
        "Seleccioná al menos un día de la semana.";

      setError(message);
      toast.warning(message);

      return;
    }

    if (!bulkStartTime || !bulkEndTime) {
      setError(
        "Completá el horario de inicio y finalización."
      );
      return;
    }

    if (bulkStartTime >= bulkEndTime) {
      setError(
        "El horario de inicio debe ser anterior al horario de finalización."
      );
      return;
    }

    const dayWithOverlap =
      selectedScheduleDays.find((dayValue) => {
        const daySlots =
          availabilityByDay[dayValue] || [];

        return daySlots.some((item) => {
          const existingStart =
            item.startTime.slice(0, 5);

          const existingEnd =
            item.endTime.slice(0, 5);

          return (
            bulkStartTime < existingEnd &&
            bulkEndTime > existingStart
          );
        });
      });

    if (dayWithOverlap) {
      const dayLabel = DAYS.find(
        (day) => day.value === dayWithOverlap
      )?.label;

      const message = `La franja se superpone con un horario existente en ${dayLabel}.`;
      setError(message);
      toast.error(message);

      return;
    }

    try {
      setSavingBulk(true);
      setError("");

      await Promise.all(
        selectedScheduleDays.map((dayOfWeek) =>
          createAvailabilityApi(
            selectedProfessionalId,
            {
              dayOfWeek,
              startTime: bulkStartTime,
              endTime: bulkEndTime,
            },
            token
          )
        )
      );

      await getAvailability(
        selectedProfessionalId
      );

      setSelectedScheduleDays([]);
      toast.success("Franja horaria asignada correctamente.");

    } catch (err) {
      await getAvailability(
        selectedProfessionalId
      );

      setError(
        err.message ||
          "No se pudo asignar la franja horaria."
      );
    } finally {
      setSavingBulk(false);
    }
  };

  const changeProfessional = async (professionalId) => {
    setSelectedProfessionalId(
      professionalId
    );

    setAvailability([]);
    setBlocks([]);
    setSelectedRange(undefined);
    setBlockReason("");

    setError("");
    setShowUnsavedWarning(false);
    setPendingProfessionalId("");

    if (professionalId) {
      await Promise.all([
        getAvailability(professionalId),
        getBlocks(professionalId),
      ]);
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
      const message =
        "Ingresá el horario de inicio y finalización.";

      setError(message);
      toast.warning(message);
      return false;
    }

    if (startTime >= endTime) {
      const message =
        "El horario de finalización debe ser posterior al horario de inicio.";

      setError(message);
      toast.warning(message);
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
       const message =
         "La franja horaria se superpone con otro horario configurado para ese día.";

       setError(message);
       toast.error(message);
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

        toast.success(
        "Horario agregado correctamente."
      );
      
          }
        } catch (err) {
       const message =
         err.message ||
         "No se pudo guardar el horario.";

       setError(message);
       toast.error(message);
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
      toast.success("Horario eliminado correctamente.");
    } catch (err) {
      const message =
        err.message ||
        "No se pudo eliminar el horario.";

      setError(message);
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  const getBlocks = async (professionalId) => {
  if (!professionalId) {
    setBlocks([]);
    return;
  }

  try {
    setLoadingBlocks(true);
    setError("");

    const data =
      await fetchProfessionalBlocks(
        professionalId,
        token
      );

    setBlocks(
      Array.isArray(data) ? data : []
    );
  } catch (err) {
    setError(
      err.message ||
        "No se pudieron obtener los bloqueos."
    );

    setBlocks([]);
  } finally {
    setLoadingBlocks(false);
  }
};


const saveBlock = async () => {
    if (!selectedRange?.from) {
    setError(
      "Seleccioná al menos una fecha para crear el bloqueo."
    );
    return;
  }

    const startDate = selectedRange.from;
    const endDate =
    selectedRange.to || selectedRange.from;

  try {
    setSavingBlock(true);
    setError("");

      await createProfessionalBlock(
      selectedProfessionalId,
      {
        startDate: formatLocalDate(startDate),
        endDate: formatLocalDate(endDate),
        reason:
          blockReason.trim() || undefined,
      },
      token
    );

    await getBlocks(selectedProfessionalId);

      setSelectedRange(undefined);
    setBlockReason("");
    toast.success("Bloqueo creado correctamente.");
  } catch (err) {
    const message =
        err.message ||
        "No se pudo crear el bloqueo.";

      setError(message);
      toast.error(message);
  } finally {
    setSavingBlock(false);
  }
};

const removeBlock = async (id) => {
    try {
      setSavingBlock(true);
      setError("");

      await deleteProfessionalBlock(
        id,
        token
      );

      await getBlocks(
        selectedProfessionalId
      );
      toast.success("Bloqueo eliminado correctamente.");
    } catch (err) {
      const message =
        err.message ||
        "No se pudo eliminar el bloqueo.";
        
      setError(message);
      toast.error(message);
    } finally {
      setSavingBlock(false);
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

  const selectedProfessional = professionals.find(
      (professional) =>
        professional.id === selectedProfessionalId
    );
    if (loading) {
      return <p>Cargando disponibilidad...</p>;
    }

  //==========================================//
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const blockedRanges = blocks.map((block) => ({
  from: parseLocalDate(block.startDate),
  to: parseLocalDate(block.endDate),

}));

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

      {selectedProfessionalId && (
          <div className="availability-tabs">
            <button
              type="button"
              className={`availability-tab ${
                activeSection === "schedule"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSection("schedule")
              }
            >
              Horario semanal
            </button>
            
            <button
              type="button"
              className={`availability-tab ${
                activeSection === "blocks"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSection("blocks")
              }
            >
              Ausencias y bloqueos
            
              {blocks.length > 0 && (
                <span className="availability-tab-count">
                  {blocks.length}
                </span>
              )}
            </button>
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
        <>
          {activeSection === "schedule" && (
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
        <>
          <div className="availability-bulk-editor">
            <div className="availability-bulk-header">
              <div>
                <strong>
                  Asignar horario a varios días
                </strong>
      
                <span>
                  Seleccioná los días y definí una
                  franja común.
                </span>
              </div>
      
              {selectedScheduleDays.length > 0 && (
                <span className="availability-selected-count">
                  {selectedScheduleDays.length}{" "}
                  {selectedScheduleDays.length === 1
                    ? "día seleccionado"
                    : "días seleccionados"}
                </span>
              )}
            </div>
            
            <div className="availability-day-selector">
              {DAYS.map((day) => {
                const selected =
                  selectedScheduleDays.includes(
                    day.value
                  );
                
                return (
                  <button
                    key={day.value}
                    type="button"
                    className={`availability-day-chip ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() =>
                      toggleScheduleDay(day.value)
                    }
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            
            <div className="availability-bulk-controls">
              <label>
                <span>Desde</span>
            
                <input
                  type="time"
                  value={bulkStartTime}
                  onChange={(e) =>
                    setBulkStartTime(e.target.value)
                  }
                />
              </label>
                
              <label>
                <span>Hasta</span>
                
                <input
                  type="time"
                  value={bulkEndTime}
                  onChange={(e) =>
                    setBulkEndTime(e.target.value)
                  }
                />
              </label>
                
              <button
                type="button"
                className="availability-primary-button"
                onClick={saveBulkAvailability}
                disabled={
                  savingBulk ||
                  selectedScheduleDays.length === 0
                }
              >
                {savingBulk
                  ? "Asignando..."
                  : "Asignar franja"}
              </button>
            </div>
          </div>
                
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
  </>
      )},
</div>
          
      )}


{activeSection === "blocks" && (
  <div className="admin-card availability-blocks-card">
    <div className="admin-card-header">
      <div>
        <h2>Ausencias y bloqueos</h2>
        <span>
          Configurá vacaciones, licencias u otros
          períodos en los que el profesional no estará
          disponible.
        </span>
      </div>

      <span>
        {blocks.length}{" "}
        {blocks.length === 1
          ? "bloqueo"
          : "bloqueos"}
      </span>
    </div>

    <div className="availability-blocks-layout">
      <div className="availability-calendar-section">
        <DayPicker
          mode="range"
          locale={es}
          selected={selectedRange}
          onSelect={setSelectedRange}
          disabled={{
            before: today,
          }}
          modifiers={{
            today,
            blocked: blockedRanges,
          }}
          modifiersClassNames={{
            today: "availability-calendar-today",
            blocked: "availability-calendar-blocked",
          }}
        />

        <div className="availability-calendar-legend">
            <span>
              <i className="today" />
              Hoy
            </span>

            <span>
              <i className="selected" />
              Selección
            </span>

            <span>
              <i className="blocked" />
              Bloqueado
            </span>
          </div>
      </div>

      <div className="availability-block-form">
        <h3>Nuevo bloqueo</h3>

        <div className="availability-range-summary">
          <div>
            <span>Desde</span>

            <strong>
              {selectedRange?.from
                ? selectedRange.from.toLocaleDateString(
                    "es-AR"
                  )
                : "Seleccionar"}
            </strong>
          </div>

          <div>
            <span>Hasta</span>

            <strong>
              {selectedRange?.to
                ? selectedRange.to.toLocaleDateString(
                    "es-AR"
                  )
                : selectedRange?.from
                  ? selectedRange.from.toLocaleDateString(
                      "es-AR"
                    )
                  : "Seleccionar"}
            </strong>
          </div>
        </div>

        <label>
          Motivo
          <input
            type="text"
            value={blockReason}
            maxLength={150}
            onChange={(e) =>
              setBlockReason(e.target.value)
            }
            placeholder="Ej. Vacaciones"
          />
        </label>

        <button
          type="button"
          className="availability-primary-button"
          onClick={saveBlock}
          disabled={
            savingBlock ||
            !selectedRange?.from
          }
        >
          {savingBlock
            ? "Guardando..."
            : "Bloquear período"}
        </button>
      </div>
    </div>

    <div className="availability-block-list">
      <h3>Bloqueos configurados</h3>

      {loadingBlocks ? (
        <p className="availability-loading">
          Cargando bloqueos...
        </p>
      ) : blocks.length === 0 ? (
        <p className="availability-no-blocks">
          No hay ausencias o bloqueos configurados
          para este profesional.
        </p>
      ) : (
        blocks.map((block) => (
          <div
            key={block.id}
            className="availability-block-item"
          >
            <div className="availability-block-info">
              <strong>
                {parseLocalDate(
                  block.startDate
                ).toLocaleDateString("es-AR")}
                {" — "}
                {parseLocalDate(
                  block.endDate
                ).toLocaleDateString("es-AR")}
              </strong>

              <span>
                {block.reason || "Sin motivo"}
              </span>
            </div>

            <button
              type="button"
              className="availability-delete-button"
              onClick={() =>
                removeBlock(block.id)
              }
              disabled={savingBlock}
              title="Eliminar bloqueo"
            >
              ×
            </button>
          </div>
        ))
      )}
          </div>
        </div>
      )}

    </>
  )}

  

</div>
);
};

export default AdminAvailability;
