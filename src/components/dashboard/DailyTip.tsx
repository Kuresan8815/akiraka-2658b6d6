import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const DailyTip = () => (
  <Card className="bg-gradient-to-br from-white to-gray-50 shadow-[4px_4px_10px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.8)] border border-gray-100">
    <CardHeader className="bg-eco-secondary/40 rounded-t-lg">
      <CardTitle className="text-lg text-eco-primary">Daily Eco Tip</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">
        Switch off unused lights to save energy and reduce your carbon footprint!
      </p>
      <Button variant="link" className="mt-2 p-0 text-eco-primary">
        See More Tips
      </Button>
    </CardContent>
  </Card>
);