import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { AuthSection } from "@/components/AuthSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <AuthSection />
      <Footer />
    </div>
  );
};

export default Index;