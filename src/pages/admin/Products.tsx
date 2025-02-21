
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Filter, Plus } from 'lucide-react';
import { AddProductForm } from '@/components/admin/products/AddProductForm';
import { EditProductForm } from '@/components/admin/products/EditProductForm';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { useToast } from "@/components/ui/use-toast";
import { Product } from '@/types/product';
import { ProductGrid } from '@/components/product/ProductGrid';

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
      return data as Product[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      if (!selectedProduct) return;

      const { error: auditError } = await supabase
        .from("product_audit_logs")
        .insert({
          product_id: id,
          action: "delete",
          changes: JSON.stringify(selectedProduct)
        });

      if (auditError) throw auditError;

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

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-eco-primary">Product Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
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

      <ProductGrid 
        products={filteredProducts || []}
        onProductClick={handleProductClick}
      />

      {/* Modals */}
      {selectedProduct && (
        <>
          <ProductDetailsModal
            product={selectedProduct}
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false);
              setSelectedProduct(null);
            }}
            isAdmin={true}
          />

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
        </>
      )}
    </div>
  );
};
