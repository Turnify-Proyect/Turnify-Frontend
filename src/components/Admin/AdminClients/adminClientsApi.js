const API_URL = import.meta.env.VITE_API_URL;

const getErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message || fallback;
};

export const fetchClients = async (
  token,
  page = 1,
  limit = 100
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    role: "client",
  });

  const response = await fetch(
    `${API_URL}/users?${params.toString()}`,
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
        "No se pudieron obtener los clientes."
      )
    );
  }

  return data;
};

export const fetchClientAppointments = async (
  userId,
  token
) => {
  const response = await fetch(
    `${API_URL}/appointments/user/${userId}`,
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
        "No se pudo obtener el historial de reservas."
      )
    );
  }

  return data;
};