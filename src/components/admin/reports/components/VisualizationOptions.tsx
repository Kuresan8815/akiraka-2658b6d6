
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface VisualizationOptionsProps {
  visualization: {
    showBarCharts: boolean;
    showLineCharts: boolean;
    showPieCharts: boolean;
    showTables: boolean;
    showTimeline: boolean;
  };
  setVisualization: (value: any) => void;
}

export const VisualizationOptions = ({
  visualization,
  setVisualization,
}: VisualizationOptionsProps) => {
  const options = [
    { id: "showBarCharts", label: "Bar Charts" },
    { id: "showLineCharts", label: "Line Charts" },
    { id: "showPieCharts", label: "Pie Charts" },
    { id: "showTables", label: "Data Tables" },
    { id: "showTimeline", label: "Timeline View" },
  ];

  return (
    <div className="space-y-2">
      <Label>Visualization Options</Label>
      <div className="grid grid-cols-2 gap-4">
        {options.map(({ id, label }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={visualization[id as keyof typeof visualization]}
              onCheckedChange={(checked) =>
                setVisualization((prev: typeof visualization) => ({
                  ...prev,
                  [id]: checked,
                }))
              }
            />
            <Label htmlFor={id}>{label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};
