import { Checkbox } from "@/components/ui/checkbox";

interface GoalsSelectProps {
  selectedGoals: string[];
  onSelect: (goals: string[]) => void;
}

const sustainabilityGoals = [
  "Reduce Carbon Emissions",
  "Improve Energy Efficiency",
  "Increase Recyclability",
  "Reduce Water Usage",
  "Sustainable Sourcing",
  "Zero Waste",
  "Renewable Energy Adoption",
  "Biodiversity Protection"
];

export const GoalsSelect = ({ selectedGoals, onSelect }: GoalsSelectProps) => {
  return (
    <div className="w-full max-w-xs mx-auto space-y-4">
      {sustainabilityGoals.map((goal) => (
        <div key={goal} className="flex items-center space-x-2">
          <Checkbox
            id={goal}
            checked={selectedGoals.includes(goal)}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelect([...selectedGoals, goal]);
              } else {
                onSelect(selectedGoals.filter(g => g !== goal));
              }
            }}
          />
          <label htmlFor={goal} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {goal}
          </label>
        </div>
      ))}
    </div>
  );
};