import { Check } from "lucide-react";

const features = [
  {
    title: "Track Impact",
    description: "Monitor your carbon footprint progress.",
  },
  {
    title: "Set Goals",
    description: "Create personalized sustainability goals.",
  },
  {
    title: "Connect",
    description: "Join a community making a difference.",
  },
  {
    title: "Learn",
    description: "Access sustainable living resources.",
  },
];

export const Features = () => {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-eco-primary mb-8">
          Key Features
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-8 h-8 bg-eco-primary/10 rounded-full flex items-center justify-center mb-3">
                <Check className="w-4 h-4 text-eco-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1 text-eco-primary">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};