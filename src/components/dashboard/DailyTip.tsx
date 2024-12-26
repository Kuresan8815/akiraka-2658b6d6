import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const DailyTip = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Daily Eco Tip</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">
        Switch off unused lights to save energy and reduce your carbon footprint!
      </p>
      <Button variant="link" className="mt-2 p-0">
        See More Tips
      </Button>
    </CardContent>
  </Card>
);