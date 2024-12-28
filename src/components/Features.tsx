import { Check } from "lucide-react";

const features = [
  {
    title: "Transparency Through QR Codes",
    description: "Scan and see the lifecycle of your products.",
    icon: Check,
  },
  {
    title: "Earn Rewards",
    description: "Get points for making sustainable choices.",
    icon: Check,
  },
  {
    title: "Track Impact",
    description: "Visualize your contribution to a greener planet.",
    icon: Check,
  },
  {
    title: "Connect & Learn",
    description: "Join a community making a difference.",
    icon: Check,
  },
];

export const Features = () => {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-eco-primary mb-8">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-up bg-white"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 bg-eco-primary/10 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-eco-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-eco-primary">
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