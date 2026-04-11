"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { OrderStatus } from "@/type";

type SessionResponse = {
    id?: string;
};

export type OrderNotification = {
    id: string;
    orderId: string;
    title: string;
    message: string;
    status: OrderStatus;
    createdAt: string;
    read: boolean;
};

type CreateOrderNotificationInput = {
    orderId: string;
    status: OrderStatus;
    title: string;
    message: string;
};

type NotificationContextValue = {
    notifications: OrderNotification[];
    unreadCount: number;
    addNotification: (input: CreateOrderNotificationInput) => OrderNotification;
    markAllAsRead: () => void;
    clearNotifications: () => void;
};

type RealtimeOrderPayload = {
    order?: {
        id: string;
        status: OrderStatus;
    };
};

const STORAGE_KEY = "pizzapalace-order-notifications";
const MAX_NOTIFICATIONS = 10;

const NotificationContext = createContext<NotificationContextValue | null>(null);

const readNotifications = (): OrderNotification[] => {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const rawValue = window.localStorage.getItem(STORAGE_KEY);
        if (!rawValue) {
            return [];
        }

        const parsed = JSON.parse(rawValue) as OrderNotification[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING:
            return "Đơn hàng đã được tiếp nhận.";
        case OrderStatus.PREPARING:
            return "Đơn hàng đang được chuẩn bị.";
        case OrderStatus.DELIVERING:
            return "Đơn hàng đang được giao.";
        case OrderStatus.COMPLETED:
            return "Đơn hàng đã hoàn tất.";
        case OrderStatus.CANCELLED:
            return "Đơn hàng đã bị hủy.";
        default:
            return "Đơn hàng vừa được cập nhật.";
    }
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<OrderNotification[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const notificationsRef = useRef<OrderNotification[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    const commitNotifications = useCallback((nextNotifications: OrderNotification[]) => {
        notificationsRef.current = nextNotifications;
        setNotifications(nextNotifications);

        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotifications));
    }, []);

    const addNotification = useCallback((input: CreateOrderNotificationInput) => {
        const nextNotification: OrderNotification = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            orderId: input.orderId,
            title: input.title,
            message: input.message,
            status: input.status,
            createdAt: new Date().toISOString(),
            read: false,
        };

        const nextNotifications = [nextNotification, ...notificationsRef.current].slice(0, MAX_NOTIFICATIONS);
        commitNotifications(nextNotifications);

        return nextNotification;
    }, [commitNotifications]);

    const markAllAsRead = useCallback(() => {
        const nextNotifications = notificationsRef.current.map((item) => ({ ...item, read: true }));
        commitNotifications(nextNotifications);
    }, [commitNotifications]);

    const clearNotifications = useCallback(() => {
        commitNotifications([]);
    }, [commitNotifications]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const nextNotifications = readNotifications();
            notificationsRef.current = nextNotifications;
            setNotifications(nextNotifications);
        }, 0);

        const syncFromStorage = () => {
            const nextNotifications = readNotifications();
            notificationsRef.current = nextNotifications;
            setNotifications(nextNotifications);
        };

        window.addEventListener("storage", syncFromStorage);

        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener("storage", syncFromStorage);
        };
    }, []);

    useEffect(() => {
        const syncSession = async () => {
            try {
                const response = await fetch("/api/auth/session", { cache: "no-store" });

                if (!response.ok) {
                    setUserId(null);
                    return;
                }

                const session = (await response.json().catch(() => null)) as SessionResponse | null;
                setUserId(typeof session?.id === "string" ? session.id.trim() : null);
            } catch {
                setUserId(null);
            }
        };

        void syncSession();

        const handleAuthChanged = () => {
            void syncSession();
        };

        window.addEventListener("auth-state-changed", handleAuthChanged);

        return () => {
            window.removeEventListener("auth-state-changed", handleAuthChanged);
        };
    }, []);

    useEffect(() => {
        const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;

        socketRef.current?.disconnect();
        socketRef.current = null;

        if (!realtimeUrl || !userId) {
            return;
        }

        const socket = io(realtimeUrl, {
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join:user", { userId });
        });

        socket.on("order:updated", (payload: RealtimeOrderPayload) => {
            const incomingOrder = payload?.order;

            if (!incomingOrder) {
                return;
            }

            const message = getStatusMessage(incomingOrder.status);

            addNotification({
                orderId: incomingOrder.id,
                status: incomingOrder.status,
                title: `Đơn hàng ${incomingOrder.id}`,
                message,
            });

            toast.success(message, { duration: 5000, position: 'bottom-right' });
        });

        return () => {
            socket.disconnect();
        };
    }, [addNotification, userId]);

    const value = useMemo<NotificationContextValue>(() => {
        return {
            notifications,
            unreadCount: notifications.filter((item) => !item.read).length,
            addNotification,
            markAllAsRead,
            clearNotifications,
        };
    }, [notifications, addNotification, markAllAsRead, clearNotifications]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error("useNotificationContext must be used within NotificationProvider");
    }

    return context;
};