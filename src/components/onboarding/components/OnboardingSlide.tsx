import { LucideIcon } from "lucide-react";

interface OnboardingSlideProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

export const OnboardingSlide = ({
  title,
  description,
  icon: Icon,
  children,
}: OnboardingSlideProps) => {
  return (
    <div className="w-full flex-shrink-0">
      <div className="flex flex-col items-center gap-4 text-center p-4">
        <div className="w-16 h-16 bg-eco-primary/10 rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-eco-primary" />
        </div>
        <h3 className="text-xl font-bold text-eco-primary">{title}</h3>
        <p className="text-gray-600">{description}</p>
        {children}
      </div>
    </div>
  );
};