import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Profile as ProfileType, ProfileFormData, ProfilePreferences } from "@/types/profile";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      
      // Parse the preferences with proper type checking
      const defaultPreferences: ProfilePreferences = {
        notifications: false,
        darkTheme: false,
      };

      let parsedPreferences: ProfilePreferences;
      try {
        const rawPreferences = data.preferences as Record<string, unknown>;
        parsedPreferences = {
          notifications: typeof rawPreferences?.notifications === 'boolean' ? rawPreferences.notifications : defaultPreferences.notifications,
          darkTheme: typeof rawPreferences?.darkTheme === 'boolean' ? rawPreferences.darkTheme : defaultPreferences.darkTheme,
        };
      } catch {
        parsedPreferences = defaultPreferences;
      }
      
      return {
        ...data,
        email: session?.user?.email,
        preferences: parsedPreferences
      } as ProfileType;
    },
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async (formData: ProfileFormData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          sustainability_goals: formData.sustainabilityGoals,
          preferences: {
            notifications: formData.notifications,
            darkTheme: formData.darkTheme,
          },
        })
        .eq("id", session?.user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-up">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="text-gray-600"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <ProfileHeader
        avatarUrl={session?.user?.user_metadata?.avatar_url}
        name={profile?.name}
        email={profile?.email}
      />

      <Card className="p-6 space-y-6">
        <ProfileForm
          profile={profile!}
          isEditing={isEditing}
          onSubmit={handleUpdateProfile}
          onEdit={() => setIsEditing(true)}
          onCancel={() => setIsEditing(false)}
        />
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Account Actions</h3>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast({
              title: "Coming Soon",
              description: "Password change functionality will be available soon!",
            })}
          >
            Change Password
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}