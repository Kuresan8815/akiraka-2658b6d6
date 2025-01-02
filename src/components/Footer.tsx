import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="py-2 bg-white/80 backdrop-blur-sm border-t flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-6 text-sm">
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