import { useEffect, useState } from "react";
import ServiceCard from "../ServiceCard/ServiceCard";
import "./FeaturedServices.css";

const FeaturedServices = () => {
  const [services, setServices] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const getServices = async () => {
      try {
        const response = await fetch(`${API_URL}/services`);
        const data = await response.json();

        const featuredServices = data
          .filter((service) => service.isActive)
          .slice(0, 4);

        setServices(featuredServices);
      } catch (error) {
        console.error("Error al obtener los servicios:", error);
      }
    };

    getServices();
  }, []);

  return (
    <section className="featured-services">
      <div className="featured-services-container">
        <div className="featured-services-header">
          <p>Lo que ofrecemos</p>
          <h2>Servicios Destacados</h2>
        </div>

        <div className="featured-services-grid">
          {services.map((service) => (
            //<ServiceCard key={service.serviceId} service={service} />
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;