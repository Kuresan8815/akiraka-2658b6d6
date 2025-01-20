import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualDataEntry } from "@/components/admin/data/ManualDataEntry";
import { BulkDataUpload } from "@/components/admin/data/BulkDataUpload";
import { APIIntegration } from "@/components/admin/data/APIIntegration";

export const AdminData = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Management</h1>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card className="p-6">
            <ManualDataEntry />
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card className="p-6">
            <BulkDataUpload />
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="p-6">
            <APIIntegration />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};