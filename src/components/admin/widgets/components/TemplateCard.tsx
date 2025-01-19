import { Template } from "@/types/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TemplateCardProps {
  template: Template;
  onApply: (template: Template) => void;
}

export const TemplateCard = ({ template, onApply }: TemplateCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{template.name}</h3>
          <p className="text-sm text-gray-500">{template.description}</p>
          <p className="text-xs text-gray-400 mt-2">
            Industry: {template.industry_type}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onApply(template)}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};