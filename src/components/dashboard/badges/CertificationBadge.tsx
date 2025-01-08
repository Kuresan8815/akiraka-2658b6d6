import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { Product } from "@/types/product";

interface CertificationBadgeProps {
  certificationLevel: Product["certification_level"];
}

export const CertificationBadge = ({ certificationLevel }: CertificationBadgeProps) => {
  const certificationColor = {
    Bronze: "bg-orange-500",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
  }[certificationLevel];

  return (
    <Badge className={certificationColor}>
      <Award className="mr-1 h-3 w-3" />
      {certificationLevel} Certified
    </Badge>
  );
};