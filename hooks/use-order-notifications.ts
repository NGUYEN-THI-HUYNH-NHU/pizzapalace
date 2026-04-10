"use client";

import { useNotificationContext } from "@/providers/notification-provider";

export const useOrderNotifications = () => useNotificationContext();

export type { OrderNotification } from "@/providers/notification-provider";