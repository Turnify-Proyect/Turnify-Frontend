import Navbar from "../../components/Header/Navbar";
import Hero from "../../components/Home/Hero";
import FeaturedServices from "../../components/Home/FeaturedServices";
import HowItWorks from "../../components/Home/HowItWorks";
import Testimonials from "../../components/Home/Testimonials";
import CtaBanner from "../../components/Home/CtaBanner";
import Footer from "../../components/Footer/Footer";

const Home = () => {


  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <FeaturedServices />
        <HowItWorks />
        <Testimonials />
        <CtaBanner />
        

      </main>
      <Footer />
    </>
  );
};

export default Home;