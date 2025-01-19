import { GoalsSelect } from "../GoalsSelect";

interface GoalsStepProps {
  selectedGoals: string[];
  onSelect: (goals: string[]) => void;
}

export const GoalsStep = ({ selectedGoals, onSelect }: GoalsStepProps) => {
  return (
    <div className="w-full max-w-xs mx-auto">
      <GoalsSelect
        selectedGoals={selectedGoals}
        onSelect={onSelect}
      />
    </div>
  );
};