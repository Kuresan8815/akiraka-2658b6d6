
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VisualizationOptions } from "./VisualizationOptions";
import { useReportGeneration } from "../hooks/useReportGeneration";
import { Loader2 } from "lucide-react";

interface ReportFormProps {
  businessId?: string;
  onSuccess: () => void;
}

export const ReportForm = ({ businessId, onSuccess }: ReportFormProps) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    visualization,
    setVisualization,
    colorScheme,
    setColorScheme,
    handleEmptyMetrics,
    setHandleEmptyMetrics,
    useExternalCharts,
    setUseExternalCharts,
    createReport,
    isPending,
  } = useReportGeneration({ businessId, onSuccess });

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-base">Report Title</Label>
        <Input
          id="title"
          placeholder="e.g., Q2 2023 ESG Performance"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-base">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose of this report..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>

      <VisualizationOptions
        visualization={visualization}
        setVisualization={setVisualization}
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
        useExternalCharts={useExternalCharts}
        setUseExternalCharts={setUseExternalCharts}
      />

      <div className="flex items-center justify-between pt-2 border-t">
        <div>
          <Label htmlFor="empty-metrics" className="text-base font-medium">Handle Empty Metrics</Label>
          <p className="text-sm text-gray-500">Generate report structure even if metrics have no data</p>
        </div>
        <input
          type="checkbox"
          id="empty-metrics"
          checked={handleEmptyMetrics}
          onChange={(e) => setHandleEmptyMetrics(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
        />
      </div>

      <Button
        onClick={() => createReport()}
        disabled={!businessId || !title || isPending}
        className="w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Report...
          </>
        ) : (
          "Generate Report"
        )}
      </Button>
    </div>
  );
};
