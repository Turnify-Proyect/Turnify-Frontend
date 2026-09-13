import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Header/Navbar";
import "./BookingPage.css";

function BookingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [selected, setSelected] = useState({
    service: "",
    professional: "",
    date: "",
    time: "",
  });

  const [showPaymentMessage, setShowPaymentMessage] = useState(false);

  const services = [
    {
      name: "Masaje Relajante",
      duration: "60 min",
      price: 4500,
      icon: "💆",
    },
    {
      name: "Limpieza Facial",
      duration: "45 min",
      price: 3200,
      icon: "✨",
    },
    {
      name: "Manicura Spa",
      duration: "50 min",
      price: 2800,
      icon: "💅",
    },
    {
      name: "Corte & Estilo",
      duration: "40 min",
      price: 2200,
      icon: "✂️",
    },
  ];

  const professionals = [
    {
      name: "Sofía Ramírez",
      specialty: "Masajista",
      initials: "SR",
    },
    {
      name: "Lucía Gómez",
      specialty: "Esteticista",
      initials: "LG",
    },
    {
      name: "Martina López",
      specialty: "Nail Artist",
      initials: "ML",
    },
    {
      name: "Carla Vega",
      specialty: "Estilista",
      initials: "CV",
    },
  ];

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

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return date;
  });

  const stepLabels = [
    "Servicio",
    "Profesional",
    "Fecha y Hora",
    "Confirmar",
  ];

  const selectedService = services.find(
    (service) => service.name === selected.service
  );

  const deposit = selectedService
    ? Math.round(selectedService.price * 0.3)
    : 0;

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

 function handleConfirm() {
  setShowPaymentMessage(true);
}

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
                      key={service.name}
                      className={`bookingOptionCard ${
                        selected.service === service.name
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelected((prev) => ({
                          ...prev,
                          service: service.name,
                          professional: "",
                          date: "",
                          time: "",
                        }))
                      }
                    >
                      <span className="bookingServiceIcon">
                        {service.icon}
                      </span>

                      <span className="bookingOptionName">
                        {service.name}
                      </span>

                      <span className="bookingOptionInfo">
                        {service.duration} · $
                        {service.price.toLocaleString("es-AR")}
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
                  {professionals.map((professional) => (
                    <button
                      type="button"
                      key={professional.name}
                      className={`bookingProfessionalCard ${
                        selected.professional === professional.name
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelected((prev) => ({
                          ...prev,
                          professional: professional.name,
                          date: "",
                          time: "",
                        }))
                      }
                    >
                      <div className="bookingProfessionalAvatar">
                        {professional.initials}
                      </div>

                      <div>
                        <p className="bookingProfessionalName">
                          {professional.name}
                        </p>

                        <p className="bookingProfessionalSpecialty">
                          {professional.specialty}
                        </p>
                      </div>
                    </button>
                  ))}
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
                    {times.map((time) => (
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
                  Confirmá tu reserva
                </h1>

                <div className="bookingSummary">

                  <div className="bookingSummaryRow">
                    <span>Servicio</span>
                    <strong>
                      {selected.service || "—"}
                    </strong>
                  </div>

                  <div className="bookingSummaryRow">
                    <span>Profesional</span>
                    <strong>
                      {selected.professional || "—"}
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
                    <strong>
                      {selected.time || "—"}
                    </strong>
                  </div>

                  <div className="bookingSummaryRow">
                    <span>Seña (30%)</span>
                    <strong>
                      ${deposit.toLocaleString("es-AR")}
                    </strong>
                  </div>

                  <div className="bookingSummaryRow">
                    <span>Total</span>
                    <strong>
                      $
                      {selectedService?.price.toLocaleString(
                        "es-AR"
                      ) || 0}
                    </strong>
                  </div>
                </div>

                <div className="bookingInfo">
                  <span>ℹ️</span>

                  <p>
                    Se te cobrará una seña del 30% ahora.
                    El resto se abona en el centro.
                  </p>
                </div>
              </div>
            )}

            {showPaymentMessage && (
                <div className="bookingPendingMessage">
                    🚧 La funcionalidad de pago de seña aún no está implementada.
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
                  disabled={
                    (step === 1 && !selected.service) ||
                    (step === 2 &&
                      !selected.professional) ||
                    (step === 3 &&
                      (!selected.date ||
                        !selected.time))
                  }
                >
                  Continuar →
                </button>
              ) : (
                <button
                  type="button"
                  className="bookingPayButton"
                  onClick={handleConfirm}
                >
                  💳 Pagar Seña
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