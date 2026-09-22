import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Header/Navbar";
import { useAuth } from "../../context/AuthContext";
import "./BookingPage.css";

function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRescheduling = location.state?.mode === "reschedule";
  const appointmentId = location.state?.appointmentId;
  const preselectedServiceId = location.state?.serviceId;
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [bookingError, setBookingError] = useState("");
  const [professionalAppointments, setProfessionalAppointments] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const { token } = useAuth();

  const [step, setStep] = useState(
    preselectedServiceId ? 2 : 1
  );

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
  
  
  //  useEffect(() => {
  //  const getAvailabilities = async () => {
  //    if (!selected.professional || !token) {
  //      setAvailabilities([]);
  //      return;
  //    }
  //  
  //    try {
  //      const response = await fetch(
  //        `${API_URL}/availability/professional/${selected.professional}`,
  //        {
  //          headers: {
  //            Authorization: `Bearer ${token}`,
  //          },
  //        }
  //      );
  //    
  //      if (!response.ok) {
  //        throw new Error(
  //          "No se pudo obtener la disponibilidad del profesional"
  //        );
  //      }
  //    
  //      const data = await response.json();
  //    
  //      console.log("Disponibilidades:", data);
  //    
  //      setAvailabilities(data);
  //    } catch (error) {
  //      console.error(error);
  //      setAvailabilities([]);
  //    }
  //  };
//  
  //  getAvailabilities();
  //}, [selected.professional, token])//;

    const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]//;

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return date;
  }).filter((date) => {
    const dayOfWeek = dayNames[date.getDay()]//
    return availabilities.some(
      (availability) =>
        availability.dayOfWeek === dayOfWeek
    );
  });

  useEffect(() => {
  const getProfessionalData = async () => {
    if (!selected.professional || !token) {
      setAvailabilities([]);
      setProfessionalAppointments([]);
      return;
    }

    try {
      const [availabilityResponse, appointmentsResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/availability/professional/${selected.professional}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `${API_URL}/appointments/professional/${selected.professional}`
          ),
        ]);

      if (!availabilityResponse.ok) {
        throw new Error(
          "No se pudo obtener la disponibilidad del profesional"
        );
      }

      if (!appointmentsResponse.ok) {
        throw new Error(
          "No se pudieron obtener los turnos del profesional"
        );
      }

      const availabilityData =
        await availabilityResponse.json();

      const appointmentsData =
        await appointmentsResponse.json();

      console.log("Disponibilidades:", availabilityData);
      console.log(
        "Turnos del profesional:",
        appointmentsData
      );

      setAvailabilities(availabilityData);
      setProfessionalAppointments(appointmentsData);
    } catch (error) {
      console.error(error);
      setAvailabilities([]);
      setProfessionalAppointments([]);
    }
  };

  getProfessionalData();
}, [selected.professional, token]);
      

  const times = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ]; 

  const selectedService = services.find(
  (service) => service.id === selected.service
  );

  const availableTimes =
  selected.date && selectedService
    ? times.filter((time) => {
        const selectedDate = new Date(`${selected.date}T12:00:00`);
        const dayOfWeek = dayNames[selectedDate.getDay()];

        const availability = availabilities.find(
          (item) => item.dayOfWeek === dayOfWeek
        );

        if (!availability) return false;


        const proposedStart = new Date(
          `${selected.date}T${time}:00`
        );

        const proposedEnd = new Date(proposedStart);
        proposedEnd.setMinutes(
          proposedEnd.getMinutes() + selectedService.durationMinutes
        );

        const availabilityEnd = new Date(
          `${selected.date}T${availability.endTime}`
        );

        // El servicio completo debe entrar dentro de la disponibilidad
        if (proposedEnd > availabilityEnd) {
          return false;
        }

        const now = new Date();

        const hasOverlap = professionalAppointments.some(
          (appointment) => {
            // Al reprogramar, no debe bloquearse contra sí mismo
            if (
              isRescheduling &&
              appointment.id === appointmentId
            ) {
              return false;
            }

            const blocksSlot =
              appointment.status === "confirmed" ||
              (appointment.status === "pending" &&
                appointment.expiresAt &&
                new Date(appointment.expiresAt) > now);

            if (!blocksSlot) {
              return false;
            }

            const appointmentStart = new Date(
              appointment.startAt
            );
            const appointmentEnd = new Date(
              appointment.endAt
            );

            return (
              proposedStart < appointmentEnd &&
              proposedEnd > appointmentStart
            );
          }
        );

        return !hasOverlap;
      })
    : [];

  

  const selectedProfessional = professionals.find(
  (item) => item.professionalId === selected.professional
  );

  const currentBookingItem =
  selectedService &&
  selectedProfessional &&
  selected.date &&
  selected.time
    ? {
        serviceId: selected.service,
        serviceName: selectedService.name,
        price: Number(selectedService.price),

        professionalId: selected.professional,
        professionalName:
          selectedProfessional.professional?.user?.name ||
          "Profesional",

        date: selected.date,
        time: selected.time,

        startAt: `${selected.date}T${selected.time}:00`,
      }
    : null;

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
      navigate("/services");
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
  setAvailabilities([]);

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
    setAvailabilities([]);

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
                          💆
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
                            {professional.user?.name
                              ?.split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
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
                      const dateString =
                        date.toISOString().split("T")[0];

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
                    {availableTimes.map((time) => (
                      <button
                        type="button"
                        key={time}
                        className={`bookingTimeButton ${
                          selected.time === time
                            ? "selected"
                            : ""
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
                    ))}
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