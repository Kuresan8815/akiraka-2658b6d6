import { Checkbox } from "@/components/ui/checkbox";

interface ActivitiesSelectProps {
  selectedActivities: string[];
  onSelect: (activities: string[]) => void;
}

const activities = [
  "Product Manufacturing",
  "Renewable Energy",
  "Waste Management",
  "Supply Chain Optimization",
  "Sustainable Packaging",
  "Carbon Offsetting",
  "Green Transportation",
  "Recycling Programs"
];

export const ActivitiesSelect = ({ selectedActivities, onSelect }: ActivitiesSelectProps) => {
  return (
    <div className="w-full max-w-xs mx-auto space-y-4">
      {activities.map((activity) => (
        <div key={activity} className="flex items-center space-x-2">
          <Checkbox
            id={activity}
            checked={selectedActivities.includes(activity)}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelect([...selectedActivities, activity]);
              } else {
                onSelect(selectedActivities.filter(a => a !== activity));
              }
            }}
          />
          <label htmlFor={activity} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {activity}
          </label>
        </div>
      ))}
    </div>
  );
};