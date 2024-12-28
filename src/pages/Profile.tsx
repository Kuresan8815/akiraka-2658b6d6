import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ArrowRight, Camera, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";

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
      return data;
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

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.get("name"),
          sustainability_goals: formData.get("sustainabilityGoals"),
          preferences: {
            notifications: formData.get("notifications") === "on",
            darkTheme: formData.get("darkTheme") === "on",
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

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={session?.user?.user_metadata?.avatar_url} />
            <AvatarFallback>{profile?.name?.[0] || session?.user?.email?.[0]}</AvatarFallback>
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
        <h2 className="text-2xl font-bold">{profile?.name || "Your Profile"}</h2>
        <p className="text-gray-600">{session?.user?.email}</p>
      </div>

      <Card className="p-6 space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateProfile(new FormData(e.currentTarget));
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              name="name"
              defaultValue={profile?.name || ""}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              value={session?.user?.email || ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sustainabilityGoals" className="text-sm font-medium">
              Sustainability Goals
            </label>
            <Textarea
              id="sustainabilityGoals"
              name="sustainabilityGoals"
              defaultValue={profile?.sustainability_goals?.toString() || ""}
              disabled={!isEditing}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="notifications" className="text-sm">
                  Enable Notifications
                </label>
                <Switch
                  id="notifications"
                  name="notifications"
                  defaultChecked={profile?.preferences?.notifications}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="darkTheme" className="text-sm">
                  Dark Theme
                </label>
                <Switch
                  id="darkTheme"
                  name="darkTheme"
                  defaultChecked={profile?.preferences?.darkTheme}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </form>
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