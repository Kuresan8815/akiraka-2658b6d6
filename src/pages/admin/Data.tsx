import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataEntryTable } from "@/components/admin/data/DataEntryTable";
import { BulkDataUpload } from "@/components/admin/data/BulkDataUpload";
import { APIIntegration } from "@/components/admin/data/APIIntegration";

export const AdminData = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Management</h1>
      </div>

      <Tabs defaultValue="environmental" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="environmental">
          <Card className="p-6">
            <DataEntryTable category="environmental" />
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="p-6">
            <DataEntryTable category="social" />
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card className="p-6">
            <DataEntryTable category="governance" />
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Upload</h2>
          <BulkDataUpload />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">API Integration</h2>
          <APIIntegration />
        </Card>
      </div>
    </div>
  );
};