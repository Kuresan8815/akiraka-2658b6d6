import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-[25vh] flex items-center justify-center px-4 py-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-up">
          Track Your Product's Environmental Impact
        </h1>
        <p className="text-base md:text-lg text-white/90 mb-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Scan, learn, and make sustainable choices for a better tomorrow
        </p>
      </div>
    </div>
  );
};