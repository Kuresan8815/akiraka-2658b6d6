
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReportTemplate } from "@/types/reports";

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId?: string;
}

export const CreateReportDialog = ({
  open,
  onOpenChange,
  businessId,
}: CreateReportDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available templates
  const { data: templates } = useQuery({
    queryKey: ["report-templates", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .eq("business_id", businessId)
        .eq("is_active", true);

      if (error) throw error;
      return data as ReportTemplate[];
    },
  });

  const { mutate: createReport, isPending } = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error("No business selected");

      // If using a template
      if (selectedTemplate) {
        const { data, error } = await supabase
          .from("generated_reports")
          .insert([
            {
              business_id: businessId,
              template_id: selectedTemplate,
              report_data: {},
              generated_by: (await supabase.auth.getUser()).data.user?.id,
              status: "pending",
              date_range: {
                start: new Date().toISOString(),
                end: new Date().toISOString(),
              },
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Trigger the report generation
        const { error: fnError } = await supabase.functions.invoke('generate-report', {
          body: { report_id: data.id }
        });

        if (fnError) throw fnError;
        return data;
      }

      // If creating a new template and report
      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .insert([
          {
            business_id: businessId,
            name,
            description,
            layout_type: "standard",
            theme_colors: ["#9b87f5", "#7E69AB", "#6E59A5"],
          },
        ])
        .select()
        .single();

      if (templateError) throw templateError;

      const { data: report, error: reportError } = await supabase
        .from("generated_reports")
        .insert([
          {
            business_id: businessId,
            template_id: template.id,
            report_data: {},
            generated_by: (await supabase.auth.getUser()).data.user?.id,
            status: "pending",
            date_range: {
              start: new Date().toISOString(),
              end: new Date().toISOString(),
            },
          },
        ])
        .select()
        .single();

      if (reportError) throw reportError;

      // Trigger the report generation
      const { error: fnError } = await supabase.functions.invoke('generate-report', {
        body: { report_id: report.id }
      });

      if (fnError) throw fnError;
      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["generated-reports"] });
      toast({
        title: "Success",
        description: "Report generation started. You'll be notified when it's ready.",
      });
      onOpenChange(false);
      setName("");
      setDescription("");
      setSelectedTemplate("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create report: " + error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {templates && templates.length > 0 && (
            <div className="space-y-2">
              <Label>Use Existing Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!selectedTemplate && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">New Template Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Monthly Sustainability Report"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A comprehensive monthly report of our sustainability metrics..."
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createReport()}
            disabled={(!selectedTemplate && !name) || isPending}
          >
            {isPending ? "Creating..." : "Create Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
