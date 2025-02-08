import { CategoryFilter } from "./CategoryFilter";

interface WidgetMetricsHeaderProps {
  selectedCategory: 'environmental' | 'social' | 'governance' | null;
  onCategoryChange: (category: 'environmental' | 'social' | 'governance' | null) => void;
}

export const WidgetMetricsHeader = ({
  selectedCategory,
  onCategoryChange,
}: WidgetMetricsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Active Widgets</h2>
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
    </div>
  );
};