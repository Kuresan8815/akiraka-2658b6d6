import { QrCode, Gift, LineChart } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: QrCode,
      title: "Product Transparency",
      description: "Scan and discover the environmental impact of products instantly"
    },
    {
      icon: Gift,
      title: "Earn Rewards",
      description: "Get rewarded for making sustainable choices and tracking your impact"
    },
    {
      icon: LineChart,
      title: "Track Progress",
      description: "Monitor your sustainability journey with detailed insights and metrics"
    }
  ];

  return (
    <div className="py-16 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-3 rounded-full bg-eco-primary/10 mb-4">
                  <Icon className="h-6 w-6 text-eco-primary" />
                </div>
                <h3 className="text-lg font-semibold text-eco-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};