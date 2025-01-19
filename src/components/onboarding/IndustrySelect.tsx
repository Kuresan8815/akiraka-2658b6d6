import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IndustrySelectProps {
  selectedIndustry: string;
  onSelect: (value: string) => void;
}

const industryTypes = [
  "Manufacturing",
  "Retail",
  "Energy",
  "Agriculture",
  "Transportation",
  "Construction",
  "Technology",
  "Public Institutions/Organizations",
  "Other"
];

export const IndustrySelect = ({ selectedIndustry, onSelect }: IndustrySelectProps) => {
  return (
    <div className="w-full max-w-xs mx-auto">
      <Select value={selectedIndustry} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your industry" />
        </SelectTrigger>
        <SelectContent>
          {industryTypes.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};