import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SustainabilityImpactChartProps {
  dateRange: DateRange | undefined;
}

interface SustainabilityMetric {
  year: string;
  greenhouseEmissions: number;
  energyConsumption: number;
  waterConsumption: number;
  landUse: number;
  wasteManagement: number;
}

export const SustainabilityImpactChart = ({ dateRange }: SustainabilityImpactChartProps) => {
  const { data: impactData, isLoading } = useQuery({
    queryKey: ["sustainability-impact", dateRange],
    queryFn: async () => {
      // In a real application, this would fetch from your Supabase database
      // For now, we'll use dummy data to demonstrate the functionality
      return [
        {
          year: "2020",
          greenhouseEmissions: 15000,  // Starting high, will decrease (improvement)
          energyConsumption: 18000,    // Starting low, will increase (challenge)
          waterConsumption: 35000,     // Starting high, will decrease (improvement)
          landUse: 1200,               // Relatively stable with small variations
          wasteManagement: 8000,       // Starting high, will decrease (improvement)
        },
        {
          year: "2021",
          greenhouseEmissions: 13500,
          energyConsumption: 20000,
          waterConsumption: 32000,
          landUse: 1150,
          wasteManagement: 7200,
        },
        {
          year: "2022",
          greenhouseEmissions: 11000,
          energyConsumption: 23000,
          waterConsumption: 28000,
          landUse: 1180,
          wasteManagement: 6100,
        },
        {
          year: "2023",
          greenhouseEmissions: 9500,
          energyConsumption: 25000,
          waterConsumption: 26000,
          landUse: 1100,
          wasteManagement: 5300,
        },
        {
          year: "2024",
          greenhouseEmissions: 8000,    // Showing improvement
          energyConsumption: 28000,     // Showing challenge area
          waterConsumption: 24000,      // Showing improvement
          landUse: 1160,                // Slight variation
          wasteManagement: 4500,        // Showing improvement
        }
      ];
    },
  });

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case "greenhouseEmissions":
        return `${value} kg CO₂e`;
      case "energyConsumption":
        return `${value} kWh`;
      case "waterConsumption":
        return `${value} L`;
      case "landUse":
        return `${value} m²`;
      case "wasteManagement":
        return `${value} kg`;
      default:
        return value;
    }
  };

  const getMetricName = (key: string) => {
    const names: { [key: string]: string } = {
      greenhouseEmissions: "Greenhouse Emissions",
      energyConsumption: "Energy Consumption",
      waterConsumption: "Water Consumption",
      landUse: "Land Use",
      wasteManagement: "Waste Management",
    };
    return names[key] || key;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-eco-primary">{`Year: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>
                {getMetricName(entry.dataKey)}: {formatTooltipValue(entry.value, entry.dataKey)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">Yearly Sustainability Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {isLoading ? (
            <p>Loading impact data...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone"
                  dataKey="greenhouseEmissions" 
                  name="Greenhouse Emissions (kg CO₂e)" 
                  stroke="#2F5233" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone"
                  dataKey="energyConsumption" 
                  name="Energy Consumption (kWh)" 
                  stroke="#4F7942" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone"
                  dataKey="waterConsumption" 
                  name="Water Consumption (L)" 
                  stroke="#6B8E23" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone"
                  dataKey="landUse" 
                  name="Land Use (m²)" 
                  stroke="#8B4513" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone"
                  dataKey="wasteManagement" 
                  name="Waste Management (kg)" 
                  stroke="#A0522D" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};