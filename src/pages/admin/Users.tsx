
import { UsersList } from "@/components/admin/users/UsersList";

export const AdminUsers = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-eco-primary">Users</h1>
      <UsersList />
    </div>
  );
};

export default AdminUsers;
