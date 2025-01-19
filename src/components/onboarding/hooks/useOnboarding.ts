import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useOnboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [createdBusinessId, setCreatedBusinessId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateCurrentStep = () => {
    if (currentSlide === 0 && !selectedIndustry) {
      toast({
        title: "Required",
        description: "Please select an industry to continue",
        variant: "destructive",
      });
      return false;
    }

    if (currentSlide === 1 && !createdBusinessId) {
      toast({
        title: "Required",
        description: "Please create your business profile to continue",
        variant: "destructive",
      });
      return false;
    }

    if (currentSlide === 2 && selectedActivities.length === 0) {
      toast({
        title: "Required",
        description: "Please select at least one activity",
        variant: "destructive",
      });
      return false;
    }

    if (currentSlide === 3 && selectedGoals.length === 0) {
      toast({
        title: "Required",
        description: "Please select at least one sustainability goal",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const completeOnboarding = async () => {
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

      // Create business_user role in admin_users table
      const { error: adminError } = await supabase
        .from("admin_users")
        .insert({
          id: user.id,
          role: 'business_user',
          account_level: 'business'
        });

      if (adminError) {
        // Check if error is due to duplicate entry
        if (adminError.code === '23505') { // Unique violation code
          console.log("Admin role already exists for user");
        } else {
          console.error("Admin role error:", adminError);
          toast({
            title: "Error",
            description: "Failed to set admin role",
            variant: "destructive",
          });
          return;
        }
      }

      // Create business profile association
      const { error: profileError } = await supabase
        .from("business_profiles")
        .insert({
          business_id: createdBusinessId,
          user_id: user.id,
          role: 'owner'
        });

      if (profileError) {
        console.error("Business profile error:", profileError);
        toast({
          title: "Error",
          description: "Failed to create business profile association",
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

  const nextSlide = async () => {
    if (!validateCurrentStep()) return;

    if (currentSlide === 3) {
      await completeOnboarding();
      return;
    }

    setCurrentSlide((prev) => prev + 1);
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleBusinessCreated = (businessId: string) => {
    setCreatedBusinessId(businessId);
    nextSlide();
  };

  return {
    currentSlide,
    selectedIndustry,
    setSelectedIndustry,
    selectedActivities,
    setSelectedActivities,
    selectedGoals,
    setSelectedGoals,
    handleBusinessCreated,
    nextSlide,
    previousSlide,
  };
};