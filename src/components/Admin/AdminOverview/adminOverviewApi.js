const API_URL = import.meta.env.VITE_API_URL;

const getErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message || fallback;
};

export const fetchOverviewAppointments = async (token) => {
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

export const fetchOverviewProfessionals = async (token) => {
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

export const fetchOverviewServices = async (token) => {
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
    throw new Error(
      getErrorMessage(
        data,
        "No se pudieron obtener los servicios."
      )
    );
  }

  return data;
};