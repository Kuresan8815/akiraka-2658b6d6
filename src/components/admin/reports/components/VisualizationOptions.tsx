
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface VisualizationOptionsProps {
  visualization: {
    showBarCharts: boolean;
    showLineCharts: boolean;
    showPieCharts: boolean;
    showTables: boolean;
    showTimeline: boolean;
    showWaterfall?: boolean;
    showHeatmaps?: boolean;
    showInfographics?: boolean;
  };
  setVisualization: (value: any) => void;
  colorScheme?: string;
  setColorScheme?: (value: string) => void;
  useExternalCharts?: boolean;
  setUseExternalCharts?: (value: boolean) => void;
}

export const VisualizationOptions = ({
  visualization,
  setVisualization,
  colorScheme,
  setColorScheme,
  useExternalCharts,
  setUseExternalCharts,
}: VisualizationOptionsProps) => {
  const options = [
    { id: "showBarCharts", label: "Bar Charts" },
    { id: "showLineCharts", label: "Line Charts" },
    { id: "showPieCharts", label: "Pie Charts" },
    { id: "showTables", label: "Data Tables" },
    { id: "showTimeline", label: "Timeline View" },
    { id: "showWaterfall", label: "Waterfall Charts" },
    { id: "showHeatmaps", label: "Heatmaps" },
    { id: "showInfographics", label: "Infographics" }
  ];

  const colorSchemes = [
    { id: "greenBlue", label: "Green & Blue", colors: ["#10B981", "#3B82F6", "#8B5CF6"] },
    { id: "vibrant", label: "Vibrant", colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899"] },
    { id: "earthy", label: "Earthy", colors: ["#D97706", "#65A30D", "#0369A1", "#A16207"] },
    { id: "contrast", label: "High Contrast", colors: ["#10B981", "#EC4899", "#F59E0B", "#8B5CF6"] },
    { id: "rainbow", label: "Rainbow", colors: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"] }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Visualization Options</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {options.map(({ id, label }) => (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox
                id={id}
                checked={visualization[id as keyof typeof visualization] || false}
                onCheckedChange={(checked) =>
                  setVisualization((prev: typeof visualization) => ({
                    ...prev,
                    [id]: checked,
                  }))
                }
              />
              <Label htmlFor={id} className="cursor-pointer">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* External Charts Option */}
      {setUseExternalCharts && (
        <div className="flex items-center justify-between py-2 border-t pt-4">
          <div>
            <Label htmlFor="external-charts" className="font-medium">Use Enhanced Charts API</Label>
            <p className="text-sm text-gray-500">Generate higher quality charts using external API</p>
          </div>
          <Switch
            id="external-charts"
            checked={useExternalCharts}
            onCheckedChange={setUseExternalCharts}
          />
          {useExternalCharts && (
            <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Enhanced</Badge>
          )}
        </div>
      )}

      {setColorScheme && (
        <div className="space-y-2 border-t pt-4">
          <Label>Color Scheme</Label>
          <RadioGroup 
            value={colorScheme} 
            onValueChange={setColorScheme}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            {colorSchemes.map((scheme) => (
              <div key={scheme.id} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                <RadioGroupItem value={scheme.id} id={`color-${scheme.id}`} />
                <div className="flex flex-col space-y-1 flex-1">
                  <Label htmlFor={`color-${scheme.id}`} className="cursor-pointer">{scheme.label}</Label>
                  <div className="flex space-x-1">
                    {scheme.colors.map((color, index) => (
                      <div 
                        key={index} 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
};
