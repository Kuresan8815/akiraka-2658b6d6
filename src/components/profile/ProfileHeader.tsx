import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ProfileHeaderProps {
  avatarUrl?: string;
  name?: string;
  email?: string;
}

export const ProfileHeader = ({ avatarUrl, name, email }: ProfileHeaderProps) => {
  const { toast } = useToast();

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{name?.[0] || email?.[0]}</AvatarFallback>
        </Avatar>
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full"
          onClick={() => toast({
            title: "Coming Soon",
            description: "Avatar upload functionality will be available soon!",
          })}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      <h2 className="text-2xl font-bold">{name || "Your Profile"}</h2>
      <p className="text-gray-600">{email}</p>
    </div>
  );
};