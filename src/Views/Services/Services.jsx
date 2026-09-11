import { useState, useEffect } from "react";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
//import services from "../../data/services";
import "./Services.css";


const categories = ["Todos", "Masajes", "Faciales", "Uñas", "Cabello", "Spa"];

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

   useEffect(() => {
   const getServices = async () => {
     try {
       const response = await fetch("http://localhost:3000/services");

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

  const filteredServices =
  selectedCategory === "Todos"
    ? services
    : services.filter(
        (service) => service.category === selectedCategory
      );

if (loading) {
  return <p>Cargando servicios...</p>;
}

if (error) {
  return <p>{error}</p>;
}

  return (
     <main className="services-page">
       <section className="services-container">

         <div className="services-header">
           <p className="services-label">CATÁLOGO</p>
           <h1>Nuestros Servicios</h1>
         </div>

         <div className="services-filters">
           {categories.map((category) => (
             <button
               key={category}
               type="button"
               className={`filter-button ${
                 selectedCategory === category ? "active" : ""
               }`}
               onClick={() => setSelectedCategory(category)}
             >
               {category}
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
};

export default Services;