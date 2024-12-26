import { Gift, Lightbulb, Store } from "lucide-react";
import { NotificationType } from "@/types/notifications";

export const notificationTypes: NotificationType[] = [
  {
    id: "rewards",
    label: "Rewards Notifications",
    description: "Get notified about new rewards and points",
    icon: Gift,
  },
  {
    id: "sustainability_tips",
    label: "Sustainability Tips",
    description: "Receive helpful tips for sustainable living",
    icon: Lightbulb,
  },
  {
    id: "store_alerts",
    label: "Store Alerts",
    description: "Updates about store events and promotions",
    icon: Store,
  },
];