import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AchievementsProps {
  achievements: any[];
}

export const Achievements = ({ achievements }: AchievementsProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Your Achievements</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement: any, index: number) => (
          <div
            key={index}
            className="p-4 border rounded-lg text-center bg-gray-50"
          >
            <p className="font-medium">{achievement.name}</p>
            <p className="text-sm text-gray-600">{achievement.description}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);