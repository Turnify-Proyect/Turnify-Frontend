import React from "react";
import "./AppointmentDetailModal.css";
import {formatArgentinaDate, formatArgentinaTime, } from "../../../helpers/formatLocalDate";

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
  no_show: "Ausente",
  expired: "Expirado",
};

const statusClasses = {
  pending: "status-badge status-pending",
  confirmed: "status-badge status-confirmed",
  completed: "status-badge status-completed",
  cancelled: "status-badge status-cancelled",
  no_show: "status-badge status-cancelled",
  expired: "status-badge status-expired",
};

const AppointmentDetailModal = ({ appointment, onClose, onComplete, onNoShow }) => {
  if (!appointment) return null;

  const clientName = appointment.user?.name || appointment.client?.name || "Cliente Sin Nombre";
  const clientEmail = appointment.user?.email || appointment.client?.email || "Sin email registrado";
  const clientPhone = appointment.user?.phone || appointment.client?.phone || "No especificado";

  const serviceName = appointment.service?.name || "Servicio no especificado";
  const servicePrice = appointment.service?.price ? `$${Number(appointment.service.price).toLocaleString("es-AR")}` : "-";
  const serviceDuration = appointment.service?.durationMinutes ? `${appointment.service.durationMinutes} min` : "-";

  const appointmentDate = formatArgentinaDate(appointment.startAt);
  const appointmentTime = formatArgentinaTime(appointment.startAt);

  const currentStatus = appointment.status?.toLowerCase() || "pending";


  return (
    <div className="appointment-modal-overlay" onClick={onClose}>
      <div className="appointment-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="appointment-modal-header">
          <h2>Detalle de la Reserva</h2>
          <button type="button" className="appointment-modal-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="appointment-modal-body">
          <div className="appointment-modal-status-row">
            <span className="appointment-modal-label">Estado Actual:</span>
            <span className={statusClasses[currentStatus] || "status-badge"}>
              {statusLabels[currentStatus] || currentStatus}
            </span>
          </div>

          <div className="appointment-detail-section">
            <h3>👤 Datos del Cliente</h3>
            <div className="detail-grid">
              <div>
                <span className="detail-label">Nombre:</span>
                <p className="detail-value">{clientName}</p>
              </div>
              <div>
                <span className="detail-label">Email:</span>
                <p className="detail-value">{clientEmail}</p>
              </div>
              <div>
                <span className="detail-label">Teléfono:</span>
                <p className="detail-value">{clientPhone}</p>
              </div>
            </div>
          </div>

          <div className="appointment-detail-section">
            <h3>✦ Servicio y Horario</h3>
            <div className="detail-grid">
              <div>
                <span className="detail-label">Servicio:</span>
                <p className="detail-value">{serviceName}</p>
              </div>
              <div>
                <span className="detail-label">Fecha:</span>
                <p className="detail-value">{appointmentDate}</p>
              </div>
              <div>
                <span className="detail-label">Hora:</span>
                <p className="detail-value">{appointmentTime}</p>
              </div>
              <div>
                <span className="detail-label">Duración:</span>
                <p className="detail-value">{serviceDuration}</p>
              </div>
              <div>
                <span className="detail-label">Precio:</span>
                <p className="detail-value text-accent">{servicePrice}</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="appointment-modal-footer">
          {currentStatus !== "completed" && (
            <button
              type="button"
              className="btn-action btn-complete"
              onClick={() => onComplete(appointment.id)}
            >
              ✓ Marcar Completado
            </button>
          )}

          {currentStatus !== "cancelled" && currentStatus !== "no_show" && (
            <button
              type="button"
              className="btn-action btn-cancel"
              onClick={() => onNoShow(appointment.id)}
            >
              ✕ Marcar Ausente
            </button>
          )}

          <button type="button" className="btn-action btn-close-secondary" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
