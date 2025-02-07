
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';

export const CreateUserForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<'admin' | 'business_user'>('business_user');
  const [accountLevel, setAccountLevel] = useState<'super_admin' | 'regional_admin' | 'business'>('business');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { 
          role,
          account_level: accountLevel
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        if (isAdmin) {
          const { error: adminError } = await supabase
            .from('admin_users')
            .insert([
              { 
                id: authData.user.id, 
                role,
                account_level: accountLevel
              }
            ]);

          if (adminError) throw adminError;
        }

        toast({
          title: "Success",
          description: "User created successfully",
        });

        setEmail('');
        setIsAdmin(false);
        setRole('business_user');
        setAccountLevel('business');
        onSuccess();
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

  return (
    <form onSubmit={handleCreateUser} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
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
        <Label htmlFor="isAdmin">Admin Access</Label>
        <Switch
          id="isAdmin"
          checked={isAdmin}
          onCheckedChange={setIsAdmin}
        />
      </div>

      {isAdmin && (
        <>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
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

          <div className="space-y-2">
            <Label htmlFor="accountLevel">Account Level</Label>
            <Select
              value={accountLevel}
              onValueChange={(value: 'super_admin' | 'regional_admin' | 'business') => setAccountLevel(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="regional_admin">Regional Admin</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
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
  );
};
