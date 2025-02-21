import React from 'react';
import { useForm } from 'react-hook-form';
import { format, isValid, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BulkProductUpload } from './BulkProductUpload';
import { Separator } from '@/components/ui/separator';

const categories = [
  'Apparel',
  'Electronics',
  'Food & Beverage',
  'Home & Garden',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Other'
];

const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  material_composition: z.string().min(1, "Material composition is required"),
  recyclability_percentage: z.number().min(0).max(100),
  carbon_footprint: z.number().min(0),
  manufacture_date: z.date({
    required_error: "Date of manufacture is required",
    invalid_type_error: "That's not a valid date!",
  }),
  origin: z.string().min(1, "Product origin is required"),
  image: z.any()
});

type FormValues = z.infer<typeof formSchema>;

export function AddProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [dateInput, setDateInput] = React.useState('');
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      material_composition: '',
      recyclability_percentage: 0,
      carbon_footprint: 0,
      manufacture_date: new Date(),
      origin: '',
    }
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    setDateInput(e.target.value);
    
    const parsedDate = parse(e.target.value, 'yyyy-MM-dd', new Date());
    
    if (isValid(parsedDate) && parsedDate <= new Date()) {
      field.onChange(parsedDate);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting form data:', data);

      if (data.manufacture_date > new Date()) {
        toast({
          title: 'Invalid Date',
          description: 'Manufacture date cannot be in the future.',
          variant: 'destructive',
        });
        return;
      }

      let imageUrl = null;
      if (data.image?.[0]) {
        const file = data.image[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const productData = {
        name: data.name,
        category: data.category,
        material_composition: data.material_composition,
        recyclability_percentage: data.recyclability_percentage,
        carbon_footprint: data.carbon_footprint,
        manufacture_date: data.manufacture_date.toISOString(),
        image_url: imageUrl,
        origin: data.origin,
        certification_level: 'Bronze',
        water_usage: 0,
        qr_code_id: crypto.randomUUID(),
        sustainability_score: 0,
      };

      console.log('Sending to Supabase:', productData);

      const { error } = await supabase.from('products').insert(productData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Product has been added successfully.',
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Add Single Product</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="material_composition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Composition</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., 100% Cotton" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recyclability_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recyclability Percentage</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carbon_footprint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbon Footprint (kg CO2)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                      min="0"
                      step="0.1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacture_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Manufacture</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateInput || (field.value ? format(field.value, 'yyyy-MM-dd') : '')}
                      onChange={(e) => handleDateInput(e, field)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[280px]",
                            !field.value && "text-muted-foreground"
                          )}
                          type="button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            if (date) {
                              setDateInput(format(date, 'yyyy-MM-dd'));
                            }
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Origin</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product origin (e.g., Country or Region)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </Button>
          </form>
        </Form>
      </div>

      <Separator className="my-6" />
      
      <BulkProductUpload />
    </div>
  );
}
