import { MetricCard } from "./MetricCard";
import { Leaf, Droplet } from "lucide-react";

interface StatsGridProps {
  totalCarbonSaved: number;
  totalWaterSaved: number;
}

export const StatsGrid = ({ totalCarbonSaved, totalWaterSaved }: StatsGridProps) => (
  <div className="grid gap-4 md:grid-cols-2">
    <MetricCard
      title="Carbon Footprint Saved"
      value={`${totalCarbonSaved.toFixed(1)} kg`}
      icon={Leaf}
    />
    <MetricCard
      title="Water Usage Saved"
      value={`${totalWaterSaved.toFixed(0)} L`}
      icon={Droplet}
    />
  </div>
);