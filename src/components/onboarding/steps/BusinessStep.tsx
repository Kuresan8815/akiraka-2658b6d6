import { CreateBusinessForm } from "../../business/CreateBusinessForm";

interface BusinessStepProps {
  selectedIndustry: string;
  onBusinessCreated: (businessId: string) => void;
}

export const BusinessStep = ({ selectedIndustry, onBusinessCreated }: BusinessStepProps) => {
  return (
    <div className="w-full max-w-xs mx-auto">
      <CreateBusinessForm
        selectedIndustry={selectedIndustry}
        onSuccess={onBusinessCreated}
      />
    </div>
  );
};