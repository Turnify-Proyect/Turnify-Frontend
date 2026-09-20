const API_URL = import.meta.env.VITE_API_URL;

const getErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message || fallback;
};

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

export const updateProfessionalApi = async (
  id,
  professionalData,
  token
) => {
  const response = await fetch(
    `${API_URL}/professionals/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(professionalData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudo actualizar el profesional."
      )
    );
  }

  return data;
};

export const deactivateProfessionalApi = async (
  id,
  token
) => {
  const response = await fetch(
    `${API_URL}/professionals/${id}`,
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
        "No se pudo desactivar el profesional."
      )
    );
  }

  return data;
};

export const activateProfessionalApi = async (
  id,
  token
) => {
  const response = await fetch(
    `${API_URL}/professionals/${id}/activate`,
    {
      method: "PUT",
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
        "No se pudo activar el profesional."
      )
    );
  }

  return data;
};

export const fetchProfessionalServices = async (
  professionalId
) => {
  const response = await fetch(
    `${API_URL}/professionals/${professionalId}/services`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudieron obtener los servicios del profesional."
      )
    );
  }

  return data;
};

export const associateServiceApi = async (
  professionalId,
  serviceId,
  token
) => {
  const response = await fetch(
    `${API_URL}/professionals/${professionalId}/services/${serviceId}`,
    {
      method: "POST",
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
        "No se pudo asociar el servicio."
      )
    );
  }

  return data;
};

export const removeServiceApi = async (
  professionalId,
  serviceId,
  token
) => {
  const response = await fetch(
    `${API_URL}/professionals/${professionalId}/services/${serviceId}`,
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
        "No se pudo quitar el servicio."
      )
    );
  }

  return data;
};

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