import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
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
  name: string;
  target: number;
  achieved: number;
}

export const SustainabilityImpactChart = ({ dateRange }: SustainabilityImpactChartProps) => {
  const { data: impactData, isLoading } = useQuery({
    queryKey: ["sustainability-impact", dateRange],
    queryFn: async () => {
      // Return dummy data showing sustainability metrics
      return [
        {
          name: "Greenhouse Gas Emissions (tons CO2)",
          target: 1000,
          achieved: 850
        },
        {
          name: "Other Air Emissions (tons)",
          target: 500,
          achieved: 420
        },
        {
          name: "Energy Consumption (MWh)",
          target: 5000,
          achieved: 4200
        },
        {
          name: "Water Consumption (kL)",
          target: 10000,
          achieved: 8500
        },
        {
          name: "Water Pollution (kg)",
          target: 200,
          achieved: 150
        },
        {
          name: "Land Use (hectares)",
          target: 1000,
          achieved: 900
        },
        {
          name: "Waste (tons)",
          target: 300,
          achieved: 250
        }
      ];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">Sustainability Metrics - Target vs Achieved</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]"> {/* Increased height to accommodate more metrics */}
          {isLoading ? (
            <p>Loading impact data...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={impactData}
                layout="vertical" // Changed to vertical layout for better readability
                margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  width={140}
                />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="target" 
                  name="Target" 
                  fill="#2F5233"
                  barSize={20}
                />
                <Bar 
                  dataKey="achieved" 
                  name="Achieved" 
                  fill="#4F7942"
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};