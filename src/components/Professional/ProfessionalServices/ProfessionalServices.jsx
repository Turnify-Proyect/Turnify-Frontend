import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchProfessionalServices,
  fetchAllActiveServices,
} from "../professionalApi";
import "./ProfessionalServices.css";

const ProfessionalServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const getServices = async () => {
    try {
      setLoading(true);
      setError("");

      const professionalId = user?.professionalId || user?.id;
      let data = [];

      try {
        if (professionalId) {
          data = await fetchProfessionalServices(professionalId);
        }
      } catch (err) {
        console.warn("Falling back to all active services:", err);
      }

      if (!data || data.length === 0) {
        data = await fetchAllActiveServices();
      }

      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener servicios:", err);
      setError("No se pudieron cargar los servicios asignados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getServices();
  }, []);

  const filteredServices = services.filter((srv) => {
    const term = search.toLowerCase().trim();
    return (
      (srv.name || "").toLowerCase().includes(term) ||
      (srv.description || "").toLowerCase().includes(term) ||
      (srv.category?.name || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Mis Servicios Asignados</h1>
        <p>Servicios que estás habilitado para atender en la plataforma.</p>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-filters">
        <div className="admin-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Buscar servicios por nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Cargando servicios...</p>
      ) : filteredServices.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">✦</span>
          <h3>No se encontraron servicios</h3>
          <p>No tenés servicios asignados actualmente.</p>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div className="service-card" key={service.id}>
              {service.imageUrl ? (
                <div className="service-card-image-container">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="service-card-image"
                  />
                </div>
              ) : (
                <div className="service-card-placeholder">✦</div>
              )}

              <div className="service-card-body">
                <div className="service-card-header">
                  <h3>{service.name}</h3>
                  {service.category?.name && (
                    <span className="service-category-badge">
                      {service.category.name}
                    </span>
                  )}
                </div>

                {service.description && (
                  <p className="service-card-description">{service.description}</p>
                )}

                <div className="service-card-footer">
                  <div className="service-info-meta">
                    <span className="meta-item">
                      ⏱ {service.durationMinutes ? `${service.durationMinutes} min` : "-"}
                    </span>
                  </div>
                  <span className="service-price">
                    ${Number(service.price || 0).toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessionalServices;
