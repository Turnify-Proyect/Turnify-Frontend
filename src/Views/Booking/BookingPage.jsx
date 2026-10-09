import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Header/Navbar";
import { useAuth } from "../../context/AuthContext";
import "./BookingPage.css";
import { formatLocalDate } from "../../helpers/formatLocalDate";

function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRescheduling = location.state?.mode === "reschedule";
  const appointmentId = location.state?.appointmentId;
  const preselectedServiceId = location.state?.serviceId;
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [bookingError, setBookingError] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const { token } = useAuth();

  const [step, setStep] = useState(1);

  const stepLabels = [
    "Servicio",
    "Profesional",
    "Fecha y Hora",
    "Confirmar",
  ];

  const [selected, setSelected] = useState({
    service: preselectedServiceId || "",
    professional: "",
    date: "",
    time: "",
  });

  const [bookingItems, setBookingItems] = useState([]);

  

    useEffect(() => {
      const getServices = async () => {
        try {
          const response = await fetch(`${API_URL}/services`);
        
          if (!response.ok) {
            throw new Error("No se pudieron obtener los servicios");
          }
        
          const data = await response.json();
        
          setServices(data.filter((service) => service.isActive));
        } catch (error) {
          console.error(error);
        }
      };
    
      getServices();
    }, []);
  
    useEffect(() => {
      const getProfessionals = async () => {
        if (!selected.service) {
          setProfessionals([]);
          return;
        }
      
        try {
          const response = await fetch(
            `${API_URL}/services/${selected.service}/professionals`
          );
        
          if (!response.ok) {
            throw new Error("No se pudieron obtener los profesionales");
          }
        
          const data = await response.json();
          
        
          setProfessionals(data);
        } catch (error) {
          console.error(error);
          setProfessionals([]);
      }
      };
    
      getProfessionals();
    }, [selected.service]);


const days = Array.from({ length: 14 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index + 1);
  return date;
});
  

useEffect(() => {
  const getAvailableTimes = async () => {
    if (
      !selected.professional ||
      !selected.service ||
      !selected.date ||
      !token
    ) {
      setAvailableTimes([]);
      return;
    }
    
    setAvailableTimes([]);
    setLoadingTimes(true);

    try {
      const params = new URLSearchParams({
        professionalId: selected.professional,
        serviceId: selected.service,
        date: selected.date,
      });

      if (isRescheduling && appointmentId) {
        params.append("appointmentId", appointmentId);
      }

      const response = await fetch(
        `${API_URL}/appointments/available-slots?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudieron obtener los horarios disponibles"
        );
      }

      const data = await response.json();

      setAvailableTimes(data.slots || []);
    } catch (error) {
      console.error(error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  getAvailableTimes();
}, [
  selected.professional,
  selected.service,
  selected.date,
  token,
  isRescheduling,
  appointmentId,
]);

  const selectedService = services.find(
  (service) => service.id === selected.service
  );

  const selectedProfessional = professionals.find(
  (item) => item.professionalId === selected.professional
  );

  const currentBookingItem =
  selectedService &&
  selected.professional &&
  selected.date &&
  selected.time
    ? {
        serviceId: selected.service,
        serviceName: selectedService.name,
        price: Number(selectedService.price),
        durationMinutes: selectedService.durationMinutes,

        professionalId: selected.professional,
        professionalName:
          selectedProfessional?.professional?.user?.name ||
          "Profesional",

        date: selected.date,
        time: selected.time,

        startAt: `${selected.date}T${selected.time}:00-03:00`,
      }
    : null;

const displayAvailableTimes = availableTimes.filter((time) => {
  if (!selectedService || !selected.date) {
    return false;
  }

  const candidateStart = new Date(
    `${selected.date}T${time}:00-03:00`
  );

  const candidateEnd = new Date(
    candidateStart.getTime() +
      selectedService.durationMinutes * 60 * 1000
  );

  return !bookingItems.some((item) => {
    const itemStart = new Date(item.startAt);

    const itemEnd = new Date(
      itemStart.getTime() +
        item.durationMinutes * 60 * 1000
    );

    return (
      candidateStart < itemEnd &&
      candidateEnd > itemStart
    );
  });
});

const allBookingItems = [
  ...bookingItems,
  ...(currentBookingItem ? [currentBookingItem] : []),
];

console.log("bookingItems:", bookingItems);
console.log("currentBookingItem:", currentBookingItem);
console.log("allBookingItems:", allBookingItems);
console.log("selected:", selected);

const bookingTotal = allBookingItems.reduce(
  (total, item) => total + item.price,
  0
);

const deposit =
  Math.round(bookingTotal * 0.3 * 100) / 100;

  function handleNext() {
    if (step < 4) {
      setStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (step === 1) {
      navigate("/dashboard");
      return;
    }

    setStep((prev) => prev - 1);
  }

  function handleAddAnotherAppointment() {
  if (!currentBookingItem) {
    return;
  }

  setBookingError("");

  setBookingItems((prev) => [
    ...prev,
    currentBookingItem,
  ]);

  setSelected({
    service: "",
    professional: "",
    date: "",
    time: "",
  });

  setProfessionals([]);

  setStep(1);
}

function handleRemoveBookingItem(index) {
  setBookingError("");

  const remainingItems = allBookingItems.filter(
    (_, itemIndex) => itemIndex !== index
  );

  // Si eliminó todos los turnos, recién ahí volvemos al inicio
  if (remainingItems.length === 0) {
    setBookingItems([]);

    setSelected({
      service: "",
      professional: "",
      date: "",
      time: "",
    });

    setProfessionals([]);

    setStep(1);
    return;
  }

  // Tomamos el último turno restante como turno actual
  const lastItem =
    remainingItems[remainingItems.length - 1];

  // Los anteriores quedan guardados
  setBookingItems(remainingItems.slice(0, -1));

  // El último queda como turno actual
  setSelected({
    service: lastItem.serviceId,
    professional: lastItem.professionalId,
    date: lastItem.date,
    time: lastItem.time,
  });

  setStep(4);
}

async function handleConfirm() {
  if (!currentBookingItem) {
    return;
  }

  // REPROGRAMACIÓN
  if (isRescheduling) {
    try {
      const response = await fetch(
        `${API_URL}/appointments/${appointmentId}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            professionalId: selected.professional,
            serviceId: selected.service,
            startAt: currentBookingItem.startAt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "No se pudo reprogramar el turno"
        );
      }

      navigate("/dashboard");
    } catch (error) {
    console.error(error);

    setBookingError(
      error.message ||
        "No pudimos reprogramar el turno. Intentá nuevamente."
    );
}

    return;
  }

  try {
    setBookingError("");

    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        appointments: allBookingItems.map((item) => ({
          professionalId: item.professionalId,
          serviceId: item.serviceId,
          startAt: item.startAt,
        })),
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(
        order.message || "No se pudo crear la reserva"
      );
    }

    const totalPrice = Number(
      order.totalPrice ?? bookingTotal
    );

    const orderDeposit =
      Math.round(totalPrice * 0.3 * 100) / 100;

    navigate(`/checkout/${order.orderId}`, {
      state: {
        orderId: order.orderId,

        appointments: allBookingItems,

        totalPrice,
        deposit: orderDeposit,

        // Compatibilidad temporal con Checkout actual
        serviceName:
          allBookingItems.length === 1
            ? allBookingItems[0].serviceName
            : `${allBookingItems.length} servicios`,

        professionalName:
          allBookingItems.length === 1
            ? allBookingItems[0].professionalName
            : "Varios profesionales",

        date:
          allBookingItems.length === 1
            ? allBookingItems[0].date
            : "",

        time:
          allBookingItems.length === 1
            ? allBookingItems[0].time
            : "",
      },
    });
  } catch (error) {
  console.error("Error creando la orden:", error);

  setBookingError(
    error.message ||
      "No se pudo generar la reserva. Intentá nuevamente."
  );
}}

const canContinue =
  (step === 1 && !!selected.service) ||
  (step === 2 && !!selected.professional) ||
  (step === 3 &&
    !!selected.date &&
    !!selected.time &&
    !loadingTimes);

  return (
    <>
      <Navbar />

      <main className="bookingPage">
        <div className="bookingContainer">

          <div className="bookingSteps">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;

              return (
                <div className="bookingStepItem" key={label}>
                  <div className="bookingStepContent">
                    <div
                      className={`bookingStepCircle ${
                        stepNumber <= step ? "active" : ""
                      }`}
                    >
                      {stepNumber < step ? "✓" : stepNumber}
                    </div>

                    <span
                      className={`bookingStepLabel ${
                        stepNumber === step ? "active" : ""
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  {index < stepLabels.length - 1 && (
                    <div
                      className={`bookingStepLine ${
                        stepNumber < step ? "active" : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <section className="bookingCard">

            {step === 1 && (
              <div>
                <h1 className="bookingTitle">
                  ¿Qué servicio deseas?
                </h1>

                <div className="bookingServiceGrid">
                  {services.map((service) => (
                    <button
                      type="button"
                      key={service.id}
                      className={`bookingOptionCard ${
                        selected.service === service.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelected((prev) => ({
                          ...prev,
                          service: service.id,
                          professional: "",
                          date: "",
                          time: "",
                        }))
                      }
                    >
                        <span className="bookingServiceIcon">
                          {service.category?.icon || "✨"}
                        </span>

                        <span className="bookingOptionName">
                          {service.name}
                        </span>

                        <span className="bookingOptionInfo">
                          {service.durationMinutes} min · $
                          {Number(service.price).toLocaleString("es-AR")}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="bookingTitle">
                  Elegí tu profesional
                </h1>

                <div className="bookingProfessionalGrid">
                  {professionals.map((item) => {
                      const professional = item.professional;

                      return (
                        <button
                          type="button"
                          key={item.professionalId}
                          className={`bookingProfessionalCard ${
                            selected.professional === item.professionalId
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setSelected((prev) => ({
                              ...prev,
                              professional: item.professionalId,
                              date: "",
                              time: "",
                            }))
                          }
                        >
                          <div className="bookingProfessionalAvatar">
                            {professional.user?.imgUrl ? (
                              <img
                                src={professional.user.imgUrl}
                                alt={professional.user?.name || "Profesional"}
                                className="bookingProfessionalAvatarImage"
                              />
                            ) : (
                              professional.user?.name
                                ?.split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            )}
                          </div>
                            
                          <div>
                            <p className="bookingProfessionalName">
                              {professional.user?.name}
                            </p>
                            
                            <p className="bookingProfessionalSpecialty">
                              {professional.specialty}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="bookingTitle">
                  Seleccioná fecha y hora
                </h1>

                <div className="bookingSection">
                  <p className="bookingSectionLabel">
                    Fecha
                  </p>

                  <div className="bookingDates">
                    {days.map((date) => {
                      const dateString = formatLocalDate(date);

                      const dayName = date.toLocaleDateString(
                        "es-AR",
                        {
                          weekday: "short",
                        }
                      );

                      return (
                        <button
                          type="button"
                          key={dateString}
                          className={`bookingDateButton ${
                            selected.date === dateString
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setSelected((prev) => ({
                              ...prev,
                              date: dateString,
                              time: "",
                            }))
                          }
                        >
                          <span>{dayName}</span>
                          <strong>{date.getDate()}</strong>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bookingSection">
                  <p className="bookingSectionLabel">
                    Horario
                  </p>

                  <div className="bookingTimes">
                    {loadingTimes ? (
                      <p className="bookingAvailabilityMessage">
                        Buscando horarios disponibles...
                      </p>
                    ) : displayAvailableTimes.length > 0 ? (
                      displayAvailableTimes.map((time) => (
                        <button
                          type="button"
                          key={time}
                          className={`bookingTimeButton ${
                            selected.time === time ? "selected" : ""
                          }`}
                          onClick={() =>
                            setSelected((prev) => ({
                              ...prev,
                              time,
                            }))
                          }
                        >
                          {time}
                        </button>
                      ))
                    ) : selected.date ? (
                      <p className="bookingAvailabilityMessage">
                        No quedan horarios disponibles para esta fecha.
                      </p>
                    ) : (
                      <p className="bookingAvailabilityMessage">
                        Seleccioná una fecha para ver los horarios disponibles.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
  <div>
    <h1 className="bookingTitle">
      {isRescheduling
        ? "Confirmá la reprogramación"
        : "Confirmá tu reserva"}
    </h1>

    {isRescheduling ? (
      <>
        <div className="bookingSummary">
          <div className="bookingSummaryRow">
            <span>Servicio</span>
            <strong>
              {selectedService?.name || "—"}
            </strong>
          </div>

          <div className="bookingSummaryRow">
            <span>Profesional</span>
            <strong>
              {selectedProfessional?.professional?.user
                ?.name || "—"}
            </strong>
          </div>

          <div className="bookingSummaryRow">
            <span>Fecha</span>
            <strong>
              {selected.date
                ? new Date(
                    `${selected.date}T00:00:00`
                  ).toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "—"}
            </strong>
          </div>

          <div className="bookingSummaryRow">
            <span>Hora</span>
            <strong>{selected.time || "—"}</strong>
          </div>

          <div className="bookingSummaryRow">
            <span>Seña</span>
            <strong>
              Se mantiene la seña abonada
            </strong>
          </div>
        </div>

        <div className="bookingInfo">
          <span>ℹ️</span>

          <p>
            La seña abonada en la reserva original
            se mantiene y se aplicará al turno
            reprogramado.
          </p>
        </div>
      </>
    ) : (
      <>
        <div className="bookingAppointmentsSummary">
          {allBookingItems.map((item, index) => (
            <div
              className="bookingAppointmentItem"
              key={`${item.serviceId}-${item.professionalId}-${item.date}-${item.time}-${index}`}
            >
              <div className="bookingAppointmentHeader">
                <span className="bookingAppointmentNumber">
                  Turno {index + 1}
                </span>

                <button
                  type="button"
                  className="bookingRemoveAppointment"
                  onClick={() => handleRemoveBookingItem(index)}
                >
                  Eliminar
                </button>
                
              </div>

              <div className="bookingAppointmentContent">
                <div>
                  <strong className="bookingAppointmentService">
                    {item.serviceName}
                  </strong>

                  <p>
                    con {item.professionalName}
                  </p>

                  <p>
                    {new Date(
                      `${item.date}T00:00:00`
                    ).toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    · {item.time} hs
                  </p>
                </div>

                <strong className="bookingAppointmentPrice">
                  $
                  {item.price.toLocaleString(
                    "es-AR"
                  )}
                </strong>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="bookingAddAppointmentButton"
          onClick={handleAddAnotherAppointment}
        >
          + Agregar otro turno
        </button>

        <div className="bookingSummary bookingOrderTotals">
          <div className="bookingSummaryRow">
            <span>Total</span>

            <strong>
              $
              {bookingTotal.toLocaleString("es-AR")}
            </strong>
          </div>

          <div className="bookingSummaryRow">
            <span>Seña (30%)</span>

            <strong>
              ${deposit.toLocaleString("es-AR")}
            </strong>
          </div>

          <div className="bookingSummaryRow">
            <span>Saldo a abonar en el centro</span>

            <strong>
              $
              {(bookingTotal - deposit).toLocaleString(
                "es-AR"
              )}
            </strong>
          </div>
        </div>

        <div className="bookingInfo">
          <span>ℹ️</span>

          <p>
            La seña corresponde al 30% del total de
            los turnos seleccionados. El saldo restante
            se abona en el centro.
          </p>
        </div>
      </>
    )}
  </div>
)}

    {step === 4 && bookingError && (
      <div className="bookingErrorMessage">
        <span className="bookingErrorIcon">!</span>
    
        <div>
          <strong>No pudimos generar la reserva</strong>
          <p>{bookingError}</p>
        </div>
      </div>
    )}

            <div className="bookingNavigation">
              <button
                type="button"
                className="bookingBackButton"
                onClick={handleBack}
              >
                {step === 1 ? "Cancelar" : "← Atrás"}
              </button>

              {step < 4 ? (
  <button
    type="button"
    className="bookingNextButton"
    onClick={handleNext}
    disabled={!canContinue}
  >
    Siguiente
  </button>
) : (
  <button
    type="button"
    className="bookingPayButton"
    onClick={handleConfirm}
  >
    {isRescheduling
      ? "Confirmar reprogramación"
      : `Pagar seña${
          allBookingItems.length > 1
            ? ` (${allBookingItems.length} turnos)`
            : ""
        }`}
  </button>

)}
            </div>

          </section>
        </div>
      </main>
    </>
  );
}

export default BookingPage;