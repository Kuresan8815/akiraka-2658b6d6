import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AchievementsProps {
  achievements: any[];
}

export const Achievements = ({ achievements }: AchievementsProps) => (
  <Card className="bg-gradient-to-br from-white to-gray-50 shadow-[4px_4px_10px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.8)] border border-gray-100">
    <CardHeader>
      <CardTitle className="text-lg text-eco-primary">Your Achievements</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-lg text-center bg-gradient-to-br from-white to-gray-50 shadow-[2px_2px_5px_rgba(0,0,0,0.05),-1px_-1px_5px_rgba(255,255,255,0.4)] border border-gray-100"
          >
            <p className="font-medium text-eco-primary">{achievement.name}</p>
            <p className="text-sm text-gray-600">{achievement.description}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);