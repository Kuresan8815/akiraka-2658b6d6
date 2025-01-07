import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RewardTierList } from "@/components/admin/rewards/RewardTierList";
import { RewardTierForm } from "@/components/admin/rewards/RewardTierForm";
import { RewardRedemptionList } from "@/components/admin/rewards/RewardRedemptionList";

export const AdminRewards = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);

  const handleEdit = (tier: any) => {
    setSelectedTier(tier);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedTier(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rewards & Loyalty Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>Add New Reward Tier</Button>
      </div>

      <Tabs defaultValue="tiers">
        <TabsList>
          <TabsTrigger value="tiers">Reward Tiers</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers">
          <Card className="p-6">
            <RewardTierList onEdit={handleEdit} />
          </Card>
        </TabsContent>

        <TabsContent value="redemptions">
          <Card className="p-6">
            <RewardRedemptionList />
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTier ? "Edit Reward Tier" : "Create New Reward Tier"}
            </DialogTitle>
          </DialogHeader>
          <RewardTierForm
            initialData={selectedTier}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};