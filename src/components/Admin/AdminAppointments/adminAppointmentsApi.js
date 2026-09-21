const API_URL = import.meta.env.VITE_API_URL;

const getErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message || fallback;
};

// Obtener todos los turnos
export const fetchAppointments = async (token) => {
  const response = await fetch(`${API_URL}/appointments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudieron obtener las reservas."
      )
    );
  }

  return data;
};

// Obtener servicios activos
export const fetchServices = async () => {
  const response = await fetch(`${API_URL}/services`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudieron obtener los servicios."
      )
    );
  }

  return data;
};

// Obtener profesionales que realizan un servicio
export const fetchProfessionalsByService = async (
  serviceId
) => {
  const response = await fetch(
    `${API_URL}/services/${serviceId}/professionals`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudieron obtener los profesionales."
      )
    );
  }

  return data;
};

// Obtener disponibilidad del profesional
export const fetchProfessionalAvailability = async (
  professionalId,
  token
) => {
  const response = await fetch(
    `${API_URL}/availability/professional/${professionalId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudo obtener la disponibilidad."
      )
    );
  }

  return data;
};

// Cancelar turno
export const cancelAppointmentApi = async (id, token) => {
  const response = await fetch(
    `${API_URL}/appointments/${id}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudo cancelar la reserva."
      )
    );
  }

  return data;
};

// Cambiar estado
export const updateAppointmentStatusApi = async (
  id,
  status,
  token
) => {
  const response = await fetch(
    `${API_URL}/appointments/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudo modificar el estado."
      )
    );
  }

  return data;
};

// Reprogramar turno
export const rescheduleAppointmentApi = async (
  id,
  appointmentData,
  token
) => {
  const response = await fetch(
    `${API_URL}/appointments/${id}/reschedule`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(appointmentData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudo reprogramar la reserva."
      )
    );
  }

  return data;
};