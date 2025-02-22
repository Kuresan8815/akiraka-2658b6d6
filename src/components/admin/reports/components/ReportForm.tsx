
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VisualizationOptions } from "./VisualizationOptions";

interface ReportFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  visualization: {
    showBarCharts: boolean;
    showLineCharts: boolean;
    showPieCharts: boolean;
    showTables: boolean;
    showTimeline: boolean;
  };
  setVisualization: (value: any) => void;
}

export const ReportForm = ({
  title,
  setTitle,
  description,
  setDescription,
  visualization,
  setVisualization,
}: ReportFormProps) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Report Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Q1 2024 ESG Performance Report"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Report Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Comprehensive analysis of our ESG metrics and sustainability impact..."
        />
      </div>
      <VisualizationOptions
        visualization={visualization}
        setVisualization={setVisualization}
      />
    </div>
  );
};
