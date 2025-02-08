import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Business } from "@/types/business";

interface BusinessSelectProps {
  businesses: Business[];
  selectedBusiness: string;
  onSelect: (value: string) => void;
}

export const BusinessSelect = ({ businesses, selectedBusiness, onSelect }: BusinessSelectProps) => {
  return (
    <div className="w-full max-w-xs mx-auto">
      <Select value={selectedBusiness} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a business" />
        </SelectTrigger>
        <SelectContent>
          {businesses && businesses.length > 0 ? (
            businesses.map((business) => (
              <SelectItem key={business.id} value={business.id}>
                {business.name} ({business.business_type})
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-businesses" disabled>
              No businesses available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};