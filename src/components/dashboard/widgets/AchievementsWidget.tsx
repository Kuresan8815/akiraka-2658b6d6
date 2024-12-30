import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Achievements } from "../Achievements";

interface AchievementsWidgetProps {
  achievements: any[];
}

export const AchievementsWidget = ({ achievements }: AchievementsWidgetProps) => (
  <Card className="h-full bg-gradient-to-br from-purple-50 to-white">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-eco-primary">
        Your Achievements
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Achievements achievements={achievements} />
    </CardContent>
  </Card>
);