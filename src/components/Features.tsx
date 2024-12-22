import { Check } from "lucide-react";

const features = [
  {
    title: "Track Your Impact",
    description: "Monitor your carbon footprint and see your progress over time.",
  },
  {
    title: "Set Goals",
    description: "Create personalized sustainability goals and track achievements.",
  },
  {
    title: "Connect & Share",
    description: "Join a community of like-minded individuals making a difference.",
  },
  {
    title: "Learn & Grow",
    description: "Access resources and tips for sustainable living.",
  },
];

export const Features = () => {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-eco-primary mb-16">
          Everything You Need to Live Sustainably
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-eco-primary/10 rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-eco-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-eco-primary">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};