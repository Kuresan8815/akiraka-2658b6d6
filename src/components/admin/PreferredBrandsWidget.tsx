
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, StarHalf, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
      try {
        // Fetch data from businesses and calculate ratings based on scans
        const { data: businesses, error } = await supabase
          .from('businesses')
          .select(`
            id,
            name,
            products!inner (
              id
            ),
            scan_history!inner (
              id
            )
          `)
          .eq('is_active', true)
          .limit(4);
        
        if (error) throw error;
        
        if (!businesses || businesses.length === 0) {
          // Return sample data if no real data exists
          return [
            { id: "1", name: "EcoFriendly Co.", rating: 4.8, totalReviews: 1250 },
            { id: "2", name: "GreenLife", rating: 4.6, totalReviews: 980 },
            { id: "3", name: "Sustainable Living", rating: 4.5, totalReviews: 856 },
            { id: "4", name: "Pure Earth", rating: 4.3, totalReviews: 742 }
          ] as Brand[];
        }
        
        // Transform the data to match our interface
        return businesses.map(business => {
          // Calculate rating based on some metrics (e.g., scan count)
          const scanCount = business.scan_history ? business.scan_history.length : 0;
          const productCount = business.products ? business.products.length : 0;
          
          // Generate a rating between 4.0 and 5.0 based on scan count and product count
          const rating = 4.0 + Math.min(1.0, (scanCount + productCount) / 100);
          
          return {
            id: business.id,
            name: business.name,
            rating: parseFloat(rating.toFixed(1)),
            totalReviews: scanCount
          };
        });
      } catch (error) {
        console.error("Error fetching top brands:", error);
        return [];
      }
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
        ) : !topBrands || topBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 font-medium">No brand data available</p>
            <p className="text-sm text-gray-400">Add businesses and products to start tracking brand performance</p>
          </div>
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
