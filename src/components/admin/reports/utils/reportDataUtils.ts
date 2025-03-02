
import { Json } from "@/integrations/supabase/types";

// Define a type for the report data structure
export interface ReportData {
  empty_metrics?: boolean;
  useExternalCharts?: boolean;
  error?: string;
  timestamp?: string;
  status_updates?: string[];
  warning?: string;
  retry_count?: number;
  retry_at?: string;
  download_error?: string;
  [key: string]: any;
}

// Helper function to safely parse report data
export const parseReportData = (data: Json | null): ReportData => {
  if (!data) return {};
  if (typeof data === 'object' && data !== null) return data as ReportData;
  try {
    if (typeof data === 'string') return JSON.parse(data) as ReportData;
  } catch (e) {
    console.error("Error parsing report data:", e);
  }
  return {};
};

// Helper function to get status updates safely
export const getStatusUpdates = (data: Json | ReportData | null): string[] => {
  const parsedData = typeof data === 'object' && data !== null ? data as ReportData : parseReportData(data);
  return Array.isArray(parsedData.status_updates) 
    ? parsedData.status_updates 
    : ["Created report record"];
};

// Function to get color palette based on scheme
export const getColorPalette = (scheme: string) => {
  const palettes = {
    greenBlue: ["#10B981", "#3B82F6", "#8B5CF6"],
    vibrant: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899"],
    earthy: ["#D97706", "#65A30D", "#0369A1", "#A16207"],
    contrast: ["#10B981", "#EC4899", "#F59E0B", "#8B5CF6"],
    rainbow: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"]
  };
  return palettes[scheme as keyof typeof palettes] || palettes.greenBlue;
};
