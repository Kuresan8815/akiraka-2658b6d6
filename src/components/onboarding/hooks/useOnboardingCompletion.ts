import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useOnboardingCompletion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const completeOnboarding = async (
    createdBusinessId: string,
    selectedIndustry: string,
    selectedActivities: string[],
    selectedGoals: string[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User session not found",
          variant: "destructive",
        });
        return;
      }

      // Create business profile association first
      const { error: profileError } = await supabase
        .from("business_profiles")
        .insert({
          business_id: createdBusinessId,
          user_id: user.id,
          role: 'owner'
        });

      if (profileError) {
        if (profileError.code !== '23505') { // Not a duplicate entry
          console.error("Business profile error:", profileError);
          toast({
            title: "Error",
            description: "Failed to create business profile association",
            variant: "destructive",
          });
          return;
        }
      }

      // Create admin user role
      const { error: adminError } = await supabase
        .from("admin_users")
        .insert({
          id: user.id,
          role: 'business_user',
          account_level: 'business'
        });

      if (adminError) {
        if (adminError.code !== '23505') { // Not a duplicate entry
          console.error("Admin role error:", adminError);
          toast({
            title: "Error",
            description: "Failed to set admin role",
            variant: "destructive",
          });
          return;
        }
      }

      // Update business with selected options
      const { error: businessError } = await supabase
        .from("businesses")
        .update({
          industry_type: selectedIndustry,
          activities: selectedActivities,
          sustainability_goals: selectedGoals
        })
        .eq("id", createdBusinessId);

      if (businessError) {
        console.error("Business update error:", businessError);
        toast({
          title: "Error",
          description: "Failed to update business information",
          variant: "destructive",
        });
        return;
      }

      // Update user profile onboarding status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return;
      }

      // Update user's current business ID in auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { current_business_id: createdBusinessId }
      });

      if (authError) {
        console.error("Auth update error:", authError);
        toast({
          title: "Error",
          description: "Failed to set current business",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome!",
        description: "Onboarding completed successfully",
      });

      navigate("/admin");
    } catch (error) {
      console.error("Onboarding completion error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { completeOnboarding };
};