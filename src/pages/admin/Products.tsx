import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Pencil, Trash, Search, Filter, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { AddProductForm } from '@/components/admin/products/AddProductForm';
import { EditProductForm } from '@/components/admin/products/EditProductForm';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { useToast } from "@/components/ui/use-toast";
import { Product } from '@/types/product';

export const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<number | ''>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      // Create audit log entry first
      const { error: auditError } = await supabase
        .from("product_audit_logs")
        .insert({
          product_id: id,
          action: "delete",
          changes: selectedProduct,
        });

      if (auditError) throw auditError;

      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterScore === '' || product.sustainability_score >= filterScore;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <AddProductForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                refetch();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-48 relative">
          <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            placeholder="Min. sustainability score"
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value ? Number(e.target.value) : '')}
            className="pl-8"
            min="0"
            max="100"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts?.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {product.image_url && (
                <div className="aspect-video w-full mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.category || product.certification_level}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sustainability Score</span>
                  <span className="font-medium">{product.sustainability_score}/100</span>
                </div>
                {product.manufacture_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Manufactured</span>
                    <span className="font-medium">
                      {format(new Date(product.manufacture_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Added</span>
                  <span className="font-medium">
                    {format(new Date(product.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Edit Dialog */}
      {selectedProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <EditProductForm
              product={selectedProduct}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedProduct(null);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProduct && handleDelete(selectedProduct.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};