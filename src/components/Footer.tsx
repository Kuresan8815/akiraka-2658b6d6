import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="py-1 bg-white/80 backdrop-blur-sm border-t flex-shrink-0">
      <div className="container mx-auto px-3">
        <div className="flex justify-center gap-4 text-xs sm:text-sm">
          <a 
            href="#" 
            className="text-gray-600 hover:text-eco-primary transition-colors"
            aria-label="Read our Privacy Policy"
          >
            Privacy Policy
          </a>
          <a 
            href="#" 
            className="text-gray-600 hover:text-eco-primary transition-colors"
            aria-label="Read our Terms of Service"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};