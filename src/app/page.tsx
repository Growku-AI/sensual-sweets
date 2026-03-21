import Hero from "@/components/sections/Hero";
import Benefits from "@/components/sections/Benefits";
import Products from "@/components/sections/Products";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <Benefits />
      <Products />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}
