import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface LoginFormActionsProps {
  isLoading: boolean;
}

export const LoginFormActions = ({ isLoading }: LoginFormActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
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
          onClick={() => navigate("/")}
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
    </>
  );
};