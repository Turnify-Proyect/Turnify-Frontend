
const AdminOverview = () => {
  const stats = [
    {
      label: "Turnos de hoy",
      value: 12,
      icon: "◷",
    },
    {
      label: "Turnos pendientes",
      value: 3,
      icon: "!",
    },
    {
      label: "Profesionales activos",
      value: 8,
      icon: "P",
    },
    {
      label: "Servicios activos",
      value: 14,
      icon: "✦",
    },
  ];

  const todayStatus = [
    { label: "Confirmados", value: 7 },
    { label: "Pendientes", value: 3 },
    { label: "Completados", value: 1 },
    { label: "Cancelados", value: 1 },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      time: "10:00",
      client: "Ana García",
      service: "Masaje relajante",
      professional: "Sofía Ramírez",
      status: "Confirmado",
    },
    {
      id: 2,
      time: "10:30",
      client: "Lucía Méndez",
      service: "Limpieza facial",
      professional: "Lucía Gómez",
      status: "Pendiente",
    },
    {
      id: 3,
      time: "11:00",
      client: "Camila Torres",
      service: "Manicura Spa",
      professional: "Martina López",
      status: "Confirmado",
    },
  ];

  return (
    <section className="admin-overview">

      <div className="admin-page-header">
        <div>
          <h1>Panel de administración</h1>
          <p>Resumen de la actividad de Turnify</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <div className="admin-stat-card" key={stat.label}>

            <div className="admin-stat-icon">
              {stat.icon}
            </div>

            <div>
              <span className="admin-stat-value">
                {stat.value}
              </span>

              <p>{stat.label}</p>
            </div>

          </div>
        ))}
      </div>

      <div className="admin-overview-grid">

        <div className="admin-overview-card">
          <h2>Turnos por mes</h2>

          <div className="admin-chart-placeholder">
            <span>Gráfico de reservas</span>
            <small>
              Acá mostraremos la evolución mensual de los turnos.
            </small>
          </div>
        </div>

        <div className="admin-overview-card">

          <h2>Actividad de hoy</h2>

          <div className="admin-status-list">
            {todayStatus.map((status) => (
              <div
                className="admin-status-row"
                key={status.label}
              >
                <span>{status.label}</span>
                <strong>{status.value}</strong>
              </div>
            ))}
          </div>

        </div>

      </div>

      <div className="admin-overview-card admin-upcoming">

        <h2>Próximos turnos</h2>

        <div className="admin-table-wrapper">
          <table className="admin-table">

            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Profesional</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {upcomingAppointments.map((appointment) => (
                <tr key={appointment.id}>

                  <td>{appointment.time}</td>

                  <td>{appointment.client}</td>

                  <td>{appointment.service}</td>

                  <td>{appointment.professional}</td>

                  <td>
                    <span
                      className={`status-badge ${appointment.status.toLowerCase()}`}
                    >
                      {appointment.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

    </section>
  );
};

export default AdminOverview;