
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { CreateUserForm } from '@/components/admin/users/CreateUserForm';
import { UserTable } from '@/components/admin/users/UserTable';
import { EditUserDialog } from '@/components/admin/users/EditUserDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'business_user';
  account_level: 'super_admin' | 'regional_admin' | 'business';
  created_at: string;
}

interface EditUserData {
  id: string;
  email: string;
  role: 'admin' | 'business_user';
  account_level: 'super_admin' | 'regional_admin' | 'business';
}

export const UserMgt = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<EditUserData | null>(null);

  // Check if current user is super admin
  const { data: isSuperAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['is-super-admin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data: isSuper, error } = await supabase
        .rpc('is_super_admin_no_rls', {
          user_id: user.id
        });
        
      if (error) throw error;
      return isSuper;
    },
  });

  // Fetch admin users
  const { data: adminUsers, isLoading: isLoadingUsers, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('Fetching admin users...');
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

      if (adminError) {
        console.error('Error fetching admin users:', adminError);
        throw adminError;
      }
      
      console.log('Admin users data:', adminData);
      
      // Transform the data to match our AdminUser interface
      return adminData.map((user: any) => ({
        id: user.id,
        email: user.auth_users.email,
        role: user.role,
        account_level: user.account_level,
        created_at: user.created_at,
      })) as AdminUser[];
    },
    enabled: isSuperAdmin, // Only fetch if user is super admin
  });

  if (isCheckingAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You do not have permission to access this page. Super admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {usersError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {(usersError as Error).message || 'Failed to load users'}
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New User</h2>
        <CreateUserForm onSuccess={refetchUsers} />
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Manage Users</h2>
        {isLoadingUsers ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <UserTable 
            users={adminUsers || []} 
            onEdit={(user) => {
              setEditUserData(user);
              setIsEditDialogOpen(true);
            }}
            onSuccess={refetchUsers}
          />
        )}
      </Card>

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        userData={editUserData}
        onUserDataChange={setEditUserData}
        onSuccess={refetchUsers}
      />
    </div>
  );
};
