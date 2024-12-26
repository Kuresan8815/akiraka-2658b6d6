import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  profile: any;
  session: any;
}

export const DashboardHeader = ({ profile, session }: DashboardHeaderProps) => (
  <div className="flex items-center gap-4 mb-6">
    <Avatar className="h-16 w-16">
      <AvatarImage src={session.user.user_metadata?.avatar_url} />
      <AvatarFallback>{profile?.name?.[0] || session.user.email?.[0]}</AvatarFallback>
    </Avatar>
    <div>
      <h1 className="text-2xl font-bold">
        Hello, {profile?.name || session.user.email?.split("@")[0]}!
      </h1>
      <p className="text-gray-600">Your sustainable choices make a difference!</p>
    </div>
  </div>
);