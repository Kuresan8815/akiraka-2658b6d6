import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[40vh]">
      <div className="max-w-4xl mx-auto text-center space-y-6 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-eco-primary animate-fade-up">
          Track Your Sustainable Journey
          <span className="block text-lg md:text-xl font-normal mt-2 text-gray-600">
            Make informed choices for a better planet
          </span>
        </h1>
      </div>
    </div>
  );
};