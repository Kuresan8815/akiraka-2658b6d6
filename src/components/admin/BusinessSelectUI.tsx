import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { Business } from "@/types/business";

interface BusinessSelectUIProps {
  businesses: Business[];
  selectedBusiness: string;
  onBusinessChange: (businessId: string) => void;
}

export const BusinessSelectUI = ({
  businesses,
  selectedBusiness,
  onBusinessChange,
}: BusinessSelectUIProps) => {
  return (
    <div className="space-y-4">
      <Select value={selectedBusiness} onValueChange={onBusinessChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a business" />
        </SelectTrigger>
        <SelectContent>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              {business.name} ({business.business_type})
            </SelectItem>
          ))}
          <SelectItem value="new" className="text-eco-primary">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Business
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};