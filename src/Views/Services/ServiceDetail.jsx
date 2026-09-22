import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Header/Navbar";
import "./ServiceDetail.css";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const getService = async () => {
      try {
        const response = await fetch(`${API_URL}/services/${id}`);

        if (!response.ok) {
          throw new Error("No se pudo obtener el servicio");
        }

        const data = await response.json();
        setService(data);
      } catch (error) {
        console.error(error);
        setError("No pudimos encontrar el servicio.");
      } finally {
        setLoading(false);
      }
    };

    getService();
  }, [API_URL, id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
          <p>Cargando servicio...</p>
        </main>
      </>
    );
  }

  if (error || !service) {
    return (
      <>
        <Navbar />
        <main>
          <p>{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="service-detail">
        <button
          type="button"
          className="service-detail-back"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <div className="service-detail-card">
          <div className="service-detail-image-container">
            <img
              src={service.imageUrl}
              alt={service.name}
              className="service-detail-image"
            />
          </div>

          <div className="service-detail-content">
            <span className="service-detail-category">
              {service.category}
            </span>

            <h1>{service.name}</h1>

            <p className="service-detail-description">
              {service.description}
            </p>

            <div className="service-detail-info">
              <div>
                <span>Duración</span>
                <strong>{service.durationMinutes} min</strong>
              </div>

              <div>
                <span>Precio</span>
                <strong>
                  ${Number(service.price).toLocaleString("es-AR")}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="service-detail-book"
              onClick={() =>
                  navigate("/booking", {
                    state: {
                      serviceId: service.id,
                    },
                  })
                }
            >
              Reservar turno
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default ServiceDetail;