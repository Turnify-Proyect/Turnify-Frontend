import "./ServiceCard.css";
const ServiceCard = ({ service }) => {
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

        <button className="service-card-button" type="button">
          Reservar
        </button>
      </div>
    </article>
  );
};

export default ServiceCard;