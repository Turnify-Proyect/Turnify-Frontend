const API_URL = import.meta.env.VITE_API_URL;

const getErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message || fallback;
};

export const fetchAllServices = async (token) => {
  const response = await fetch(
    `${API_URL}/services/all`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {

  console.log("Detalle del error:", data); // 👈 acá


    throw new Error(
      getErrorMessage(
        data,
        "No se pudieron obtener los servicios."
      )
    );
  }

  return data;
};

export const createServiceApi = async (
  serviceData,
  token
) => {
  const response = await fetch(
    `${API_URL}/services`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudo crear el servicio."
      )
    );
  }

  return data;
};

export const updateServiceApi = async (
  id,
  serviceData,
  token
) => {
  const response = await fetch(
    `${API_URL}/services/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "No se pudo actualizar el servicio."
      )
    );
  }

  return data;
};

export const deactivateServiceApi = async (
  id,
  token
) => {
  const response = await fetch(
    `${API_URL}/services/${id}`,
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
        "No se pudo desactivar el servicio."
      )
    );
  }

  return data;
};

export const reactivateServiceApi = async (
  id,
  token
) => {
  const response = await fetch(
    `${API_URL}/services/${id}/reactivate`,
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
        "No se pudo reactivar el servicio."
      )
    );
  }

  return data;
};