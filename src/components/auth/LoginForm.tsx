import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { LoginFormFields } from "./form/LoginFormFields";
import { LoginFormActions } from "./form/LoginFormActions";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LoginFormFields
        email={email}
        password={password}
        isLoading={isLoading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
      />
      <LoginFormActions isLoading={isLoading} />
    </form>
  );
};