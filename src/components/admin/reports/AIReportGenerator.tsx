
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

      if (requestError) throw requestError;

      // Call the edge function to generate the report
      const { data, error } = await supabase.functions.invoke("generate-ai-report", {
        body: { requestId: request.id, prompt },
      });

      if (error) throw error;
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
      toast({
        title: "Error",
        description: "Failed to generate report: " + error.message,
        variant: "destructive",
      });
    },
  });

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
          onClick={() => generateReport(prompt)} 
          disabled={!prompt.trim() || isPending}
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
