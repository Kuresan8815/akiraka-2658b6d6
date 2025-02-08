import { BusinessSelector } from "@/components/admin/BusinessSelector";

export const AdminSettings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Business Selection</h2>
          <p className="text-gray-600 mb-4">Switch between your businesses or create a new one</p>
          <BusinessSelector />
        </div>
      </div>
    </div>
  );
};