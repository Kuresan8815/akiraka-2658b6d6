import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetGrid } from "../widgets/WidgetGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetCategories } from "@/hooks/useWidgetCategories";

interface DashboardWidgetsProps {
  businessId: string;
}

export const DashboardWidgets = ({ businessId }: DashboardWidgetsProps) => {
  const { data: activeCategories, isLoading } = useWidgetCategories(businessId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-[300px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!activeCategories?.length) {
    return null;
  }

  return (
    <Tabs defaultValue={activeCategories[0]} className="w-full">
      <TabsList>
        {activeCategories.map((category) => (
          <TabsTrigger key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>
      {activeCategories.map((category) => (
        <TabsContent key={category} value={category}>
          <WidgetGrid 
            businessId={businessId} 
            category={category} 
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};