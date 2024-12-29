import { useNavigate } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="py-4 border-t bg-white/80 backdrop-blur-sm">
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