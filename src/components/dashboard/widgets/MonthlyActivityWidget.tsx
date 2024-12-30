import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyScansChart } from "../MonthlyScansChart";

interface MonthlyActivityWidgetProps {
  data: { month: string; scans: number }[];
}

export const MonthlyActivityWidget = ({ data }: MonthlyActivityWidgetProps) => (
  <Card className="h-full bg-gradient-to-br from-orange-50 to-white">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-eco-primary">
        Monthly Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <MonthlyScansChart data={data} />
    </CardContent>
  </Card>
);