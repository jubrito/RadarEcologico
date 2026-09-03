"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, TriangleAlert, X } from "lucide-react";
import { mergeStyles } from "@/lib/utils/utils";

type NotificationKind = "error" | "success" | "info";

export interface NotificationOptions {
  message: string;
  kind?: NotificationKind;
  persistence?: "temporary" | "permanent";
  duration?: number;
}

interface Notification extends NotificationOptions {
  id: number;
}

interface NotificationContextValue {
  notify: (options: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notify: () => undefined,
});

export function NotificationToaster({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }, []);

  const notify = useCallback((options: NotificationOptions) => {
    const notification = { ...options, id: Date.now() + Math.random() };
    setNotifications((current) => [...current, notification].slice(-3));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div
        aria-label="Notificações"
        className="fixed top-4 right-1/2 left-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[min(30rem,calc(100%-2rem))] -translate-x-1/2 flex-col gap-3 overflow-y-auto"
      >
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: number) => void;
}) {
  const {
    id,
    kind = "info",
    persistence = "temporary",
    duration = 6000,
    message,
  } = notification;

  useEffect(() => {
    if (persistence === "permanent") return;
    const timeout = window.setTimeout(() => onDismiss(id), duration);
    return () => window.clearTimeout(timeout);
  }, [duration, id, onDismiss, persistence]);

  const Icon = kind === "error" ? TriangleAlert : CheckCircle2;
  const role = kind === "error" ? "alert" : "status";

  return (
    <div
      role={role}
      className={mergeStyles(
        `flex items-start gap-2 rounded-lg border border-border bg-card p-4 text-sm shadow-lg`,
        notification.kind === "error" && "bg-red-800 text-white",
        notification.kind === "success" && "bg-lime-500 text-black",
        notification.kind === "info" && "bg-gray-400 text-black",
      )}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      <p className="flex-1 font-bold">{message}</p>
      <button
        type="button"
        aria-label="Fechar notificação"
        className="rounded-sm text-muted-foreground hover:text-foreground leading-4"
        onClick={() => onDismiss(id)}
      >
        <X
          aria-hidden="true"
          className={mergeStyles(
            "size-4.5 text-foreground",
            notification.kind === "error" && "text-white",
            (notification.kind === "success" || notification.kind === "info") &&
              "text-black",
          )}
        />
      </button>
    </div>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
