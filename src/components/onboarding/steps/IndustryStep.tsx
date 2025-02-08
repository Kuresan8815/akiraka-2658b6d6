import { IndustrySelect } from "../IndustrySelect";

interface IndustryStepProps {
  selectedIndustry: string;
  onSelect: (industry: string) => void;
}

export const IndustryStep = ({ selectedIndustry, onSelect }: IndustryStepProps) => {
  return (
    <div className="w-full max-w-xs mx-auto">
      <IndustrySelect
        selectedIndustry={selectedIndustry}
        onSelect={onSelect}
      />
    </div>
  );
};