const API_URL = import.meta.env.VITE_API_URL;

const getErrorMessage = (
  data,
  fallback
) => {
  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message || fallback;
};

export const fetchAdminStatistics =
  async (
    token,
    from = "",
    to = ""
  ) => {
    const params =
      new URLSearchParams();

    if (from) {
      params.append("from", from);
    }

    if (to) {
      params.append("to", to);
    }

    const query =
      params.toString();

    const response = await fetch(
      `${API_URL}/statistics/admin${
        query ? `?${query}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "No se pudieron obtener las estadísticas."
        )
      );
    }

    return data;
  };