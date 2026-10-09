import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {fetchProfessionalServices,fetchMyProfessionalProfile,} from "../professionalApi";
import "./ProfessionalServices.css";
import ServiceCard from "../../../components/ServiceCard/ServiceCard";

const ProfessionalServices = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const getServices = async () => {
    try {
      setLoading(true);
      setError("");
    
      const professional =
        await fetchMyProfessionalProfile(token);
    
      const data =
        await fetchProfessionalServices(professional.id);
    
      const assignedServices = Array.isArray(data)
        ? data
            .map((item) => item.service)
            .filter(Boolean)
        : [];
    
      setServices(assignedServices);
    } catch (err) {
      console.error("Error al obtener servicios:", err);
      setError(
        "No se pudieron cargar los servicios asignados."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    
    getServices();
  }, [token]);

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
        <div className="professional-services-grid">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
            />
          ))}
        </div>
              )}
    </div>
  );
};

export default ProfessionalServices;
