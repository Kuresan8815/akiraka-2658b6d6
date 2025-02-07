
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, UserCog } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'business_user';
  account_level: 'super_admin' | 'regional_admin' | 'business';
  created_at: string;
}

export const AdminUsers = () => {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<'admin' | 'business_user'>('business_user');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch admin users
  const { data: adminUsers, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          id,
          role,
          account_level,
          created_at,
          auth_users:id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;
      
      // Transform the data to match our AdminUser interface
      return adminData.map((user: any) => ({
        id: user.id,
        email: user.auth_users.email,
        role: user.role,
        account_level: user.account_level,
        created_at: user.created_at,
      })) as AdminUser[];
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First create the user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { role }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Then create the admin user record if needed
        if (isAdmin) {
          const { error: adminError } = await supabase
            .from('admin_users')
            .insert([
              { id: authData.user.id, role }
            ]);

          if (adminError) throw adminError;
        }

        toast({
          title: "Success",
          description: "User created successfully",
        });

        // Reset form and refresh user list
        setEmail('');
        setIsAdmin(false);
        setRole('business_user');
        refetchUsers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <Card className="p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New User</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="isAdmin" className="text-sm font-medium">
              Admin Access
            </label>
            <Switch
              id="isAdmin"
              checked={isAdmin}
              onCheckedChange={setIsAdmin}
            />
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select
                value={role}
                onValueChange={(value: 'admin' | 'business_user') => setRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="business_user">Business User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Manage Users</h2>
        {isLoadingUsers ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Account Level</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="capitalize">
                    {user.account_level.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleResetPassword(user.email)}
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

