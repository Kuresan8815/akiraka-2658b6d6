import { MetricCard } from "./MetricCard";
import { Leaf, Droplet } from "lucide-react";

interface StatsGridProps {
  totalCarbonSaved: number;
  totalWaterSaved: number;
}

export const StatsGrid = ({ totalCarbonSaved, totalWaterSaved }: StatsGridProps) => (
  <div className="grid gap-6 md:grid-cols-2">
    <div className="transform hover:scale-105 transition-all duration-200">
      <MetricCard
        title="Carbon Footprint Saved"
        value={`${totalCarbonSaved.toFixed(1)} kg`}
        icon={Leaf}
        description="Total CO₂ emissions reduced"
        iconPosition="right"
      />
    </div>
    <div className="transform hover:scale-105 transition-all duration-200">
      <MetricCard
        title="Water Usage Saved"
        value={`${totalWaterSaved.toFixed(0)} L`}
        icon={Droplet}
        description="Total water conservation impact"
        iconPosition="left"
      />
    </div>
  </div>
);