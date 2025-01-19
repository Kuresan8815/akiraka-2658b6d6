import { ActivitiesSelect } from "../ActivitiesSelect";

interface ActivitiesStepProps {
  selectedActivities: string[];
  onSelect: (activities: string[]) => void;
}

export const ActivitiesStep = ({ selectedActivities, onSelect }: ActivitiesStepProps) => {
  return (
    <div className="w-full max-w-xs mx-auto">
      <ActivitiesSelect
        selectedActivities={selectedActivities}
        onSelect={onSelect}
      />
    </div>
  );
};