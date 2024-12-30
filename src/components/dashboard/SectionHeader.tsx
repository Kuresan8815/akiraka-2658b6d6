import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionHeader = ({ children, className }: SectionHeaderProps) => {
  return (
    <h2 
      className={cn(
        "text-lg font-bold text-white mb-4 uppercase bg-eco-primary px-4 py-2 rounded-lg shadow-md",
        className
      )}
    >
      {children}
    </h2>
  );
};