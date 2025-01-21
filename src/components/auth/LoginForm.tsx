import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t("auth.error"),
        description: t("auth.enterBothFields"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        let errorMessage = t("auth.invalidCredentials");
        
        if (error.message.includes("Email not confirmed")) {
          errorMessage = t("auth.verifyEmail");
        }
        
        toast({
          title: t("auth.loginFailed"),
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (data?.user) {
        toast({
          title: t("auth.success"),
          description: t("auth.signedIn"),
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: t("auth.error"),
        description: t("auth.unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            placeholder={t("auth.enterEmail")}
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="password"
            placeholder={t("auth.enterPassword")}
            className="pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            minLength={6}
          />
        </div>
      </div>

      <Button 
        type="submit"
        className="w-full bg-eco-primary hover:bg-eco-secondary"
        disabled={isLoading}
      >
        {isLoading ? t("auth.signingIn") : t("auth.signIn")}
      </Button>

      <div className="flex justify-between items-center text-sm">
        <Button
          variant="link"
          className="p-0 text-eco-primary"
          onClick={handleBack}
        >
          {t("common.backToHome")}
        </Button>
        <Button
          variant="link"
          className="p-0 text-eco-primary"
          onClick={() => navigate("/signup")}
        >
          {t("auth.signUp")}
        </Button>
      </div>
    </form>
  );
};