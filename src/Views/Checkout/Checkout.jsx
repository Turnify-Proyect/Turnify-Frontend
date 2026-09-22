import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const elementOptions = { style: { base: { fontSize: "16px" } } };
const API_URL = import.meta.env.VITE_API_URL;

function CheckoutForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};

  const {
  orderId = "",
  appointments = [],
  serviceName = "Servicio",
  professionalName = "—",
  date = "",
  time = "",
  totalPrice = 0,
  deposit = 0,
} = booking;

  const [cardHolderName, setCardHolderName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  function formatDate(dateValue) {
  if (!dateValue) return "—";

  return new Date(
    `${dateValue}T00:00:00`
  ).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

    async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  if (!stripe || !elements) return;

  if (!cardHolderName.trim()) {
    setError("Ingresá el nombre del titular.");
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    if (!orderId) {
      throw new Error(
        "No se encontró la orden asociada al pago."
      );
    }

    const response = await fetch(
       `${API_URL}/payments/stripe/create-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "No se pudo iniciar el pago."
      );
    }

    if (!data.clientSecret) {
      throw new Error(
        "No se recibió la información necesaria para procesar el pago."
      );
    }

    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(
              CardNumberElement
            ),
            billing_details: {
              name: cardHolderName,
            },
          },
        }
      );

    //if (stripeError) {
    //  if (
    //    stripeError.type === "validation_error"
    //  ) {
    //    setError(stripeError.message);
    //    return;
    //  }

    //  navigate("/payment/failure", {
    //    state: booking,
    //  });

    //  return;
    //}

    if (stripeError) {
  console.error("❌ ERROR STRIPE:", stripeError);

  setError(
    stripeError.message ||
      "Stripe no pudo procesar el pago."
  );

  return;
}

    navigate(
      paymentIntent.status === "succeeded"
        ? "/payment/success"
        : "/payment/pending",
      {
        state: booking,
      }
    );
  } catch (err) {
    setError(
      err.message ||
        "Ocurrió un error al procesar el pago."
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="checkout-page">
      <header className="checkout-topbar">
        <div className="checkout-brand">
          <div className="checkout-logo-icon">T</div>
          <div>
            <p className="checkout-brand-name">Turnify</p>
            <p className="checkout-brand-subtitle">Pago seguro</p>
          </div>
        </div>

        <div className="checkout-stripe-badge">
          <span>🔒</span> Procesado por Stripe
        </div>
      </header>

      <div className="checkout-content">
        <section className="checkout-form-card">
          <h1 className="checkout-form-title">Datos de pago</h1>
          <p className="checkout-form-subtitle">
            Ingresá los datos de tu tarjeta para confirmar la seña.
          </p>

          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-field">
              <label className="checkout-label" htmlFor="cardNumber">
                Número de tarjeta
              </label>
              <div className="checkout-input">
                <CardNumberElement id="cardNumber" options={elementOptions} />
              </div>
            </div>

            <div className="checkout-field">
              <label className="checkout-label" htmlFor="cardHolderName">
                Nombre del titular
              </label>
              <input
                id="cardHolderName"
                className="checkout-input"
                placeholder="VALENTINA REYES"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
              />
            </div>

            <div className="checkout-row">
              <div className="checkout-field">
                <label className="checkout-label" htmlFor="expiry">
                  Vencimiento
                </label>
                <div className="checkout-input">
                  <CardExpiryElement id="expiry" options={elementOptions} />
                </div>
              </div>

              <div className="checkout-field">
                <label className="checkout-label" htmlFor="cvc">
                  CVC
                </label>
                <div className="checkout-input">
                  <CardCvcElement id="cvc" options={elementOptions} />
                </div>
              </div>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <button
              type="submit"
              className="checkout-pay-button"
              disabled={loading || !stripe}
            >
              🔒{" "}
              {loading
                ? "Procesando..."
                : `Pagar $${deposit.toLocaleString("es-AR")}`}
            </button>

            <button
            type="button"
            className="checkout-cancel-button"
            disabled={loading}
                        onClick={() => navigate("/dashboard")}
                      >
                        Volver a Mis Turnos
            </button>
          </form>

          <div className="checkout-security-row">
            <span>🛡️ Pago 100% seguro</span>
            <span>🔒 SSL encriptado</span>
            <span>✓ Cumple con PCI DSS</span>
          </div>

          <div className="checkout-card-brands">
            <span className="checkout-brand-chip">VISA</span>
            <span className="checkout-brand-chip">Mastercard</span>
            <span className="checkout-brand-chip">AMEX</span>
            <span className="checkout-brand-chip">stripe</span>
          </div>
        </section>

        <aside className="checkout-summary-card">
            <div className="checkout-summary-header">
              <p className="checkout-summary-label">
                RESUMEN DE LA RESERVA
              </p>

              <h2 className="checkout-summary-service">
                {appointments.length > 1
                  ? `${appointments.length} turnos`
                  : appointments[0]?.serviceName || serviceName}
              </h2>
            </div>
                
            <div className="checkout-summary-body">
              {appointments.length > 0 ? (
                <div className="checkout-appointments">
                  {appointments.map((appointment, index) => (
                    <div
                      className="checkout-appointment-item"
                      key={`${appointment.serviceId}-${appointment.professionalId}-${appointment.date}-${appointment.time}-${index}`}
                    >
                      <div className="checkout-appointment-header">
                        <span>Turno {index + 1}</span>
                  
                        <strong>
                          ${Number(
                            appointment.price || 0
                          ).toLocaleString("es-AR")}
                        </strong>
                      </div>
                        
                      <h3 className="checkout-appointment-service">
                        {appointment.serviceName}
                      </h3>
                        
                      <div className="checkout-appointment-details">
                        <p>
                          👤 {appointment.professionalName}
                        </p>
                        
                        <p>
                          📅 {formatDate(appointment.date)}
                        </p>
                        
                        <p>
                          🕒 {appointment.time} hs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="checkout-summary-row">
                    <span>Servicio</span>
                    <strong>{serviceName}</strong>
                  </div>
              
                  <div className="checkout-summary-row">
                    <span>👤 Profesional</span>
                    <strong>{professionalName}</strong>
                  </div>
              
                  <div className="checkout-summary-row">
                    <span>📅 Fecha</span>
                    <strong>{formatDate(date)}</strong>
                  </div>
              
                  <div className="checkout-summary-row">
                    <span>🕒 Hora</span>
                    <strong>{time || "—"}</strong>
                  </div>
                </>
              )}

              <div className="checkout-summary-divider" />
            
              <div className="checkout-summary-row">
                <span>Precio total</span>
            
                <strong>
                  ${Number(totalPrice).toLocaleString("es-AR")}
                </strong>
              </div>
            
              <div className="checkout-summary-row">
                <span>Saldo a pagar en el centro</span>
            
                <strong>
                  $
                  {(
                    Number(totalPrice) - Number(deposit)
                  ).toLocaleString("es-AR")}
                </strong>
              </div>
                
              <div className="checkout-deposit-box">
                <span>Seña a pagar ahora</span>
                
                <strong>
                  ${Number(deposit).toLocaleString("es-AR")}
                </strong>
              </div>
                
              <div className="checkout-warning-box">
                ⚠️ La seña no es reembolsable. Podés
                reprogramar tus turnos hasta 2 veces según las
                condiciones de la reserva.
              </div>
            </div>
                
            <ul className="checkout-info-list">
              <li>
                🔒 Tu información está protegida con
                encriptación de 256 bits.
              </li>
                
              <li>
                📅 Podés reprogramar cada turno hasta 2 veces
                para conservar la seña abonada.
              </li>
                
              <li>
                💬 Soporte disponible vía chat ante cualquier
                inconveniente.
              </li>
            </ul>
          </aside>
      </div>
    </div>
  );
}

function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

export default Checkout;