import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Building2 } from "lucide-react";
import { Business, BusinessProfile } from "@/types/business";

interface BusinessListProps {
  profiles: (BusinessProfile & { businesses: Business })[];
  onProfileSwitch: (businessId: string) => void;
  currentBusinessId?: string;
}

export const BusinessList = ({ profiles, onProfileSwitch, currentBusinessId }: BusinessListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <Card key={profile.id} className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-2 rounded-full">
              <Building2 className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold">{profile.businesses.name}</h3>
              <p className="text-sm text-gray-500">{profile.role}</p>
            </div>
          </div>
          
          <Button
            variant={currentBusinessId === profile.business_id ? "default" : "outline"}
            className="w-full"
            onClick={() => onProfileSwitch(profile.business_id)}
          >
            {currentBusinessId === profile.business_id ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Current Profile
              </>
            ) : (
              "Switch to Profile"
            )}
          </Button>
        </Card>
      ))}
    </div>
  );
};