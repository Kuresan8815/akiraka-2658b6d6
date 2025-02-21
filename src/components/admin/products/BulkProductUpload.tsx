
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

export function BulkProductUpload() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const products = results.data.map((row: any) => ({
            name: row.name,
            category: row.category,
            material_composition: row.material_composition,
            recyclability_percentage: Number(row.recyclability_percentage),
            carbon_footprint: Number(row.carbon_footprint),
            manufacture_date: new Date(row.manufacture_date).toISOString(),
            origin: row.origin,
            certification_level: row.certification_level || 'Bronze',
            water_usage: Number(row.water_usage) || 0,
            qr_code_id: crypto.randomUUID(),
            sustainability_score: Number(row.sustainability_score) || 0,
          }));

          const { error } = await supabase.from('products').insert(products);

          if (error) throw error;

          toast({
            title: 'Success',
            description: `Successfully uploaded ${products.length} products.`,
          });
        },
        error: (error) => {
          throw new Error(error.message);
        },
      });
    } catch (error) {
      console.error('Error uploading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload products. Please check your CSV file format.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Bulk Upload Products</h3>
      <p className="text-sm text-gray-500">
        Upload a CSV file with product details. The CSV should include columns: name, category, 
        material_composition, recyclability_percentage, carbon_footprint, manufacture_date, origin
      </p>
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
    </div>
  );
}
