const API_URL = import.meta.env.VITE_API_URL;

const getErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }
  return data?.message || fallback;
};

// Obtener todas las reservas (o por profesional si se provee el ID)
export const fetchAppointments = async (token, professionalId) => {
  const url = professionalId
    ? `${API_URL}/appointments/professional/${professionalId}`
    : `${API_URL}/appointments`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "No se pudieron obtener las reservas del profesional.")
    );
  }

  return data;
};

// Obtener los servicios asignados al profesional
export const fetchProfessionalServices = async (professionalId) => {
  const response = await fetch(`${API_URL}/professionals/${professionalId}/services`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "No se pudieron obtener los servicios asignados.")
    );
  }

  return data;
};

// Obtener todos los servicios activos
export const fetchAllActiveServices = async () => {
  const response = await fetch(`${API_URL}/services`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "No se pudieron obtener los servicios activos.")
    );
  }

  return data;
};

// Marcar un turno como completado
export const completeAppointmentApi = async (id, token) => {
  const response = await fetch(`${API_URL}/appointments/${id}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "No se pudo marcar la reserva como completada.")
    );
  }

  return data;
};

// Cancelar/Marcar ausente un turno
export const cancelAppointmentApi = async (id, token) => {
  const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "No se pudo cancelar el turno.")
    );
  }

  return data;
};

// Modificar el estado de una reserva (ej: no_show, cancelled, completed)
export const updateAppointmentStatusApi = async (id, status, token) => {
  const response = await fetch(`${API_URL}/appointments/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "No se pudo modificar el estado del turno.")
    );
  }

  return data;
};
