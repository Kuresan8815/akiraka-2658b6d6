import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  rating: number;
  totalReviews: number;
}

export const PreferredBrandsWidget = () => {
  const { data: topBrands, isLoading } = useQuery({
    queryKey: ["top-brands"],
    queryFn: async () => {
      // Dummy data for demonstration
      return [
        { id: "1", name: "EcoFriendly Co.", rating: 4.8, totalReviews: 1250 },
        { id: "2", name: "GreenLife", rating: 4.6, totalReviews: 980 },
        { id: "3", name: "Sustainable Living", rating: 4.5, totalReviews: 856 },
        { id: "4", name: "Pure Earth", rating: 4.3, totalReviews: 742 }
      ] as Brand[];
    },
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    return stars;
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">Most Preferred Brands</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading brands...</p>
        ) : (
          <div className="space-y-4">
            {topBrands?.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-eco-primary">{brand.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(brand.rating)}
                    <span className="text-sm text-gray-500 ml-2">
                      ({brand.totalReviews} reviews)
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-eco-primary">
                  {brand.rating}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};