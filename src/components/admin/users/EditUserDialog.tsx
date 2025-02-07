
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditUserData {
  id: string;
  email: string;
  role: 'admin' | 'business_user';
  account_level: 'super_admin' | 'regional_admin' | 'business';
}

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userData: EditUserData | null;
  onUserDataChange: (data: EditUserData) => void;
  onSuccess: () => void;
}

export const EditUserDialog = ({
  isOpen,
  onOpenChange,
  userData,
  onUserDataChange,
  onSuccess,
}: EditUserDialogProps) => {
  const { toast } = useToast();

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          role: userData.role,
          account_level: userData.account_level
        })
        .eq('id', userData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!userData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user role and account level
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditUser} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={userData.email} disabled />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={userData.role}
              onValueChange={(value: 'admin' | 'business_user') => 
                onUserDataChange({ ...userData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="business_user">Business User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Account Level</Label>
            <Select
              value={userData.account_level}
              onValueChange={(value: 'super_admin' | 'regional_admin' | 'business') => 
                onUserDataChange({ ...userData, account_level: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="regional_admin">Regional Admin</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
