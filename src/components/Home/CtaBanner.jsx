import "./CtaBanner.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CtaBanner = () => {

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  function handleBooking() {
    if (isAuthenticated) {
      navigate("/booking");
    } else {
      navigate("/login", {
        state: { from: "/booking" },
      });
    }
  }

  return (
    <section className="cta-banner">
      <div className="cta-banner-container">
        <h2>¿Lista para tu momento de bienestar?</h2>

        <p>
          Reservá ahora y obtené un descuento en tu primera cita.
        </p>

        <button onClick={handleBooking} className="cta-banner-button">
          Comenzar ahora
        </button>
      </div>
    </section>
  );
};

export default CtaBanner;