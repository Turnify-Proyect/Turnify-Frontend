import "./ServiceCard.css";
import { useNavigate } from "react-router-dom";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const handleViewService = () => {
    //navigate(`/services/${service.serviceId}`);
    navigate(`/services/${service.id}`);
  };

  return (
    <article className="service-card">
      <img
        className="service-card-image"
        src={service.imageUrl}
        alt={service.name}
      />

      <div className="service-card-content">
        <span className="service-card-category">
          {service.category}
        </span>

        <h3>{service.name}</h3>
        

        <div className="service-card-info">
          <span>{service.durationMinutes} min</span>
          <span className="service-card-price">
            ${Number(service.price).toLocaleString("es-AR")}
          </span>
        </div>

        <button
          className="service-card-button"
          type="button"
          onClick={handleViewService}
        >
          Ver servicio
        </button>
      </div>
    </article>
  );
};

export default ServiceCard;