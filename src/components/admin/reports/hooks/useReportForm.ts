
import { useState } from "react";

export const useReportForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visualization, setVisualization] = useState({
    showBarCharts: true,
    showLineCharts: true,
    showPieCharts: true,
    showTables: true,
    showTimeline: true,
    showWaterfall: true,
    showHeatmaps: true,
    showInfographics: true,
  });
  
  const [colorScheme, setColorScheme] = useState("greenBlue");
  const [handleEmptyMetrics, setHandleEmptyMetrics] = useState(true);
  const [useExternalCharts, setUseExternalCharts] = useState(true);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVisualization({
      showBarCharts: true,
      showLineCharts: true,
      showPieCharts: true,
      showTables: true,
      showTimeline: true,
      showWaterfall: true,
      showHeatmaps: true,
      showInfographics: true,
    });
    setColorScheme("greenBlue");
    setHandleEmptyMetrics(true);
    setUseExternalCharts(true);
  };

  return {
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
    resetForm,
  };
};
