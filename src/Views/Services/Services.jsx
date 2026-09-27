import { useState, useEffect } from "react";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
//import services from "../../data/services";
import "./Services.css";
import Navbar from "../../components/Header/Navbar";

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

   useEffect(() => {
   const getServices = async () => {
     try {
       const response = await fetch(`${API_URL}/services`);

       if (!response.ok) {
         throw new Error("No se pudieron obtener los servicios");
       }

       const data = await response.json();
       setServices(data);
     } catch (error) {
       setError(error.message);
     } finally {
       setLoading(false);
     }
   };

      getServices();
    }, []);

const activeServices = services.filter((service) => service.isActive);

const categories = [
  {
    id: "all",
    name: "Todos",
  },
  ...Array.from(
    new Map(
      activeServices
        .filter((service) => service.category)
        .map((service) => [
          service.category.id,
          service.category,
        ])
    ).values()
  ),
];

const filteredServices =
  selectedCategory === "all"
    ? activeServices
    : activeServices.filter(
        (service) =>
          service.category?.id === selectedCategory
      );

if (loading) {
  return <p>Cargando servicios...</p>;
}

if (error) {
  return <p>{error}</p>;
}

  return (
    <>
     <Navbar />
     <main className="services-page">
       <section className="services-container">

         <div className="services-header">
           <p className="services-label">CATÁLOGO</p>
           <h1>Nuestros Servicios</h1>
         </div>

         <div className="services-filters">
           {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`filter-button ${
                  selectedCategory === category.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedCategory(category.id)
                }
              >
                {category.name}
              </button>
            ))}
         </div>

         <div className="services-grid">
           {filteredServices.map((service) => (
             <ServiceCard key={service.id} service={service} />
           ))}
         </div>

       </section>
     </main>
   );
   </>
)};

export default Services;