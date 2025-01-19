import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetGrid } from "../widgets/WidgetGrid";

interface DashboardWidgetsProps {
  businessId: string;
}

export const DashboardWidgets = ({ businessId }: DashboardWidgetsProps) => {
  return (
    <Tabs defaultValue="environmental" className="w-full">
      <TabsList>
        <TabsTrigger value="environmental">Environmental</TabsTrigger>
        <TabsTrigger value="social">Social</TabsTrigger>
        <TabsTrigger value="governance">Governance</TabsTrigger>
      </TabsList>
      <TabsContent value="environmental">
        <WidgetGrid 
          businessId={businessId} 
          category="environmental" 
        />
      </TabsContent>
      <TabsContent value="social">
        <WidgetGrid 
          businessId={businessId} 
          category="social" 
        />
      </TabsContent>
      <TabsContent value="governance">
        <WidgetGrid 
          businessId={businessId} 
          category="governance" 
        />
      </TabsContent>
    </Tabs>
  );
};