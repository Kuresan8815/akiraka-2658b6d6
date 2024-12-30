import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyTip } from "../DailyTip";

export const DailyTipWidget = () => (
  <Card className="h-full bg-gradient-to-br from-green-50 to-white">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-eco-primary">
        Daily Eco Tip
      </CardTitle>
    </CardHeader>
    <CardContent>
      <DailyTip />
    </CardContent>
  </Card>
);