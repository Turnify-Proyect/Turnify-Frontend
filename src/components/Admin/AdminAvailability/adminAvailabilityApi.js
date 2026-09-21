const API_URL = import.meta.env.VITE_API_URL;

const getErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message || fallback;
};

// Profesionales para el selector
export const fetchProfessionals = async (token) => {
  const response = await fetch(
    `${API_URL}/professionals/admin/all`,
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
        "No se pudieron obtener los profesionales."
      )
    );
  }

  return data;
};

// Disponibilidad de un profesional
export const fetchAvailabilityByProfessional = async (
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

// Crear bloque
export const createAvailabilityApi = async (
  professionalId,
  availabilityData,
  token
) => {
  const response = await fetch(
    `${API_URL}/availability/professional/${professionalId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(availabilityData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudo crear la disponibilidad."
      )
    );
  }

  return data;
};

// Editar bloque
export const updateAvailabilityApi = async (
  id,
  availabilityData,
  token
) => {
  const response = await fetch(
    `${API_URL}/availability/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(availabilityData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudo actualizar la disponibilidad."
      )
    );
  }

  return data;
};

// Eliminar bloque
export const deleteAvailabilityApi = async (
  id,
  token
) => {
  const response = await fetch(
    `${API_URL}/availability/${id}`,
    {
      method: "DELETE",
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
        "No se pudo eliminar la disponibilidad."
      )
    );
  }

  return data;
};