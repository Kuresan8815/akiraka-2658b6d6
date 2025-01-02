import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-[40vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-up">
          Track Your Product's Environmental Impact
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Scan, learn, and make sustainable choices for a better tomorrow
        </p>
      </div>
    </div>
  );
};