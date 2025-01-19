import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetGrid } from "../widgets/WidgetGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessWidget } from "@/types/widgets";

interface DashboardWidgetsProps {
  businessId: string;
  activeWidgets: BusinessWidget[];
}

export const DashboardWidgets = ({ businessId, activeWidgets }: DashboardWidgetsProps) => {
  // Get unique categories from active widgets
  const categories = [...new Set(activeWidgets.map(bw => bw.widget.category))];

  if (!categories.length) {
    return null;
  }

  return (
    <Tabs defaultValue={categories[0]} className="w-full">
      <TabsList>
        {categories.map((category) => (
          <TabsTrigger key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((category) => (
        <TabsContent key={category} value={category}>
          <WidgetGrid 
            businessId={businessId} 
            category={category}
            activeWidgets={activeWidgets.filter(bw => bw.widget.category === category)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};