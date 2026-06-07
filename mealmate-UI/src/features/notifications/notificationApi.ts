import api from "@/services/api";

export interface NotificationDto {
  id: number;
  category: "FRIDGE" | "SHOPPING" | "MEAL" | "GROUP" | "SYSTEM";
  severity: "INFO" | "NORMAL" | "MEDIUM" | "HIGH";
  title: string;
  body: string;
  read: boolean;
  createdAt: string; // ISO datetime string
}

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

/** Lấy danh sách thông báo (tối đa 60, mới nhất trước). */
export async function fetchNotifications(): Promise<NotificationDto[]> {
  const res = await api.get("/api/v1/notifications", { headers: authHeader() });
  const payload = res.data;
  if (payload?.success && Array.isArray(payload.data)) return payload.data;
  return [];
}

/** Kiểm tra nhanh có thông báo chưa đọc không. */
export async function checkHasUnread(): Promise<boolean> {
  const res = await api.get("/api/v1/notifications/has-unread", { headers: authHeader() });
  return res.data?.data === true;
}

/** Đánh dấu tất cả đã đọc. */
export async function markAllRead(): Promise<void> {
  await api.put("/api/v1/notifications/read-all", {}, { headers: authHeader() });
}

/** Đánh dấu một thông báo đã đọc. */
export async function markOneRead(id: number): Promise<void> {
  await api.put(`/api/v1/notifications/${id}/read`, {}, { headers: authHeader() });
}
