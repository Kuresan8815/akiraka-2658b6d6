import { Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface LoginFormFieldsProps {
  email: string;
  password: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export const LoginFormFields = ({
  email,
  password,
  isLoading,
  onEmailChange,
  onPasswordChange,
}: LoginFormFieldsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          type="email"
          placeholder={t("auth.enterEmail")}
          className="pl-10"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
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
          onChange={(e) => onPasswordChange(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
        />
      </div>
    </div>
  );
};