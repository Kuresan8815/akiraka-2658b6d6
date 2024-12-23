import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface MonthlyScansChartProps {
  data: { month: string; scans: number }[];
}

export const MonthlyScansChart = ({ data }: MonthlyScansChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Monthly Scans</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="text-sm">{`${label}: ${payload[0].value} scans`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="scans"
              fill="var(--eco-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);