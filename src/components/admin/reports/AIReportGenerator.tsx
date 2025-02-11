
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AIReportGeneratorProps {
  businessId?: string;
  onReportGenerated?: (templateId: string) => void;
}

export const AIReportGenerator = ({ businessId, onReportGenerated }: AIReportGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: generateReport, isPending } = useMutation({
    mutationFn: async (prompt: string) => {
      if (!businessId) {
        throw new Error("Business ID is required to generate a report");
      }

      console.log('Starting report generation with prompt:', prompt);

      // First, create the AI report request
      const { data: request, error: requestError } = await supabase
        .from("ai_report_requests")
        .insert([
          {
            business_id: businessId,
            prompt,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (requestError) {
        console.error('Error creating AI report request:', requestError);
        throw new Error(`Failed to create report request: ${requestError.message}`);
      }

      console.log('Created AI report request:', request);

      // Call the edge function to generate the report
      const { data, error } = await supabase.functions.invoke("generate-ai-report", {
        body: { requestId: request.id, prompt },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to generate report: ${error.message}`);
      }

      console.log('Report generation successful:', data);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Report generation started",
        description: "Your report is being generated. You'll be notified when it's ready.",
      });
      setPrompt("");
      if (data.templateId && onReportGenerated) {
        onReportGenerated(data.templateId);
      }
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["generated-reports"] });
    },
    onError: (error) => {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!businessId) {
      toast({
        title: "Error",
        description: "Please select a business before generating a report",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the report",
        variant: "destructive",
      });
      return;
    }

    generateReport(prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Report Generator</CardTitle>
        <CardDescription>
          Describe the report you want to create in natural language. Include details about the metrics,
          visualization preferences, and any specific requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="E.g., Create a sustainability report focusing on carbon emissions and water usage. Include bar charts for monthly trends and pie charts for resource distribution. Make it colorful and easy to read."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <Button 
          onClick={handleSubmit} 
          disabled={!prompt.trim() || isPending || !businessId}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            "Generate Report"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
