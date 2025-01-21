import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export const LanguageSwitch = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="fixed bottom-4 right-4 z-50"
      title={i18n.language === 'en' ? 'Switch to Japanese' : '英語に切り替え'}
    >
      <Languages className="h-5 w-5" />
    </Button>
  );
};