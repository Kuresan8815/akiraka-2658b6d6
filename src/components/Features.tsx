import { QrCode, Gift, LineChart } from "lucide-react";

const features = [
  {
    title: "Transparency Through QR Codes",
    description: "Scan and see the lifecycle of your products.",
    icon: QrCode,
  },
  {
    title: "Earn Rewards",
    description: "Get points for making sustainable choices.",
    icon: Gift,
  },
  {
    title: "Track Impact",
    description: "Visualize your contribution to a greener planet.",
    icon: LineChart,
  },
];

export const Features = () => {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-eco-primary mb-8">
          Core Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-up bg-white"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-eco-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <feature.icon className="w-6 h-6 text-eco-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-eco-primary text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};