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

export const SustainabilityImpactChart = ({ dateRange }: SustainabilityImpactChartProps) => {
  const { data: impactData, isLoading } = useQuery({
    queryKey: ["sustainability-impact", dateRange],
    queryFn: async () => {
      // Return dummy data showing yearly impact
      return [
        { year: "2020", carbonReduction: 15000, waterSaved: 25000 },
        { year: "2021", carbonReduction: 22000, waterSaved: 35000 },
        { year: "2022", carbonReduction: 35000, waterSaved: 48000 },
        { year: "2023", carbonReduction: 45000, waterSaved: 62000 },
        { year: "2024", carbonReduction: 58000, waterSaved: 75000 }
      ];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">Yearly Sustainability Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <p>Loading impact data...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="carbonReduction" 
                  name="Carbon Reduction (kg)" 
                  fill="#2F5233" 
                />
                <Bar 
                  dataKey="waterSaved" 
                  name="Water Saved (L)" 
                  fill="#4F7942" 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};