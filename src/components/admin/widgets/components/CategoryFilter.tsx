import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

type Category = 'environmental' | 'social' | 'governance' | null;

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {selectedCategory ? selectedCategory : "All Categories"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onCategoryChange(null)}>
          All Categories
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCategoryChange("environmental")}>
          Environmental
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCategoryChange("social")}>
          Social
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCategoryChange("governance")}>
          Governance
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};