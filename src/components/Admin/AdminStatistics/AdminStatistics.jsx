import {useEffect,useState,} from "react";
import { useAuth } from "../../../context/AuthContext";
import {fetchAdminStatistics,} from "./adminStatisticsApi";
import "./AdminStatistics.css";
import ExcelJS from "exceljs";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatApiDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const getPeriodDates = (period) => {
  const today = new Date();

  const to = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  let from;

  if (period === "7days") {
    from = new Date(to);
    from.setDate(from.getDate() - 6);
  }

  if (period === "30days") {
    from = new Date(to);
    from.setDate(from.getDate() - 29);
  }

  if (period === "month") {
    from = new Date(
      to.getFullYear(),
      to.getMonth(),
      1
    );
  }

  return {
    from: formatApiDate(from),
    to: formatApiDate(to),
  };
};

const convertInputDateToApi = (value) => {
  if (!value) return "";

  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
};

const AdminStatistics = () => {
  const { token } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  const loadStatistics = async (selectedPeriod = period, from = "", to = "") => {
    try {
      setLoading(true);
      setError("");

      let fromDate = from;
      let toDate = to;

      if (selectedPeriod !== "custom") {
        const dates =
          getPeriodDates(selectedPeriod);

        fromDate = dates.from;
        toDate = dates.to;
      }

      const data =
        await fetchAdminStatistics(
          token,
          fromDate,
          toDate
        );

      setStatistics(data);
    } catch (err) {
      setError(
        err.message ||
          "No se pudieron cargar las estadísticas."
      );
    } finally {
      setLoading(false);
    }
};


//-- 
const handlePeriodChange = async (
  selectedPeriod
) => {
  setPeriod(selectedPeriod);

  if (selectedPeriod !== "custom") {
    await loadStatistics(
      selectedPeriod
    );
  }
};

//--

const handleCustomPeriod = async () => {
  if (!customFrom || !customTo) {
    setError(
      "Seleccioná una fecha desde y una fecha hasta."
    );
    return;
  }

  if (customFrom > customTo) {
    setError(
      "La fecha desde no puede ser posterior a la fecha hasta."
    );
    return;
  }

  await loadStatistics(
    "custom",
    convertInputDateToApi(customFrom),
    convertInputDateToApi(customTo)
  );
};

  useEffect(() => {
  if (token) {
    loadStatistics("month");
  }
}, [token]);

  if (loading) {
    return (
      <p>
        Cargando estadísticas...
      </p>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        {error}
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const { summary } = statistics;
  const evolution = statistics.appointmentsEvolution || [];
  const maxEvolutionCount = Math.max(
      ...evolution.map((item) => item.count),
      1
    );
    
  const formatChartDate = (value) => {
    const [year, month, day] =
      value.split("-");
  
    return `${day}/${month}`;
  };

  const appointmentsByStatus = statistics.appointmentsByStatus || {};
    const statusData = [
      {
        key: "pending",
        label: "Pendientes",
        count:
          appointmentsByStatus.pending || 0,
      },
      {
        key: "confirmed",
        label: "Confirmados",
        count:
          appointmentsByStatus.confirmed || 0,
      },
      {
        key: "completed",
        label: "Completados",
        count:
          appointmentsByStatus.completed || 0,
      },
      {
        key: "cancelled",
        label: "Cancelados",
        count:
          appointmentsByStatus.cancelled || 0,
      },
      {
        key: "expired",
        label: "Expirados",
        count:
          appointmentsByStatus.expired || 0,
      },
    ];

    const totalStatusAppointments =
      statusData.reduce(
        (total, item) =>
          total + item.count,
        0
      );

    const topServices = statistics.topServices || [];
    const topProfessionals = statistics.topProfessionals || [];

    const maxServiceAppointments = Math.max(
      ...topServices.map(
        (item) => item.appointments
      ),
      1
    );

    const maxProfessionalAppointments =
      Math.max(
        ...topProfessionals.map(
          (item) => item.appointments
        ),
        1
      );

    const demandByWeekday = statistics.demandByWeekday || [];
    const maxWeekdayAppointments =
      Math.max(
        ...demandByWeekday.map(
          (item) => item.appointments
        ),
        1
      );


//===================================
//Exportar en excel

const handleExportExcel = async () => {
  if (!statistics) return;

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Turnify";
  workbook.created = new Date();

  const periodFrom =
    statistics.period?.from || "-";

  const periodTo =
    statistics.period?.to || "-";

  const applySheetHeader = (
    worksheet,
    title,
    columns
  ) => {
    worksheet.mergeCells(
      1,
      1,
      1,
      columns.length
    );

    const titleCell =
      worksheet.getCell(1, 1);

    titleCell.value = title;
    titleCell.font = {
      bold: true,
      size: 16,
    };

    worksheet.mergeCells(
      2,
      1,
      2,
      columns.length
    );

    worksheet.getCell(
      2,
      1
    ).value =
      `Período: ${periodFrom} al ${periodTo}`;

    worksheet.getCell(
      2,
      1
    ).font = {
      italic: true,
    };

    worksheet.addRow([]);

    const headerRow =
      worksheet.addRow(columns);

    headerRow.font = {
      bold: true,
    };

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FFE9EFEA",
        },
      };

      cell.border = {
        bottom: {
          style: "thin",
          color: {
            argb: "FFCCCCCC",
          },
        },
      };
    });

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 4,
      },
    ];
  };

  // =========================
  // RESUMEN
  // =========================

  const summarySheet =
    workbook.addWorksheet("Resumen");

  applySheetHeader(
    summarySheet,
    "Reporte estadístico - Turnify",
    ["Indicador", "Valor"]
  );

  summarySheet.addRows([
    [
      "Turnos totales",
      summary.totalAppointments,
    ],
    [
      "Servicios completados",
      summary.completedAppointments,
    ],
    [
      "Turnos cancelados",
      summary.cancelledAppointments,
    ],
    [
      "Tasa de cancelación",
      summary.cancellationRate / 100,
    ],
    [
      "Señas cobradas",
      Number(summary.depositRevenue || 0),
    ],
    [
      "Servicios realizados",
      Number(
        summary.completedServicesRevenue ||
          0
      ),
    ],
    [
      "Ingresos calculados",
      Number(summary.totalRevenue || 0),
    ],
  ]);

  summarySheet.columns = [
    {
      width: 32,
    },
    {
      width: 22,
    },
  ];

  // Porcentaje
  summarySheet.getCell("B8").numFmt =
    "0.00%";

  // Valores monetarios
  ["B9", "B10", "B11"].forEach(
    (cell) => {
      summarySheet.getCell(
        cell
      ).numFmt =
        '"$" #,##0.00';
    }
  );

  // =========================
  // EVOLUCIÓN
  // =========================

  const evolutionSheet =
    workbook.addWorksheet(
      "Evolución de turnos"
    );

  applySheetHeader(
    evolutionSheet,
    "Evolución de turnos",
    ["Fecha", "Cantidad de turnos"]
  );

  evolution.forEach((item) => {
    const [year, month, day] =
      item.date.split("-");

    evolutionSheet.addRow([
      `${day}/${month}/${year}`,
      item.count,
    ]);
  });

  evolutionSheet.columns = [
    {
      width: 18,
    },
    {
      width: 22,
    },
  ];

  // =========================
  // TURNOS POR ESTADO
  // =========================

  const statusSheet =
    workbook.addWorksheet(
      "Turnos por estado"
    );

  applySheetHeader(
    statusSheet,
    "Turnos por estado",
    ["Estado", "Cantidad", "Porcentaje"]
  );

  statusData.forEach((item) => {
    const percentage =
      totalStatusAppointments === 0
        ? 0
        : item.count /
          totalStatusAppointments;

    statusSheet.addRow([
      item.label,
      item.count,
      percentage,
    ]);
  });

  statusSheet.columns = [
    {
      width: 22,
    },
    {
      width: 16,
    },
    {
      width: 16,
    },
  ];

  for (
    let row = 5;
    row <
    5 + statusData.length;
    row++
  ) {
    statusSheet.getCell(
      `C${row}`
    ).numFmt = "0.00%";
  }

  // =========================
  // SERVICIOS
  // =========================

  const servicesSheet =
    workbook.addWorksheet(
      "Servicios más solicitados"
    );

  applySheetHeader(
    servicesSheet,
    "Servicios más solicitados",
    [
      "Posición",
      "Servicio",
      "Cantidad de turnos",
    ]
  );

  topServices.forEach(
    (service, index) => {
      servicesSheet.addRow([
        index + 1,
        service.name,
        service.appointments,
      ]);
    }
  );

  servicesSheet.columns = [
    {
      width: 12,
    },
    {
      width: 35,
    },
    {
      width: 22,
    },
  ];

  // =========================
  // PROFESIONALES
  // =========================

  const professionalsSheet =
    workbook.addWorksheet(
      "Profesionales"
    );

  applySheetHeader(
    professionalsSheet,
    "Profesionales con más turnos",
    [
      "Posición",
      "Profesional",
      "Cantidad de turnos",
    ]
  );

  topProfessionals.forEach(
    (professional, index) => {
      professionalsSheet.addRow([
        index + 1,
        professional.name,
        professional.appointments,
      ]);
    }
  );

  professionalsSheet.columns = [
    {
      width: 12,
    },
    {
      width: 35,
    },
    {
      width: 22,
    },
  ];

  // =========================
  // DEMANDA SEMANAL
  // =========================

  const demandSheet =
    workbook.addWorksheet(
      "Demanda semanal"
    );

  applySheetHeader(
    demandSheet,
    "Demanda por día de la semana",
    [
      "Día",
      "Cantidad de turnos",
    ]
  );

  demandByWeekday.forEach((day) => {
    demandSheet.addRow([
      day.label,
      day.appointments,
    ]);
  });

  demandSheet.columns = [
    {
      width: 20,
    },
    {
      width: 22,
    },
  ];

  // =========================
  // DESCARGA
  // =========================

  const buffer =
    await workbook.xlsx.writeBuffer();

  const blob = new Blob(
    [buffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  const fileFrom =
    periodFrom.replaceAll("/", "-");

  const fileTo =
    periodTo.replaceAll("/", "-");

  link.href = url;

  link.download =
    `Turnify_Estadisticas_${fileFrom}_al_${fileTo}.xlsx`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};


  return (
    <section className="admin-statistics">
      <div className="admin-page-header statistics-page-header">
        <div className="statistics-page-title">
        
          <h1>
            Reportes y estadísticas
          </h1>

          <p>
            Analizá el rendimiento y
            la actividad del centro de
            estética.
          </p>

        </div>

        <button type="button" className="statistics-export-button" onClick={handleExportExcel}>
              ↓ Exportar Excel
        </button>
      </div>
      
        

      <div className="statistics-filters">
        <span className="statistics-filter-label">
          Período
        </span>
      <div className="statistics-period-buttons">
        <button
          type="button"
          className={
            period === "7days"
              ? "active"
              : ""
          }
          onClick={() =>
            handlePeriodChange("7days")
          }
        >
          Últimos 7 días
        </button>
        
        <button
          type="button"
          className={
            period === "30days"
              ? "active"
              : ""
          }
          onClick={() =>
            handlePeriodChange("30days")
          }
        >
          Últimos 30 días
        </button>
        
        <button
          type="button"
          className={
            period === "month"
              ? "active"
              : ""
          }
          onClick={() =>
            handlePeriodChange("month")
          }
        >
          Este mes
        </button>
        
        <button
          type="button"
          className={
            period === "custom"
              ? "active"
              : ""
          }
          onClick={() =>
            setPeriod("custom")
          }
        >
          Personalizado
        </button>
      </div>
        
      {period === "custom" && (
        <div className="statistics-custom-range">
          <label>
            Desde
            <input
              type="date"
              value={customFrom}
              onChange={(e) =>
                setCustomFrom(
                  e.target.value
                )
              }
            />
          </label>
            
          <label>
            Hasta
            <input
              type="date"
              value={customTo}
              onChange={(e) =>
                setCustomTo(
                  e.target.value
                )
              }
            />
          </label>
            
          <button
              type="button"
              className="statistics-apply-button"
              onClick={handleCustomPeriod}
            >
              Aplicar
            </button>
        </div>
      )}
    </div>

    <div className="statistics-tabs">
      <button
        type="button"
        className={`statistics-tab-button ${
          activeTab === "summary"
            ? "active"
            : ""
        }`}
        onClick={() =>
          setActiveTab("summary")
        }
      >
        Resumen
      </button>

      <button
        type="button"
        className={`statistics-tab-button ${
          activeTab === "charts"
            ? "active"
            : ""
        }`}
        onClick={() =>
          setActiveTab("charts")
        }
      >
        Gráficos
      </button>
    </div>

    {activeTab === "summary" && (
    <>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <span className="admin-stat-value">
              {
                summary.totalAppointments
              }
            </span>

            <p>Turnos totales</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <span className="admin-stat-value">
              {
                summary.completedAppointments
              }
            </span>

            <p>
              Servicios completados
            </p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <span className="admin-stat-value">
              {
                summary.cancellationRate
              }
              %
            </span>

            <p>
              Tasa de cancelación
            </p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <span className="admin-stat-value">
              {formatMoney(
                summary.totalRevenue
              )}
            </span>

            <p>
              Ingresos calculados
            </p>
            <span className="admin-stat-note">
              Incluye señas cobradas por Stripe y servicios completados, sin duplicar importes.
            </span>
          </div>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <span className="admin-stat-value">
              {formatMoney(
                summary.depositRevenue
              )}
            </span>

            <p>Señas cobradas</p>
            <span className="admin-stat-note">
              Se consideran únicamente pagos registrados mediante Stripe.
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <span className="admin-stat-value">
              {formatMoney(
                summary.completedServicesRevenue
              )}
            </span>

            <p>
              Servicios realizados
            </p>
            <span className="admin-stat-note">
              Se considera el valor total de los turnos marcados como completados.
            </span>
          </div>
        </div>
      </div>

       </>
        )}

{activeTab === "charts" && (
    <div className="statistics-charts-layout">
        {/* Evolución de turnos */}
        <div className="statistics-card statistics-evolution-card">
          <div className="statistics-card-header">
            <div>
              <h2>Evolución de turnos</h2>

              <p>
                Cantidad de turnos programados por día
                dentro del período seleccionado.
              </p>
            </div>
          </div>

          {evolution.length === 0 ? (
            <div className="statistics-empty">
              No hay turnos registrados en este período.
            </div>
          ) : (
            <div className="statistics-chart-scroll">
              <div
                className="statistics-bar-chart"
                style={{
                  minWidth: `${Math.max(
                    evolution.length * 48,
                    500
                  )}px`,
                }}
              >
                {evolution.map((item) => {
                  const height =
                    (item.count /
                      maxEvolutionCount) *
                    100;
                    
                  return (
                    <div
                      className="statistics-bar-column"
                      key={item.date}
                    >
                      <div className="statistics-bar-area">
                        <span className="statistics-bar-value">
                          {item.count}
                        </span>
                
                        <div
                          className="statistics-bar"
                          style={{
                              height:
                                item.count === 0
                                  ? "0"
                                  : `${Math.max(
                                      height,
                                      5
                                    )}%`,
                            }}
                          title={`${item.count} turno${
                            item.count === 1 ? "" : "s"
                          }`}
                        />
                      </div>
                      
                      <span className="statistics-bar-label">
                        {formatChartDate(item.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Turnos por estado */}

        <div className="statistics-card statistics-status-card">
  <div className="statistics-card-header">
    <div>
      <h2>Turnos por estado</h2>

      <p>
        Distribución de las reservas según
        su estado dentro del período
        seleccionado.
      </p>
    </div>

    <span className="statistics-card-total">
      {totalStatusAppointments} turnos
    </span>
  </div>

  {totalStatusAppointments === 0 ? (
    <div className="statistics-empty">
      No hay turnos registrados en este período.
    </div>
  ) : (
    <div className="statistics-status-list">
      {statusData.map((item) => {
        const percentage =
          totalStatusAppointments === 0
            ? 0
            : Math.round(
                (item.count /
                  totalStatusAppointments) *
                  100
              );

        return (
          <div
            className="statistics-status-item"
            key={item.key}
          >
            <div className="statistics-status-info">
              <span
                className={`appointment-status ${item.key}`}
              >
                {item.label}
              </span>

              <div className="statistics-status-numbers">
                <strong>
                  {item.count}
                </strong>

                <span>
                  {percentage}%
                </span>
              </div>
            </div>

            <div className="statistics-status-track">
              <div
                className={`statistics-status-progress ${item.key}`}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  )}
        </div>

        {/* Ranking de servicios y profesionales */}

        <div className="statistics-ranking-grid statistics-rankings-section">
            {/* Servicios más solicitados */}
            <div className="statistics-card">
    <div className="statistics-card-header">
      <div>
        <h2>Servicios más solicitados</h2>

        <p>
          Servicios con mayor cantidad de
          reservas en el período seleccionado.
        </p>
      </div>
    </div>

    {topServices.length === 0 ? (
      <div className="statistics-empty">
        No hay servicios registrados en este período.
      </div>
    ) : (
      <div className="statistics-ranking-list">
        {topServices.map(
          (service, index) => {
            const percentage =
              (service.appointments /
                maxServiceAppointments) *
              100;

            return (
              <div
                className="statistics-ranking-item"
                key={service.serviceId}
              >
                <div className="statistics-ranking-row">
                  <div className="statistics-ranking-name">
                    <span className="statistics-ranking-position">
                      {index + 1}
                    </span>

                    <span>
                      {service.name}
                    </span>
                  </div>

                  <strong>
                    {service.appointments}
                  </strong>
                </div>

                <div className="statistics-ranking-track">
                  <div
                    className="statistics-ranking-progress"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    )}
            </div>
            {/* Profesionales con mas reservas */}
            <div className="statistics-card">
    <div className="statistics-card-header">
      <div>
        <h2>Profesionales con más turnos</h2>

        <p>
          Profesionales con mayor cantidad de
          reservas asignadas en el período.
        </p>
      </div>
    </div>

    {topProfessionals.length === 0 ? (
      <div className="statistics-empty">
        No hay profesionales con turnos en este período.
      </div>
    ) : (
      <div className="statistics-ranking-list">
        {topProfessionals.map(
          (professional, index) => {
            const percentage =
              (professional.appointments /
                maxProfessionalAppointments) *
              100;

            return (
              <div
                className="statistics-ranking-item"
                key={
                  professional.professionalId
                }
              >
                <div className="statistics-ranking-row">
                  <div className="statistics-ranking-name">
                    <span className="statistics-ranking-position">
                      {index + 1}
                    </span>

                    <span>
                      {professional.name}
                    </span>
                  </div>

                  <strong>
                    {
                      professional.appointments
                    }
                  </strong>
                </div>

                <div className="statistics-ranking-track">
                  <div
                    className="statistics-ranking-progress"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    )}
            </div>
        </div>

        {/* Demanda por día de la semana */}

        <div className="statistics-card statistics-demand-card">
  <div className="statistics-card-header">
    <div>
      <h2>
        Demanda por día de la semana
      </h2>

      <p>
        Distribución de los turnos según
        el día de atención.
      </p>
    </div>
  </div>

  {demandByWeekday.length === 0 ? (
    <div className="statistics-empty">
      No hay información disponible para este período.
    </div>
  ) : (
    <div className="statistics-weekday-list">
      {demandByWeekday.map((day) => {
        const percentage =
          (day.appointments /
            maxWeekdayAppointments) *
          100;

        return (
          <div
            className="statistics-weekday-item"
            key={day.weekday}
          >
            <div className="statistics-weekday-info">
              <span>
                {day.label}
              </span>

              <strong>
                {day.appointments}
              </strong>
            </div>

            <div className="statistics-weekday-track">
              <div
                className="statistics-weekday-progress"
                style={{
                  width:
                    day.appointments === 0
                      ? "0"
                      : `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  )}
        </div>
</div>
)}
    </section>
  );
};

export default AdminStatistics;