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
  const [showPaymentMessage, setShowPaymentMessage] = useState(false);
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
  
  
    useEffect(() => {
    const getAvailabilities = async () => {
      if (!selected.professional || !token) {
        setAvailabilities([]);
        return;
      }
    
      try {
        const response = await fetch(
          `${API_URL}/availability/professional/${selected.professional}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      
        if (!response.ok) {
          throw new Error(
            "No se pudo obtener la disponibilidad del profesional"
          );
        }
      
        const data = await response.json();
      
        console.log("Disponibilidades:", data);
      
        setAvailabilities(data);
      } catch (error) {
        console.error(error);
        setAvailabilities([]);
      }
    };
  
    getAvailabilities();
  }, [selected.professional, token]);

    const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return date;
  }).filter((date) => {
    const dayOfWeek = dayNames[date.getDay()];

    return availabilities.some(
      (availability) =>
        availability.dayOfWeek === dayOfWeek
    );
  });
      

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

  const selectedProfessional = professionals.find(
  (item) => item.professionalId === selected.professional
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

function handleConfirm(orderCreatedByBackend) {
  console.log("Datos recibidos en handleConfirm:", orderCreatedByBackend);
  setShowPaymentMessage(true);

  // 1. Si viene el objeto real del backend, extrae su order_id (o id). 
  // 2. Si viene vacío o es un evento, usa el UUID que ya guardamos en PostgreSQL para la demo.
  const idDeLaOrden = orderCreatedByBackend?.order_id || 
                      orderCreatedByBackend?.id || 
                      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; 

  // Si el objeto del backend existe, se lo pasamos en el state. Si no, mandamos un objeto simulado.
  const datosNavegacion = orderCreatedByBackend && !orderCreatedByBackend.nativeEvent 
    ? orderCreatedByBackend 
    : {
        orderId: idDeLaOrden,
        serviceName: "Corte de Pelo + Barba",
        professionalName: "Leandro Bock",
        date: "2026-10-25",
        time: "14:30",
        totalPrice: 5000,
        deposit: 1500
      };

  console.log("🚀 NAVEGANDO AL CHECKOUT CON ID:", idDeLaOrden);

  navigate(`/checkout/${idDeLaOrden}`, { 
    state: datosNavegacion
  }); 
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
                  {isRescheduling
                    ? "Confirmá la reprogramación"
                    : "Confirmá tu reserva"}
                </h1>

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
                      {selectedProfessional?.professional?.user?.name || "—"}
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
                    <span>
                      {isRescheduling ? "Seña" : "Seña (30%)"}
                    </span>

                    <strong>
                      {isRescheduling
                        ? "Se mantiene la seña abonada"
                        : `$${deposit.toLocaleString("es-AR")}`}
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
                    {isRescheduling
                      ? "La seña abonada en la reserva original se mantiene y se aplicará al turno reprogramado."
                      : "Se te cobrará una seña del 30% ahora. El resto se abona en el centro."}
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
  >
    Siguiente
  </button>
) : (
  <button 
    type="button" 
    className="bookingPayButton" 
    onClick={() => handleConfirm()}
  >
    Pagar seña
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