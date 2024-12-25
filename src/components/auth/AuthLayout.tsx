import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AuthLayout = ({ 
  children, 
  title, 
  subtitle 
}: { 
  children: ReactNode;
  title: string;
  subtitle?: string;
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-primary/10 to-white">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-eco-primary mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mb-8">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};