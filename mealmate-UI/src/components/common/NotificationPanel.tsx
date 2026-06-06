import React, { useCallback, useEffect, useRef, useState } from "react";
import "./NotificationPanel.css";
import {
  checkHasUnread,
  fetchNotifications,
  markAllRead,
  markOneRead,
  type NotificationDto,
} from "@/features/notifications/notificationApi";

// ─── Types ────────────────────────────────────────────────
type NotifCategory = NotificationDto["category"];
type Variant = "user" | "admin";

interface NotificationPanelProps {
  variant?: Variant;
}

// ─── Helpers ──────────────────────────────────────────────
const CATEGORY_META: Record<NotifCategory, { label: string; color: string; bg: string }> = {
  FRIDGE:   { label: "Tủ lạnh",      color: "#0e7490", bg: "#e0f2fe" },
  SHOPPING: { label: "Kế hoạch chợ", color: "#7c3aed", bg: "#ede9fe" },
  MEAL:     { label: "Bữa ăn",       color: "#0e9a7e", bg: "#d1fae5" },
  GROUP:    { label: "Nhóm gia đình", color: "#b45309", bg: "#fef3c7" },
  SYSTEM:   { label: "Hệ thống",     color: "#9f1239", bg: "#ffe4e6" },
};

const SEVERITY_DOT: Record<NotificationDto["severity"], string> = {
  INFO:   "#3b82f6",
  NORMAL: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH:   "#ef4444",
};

function relativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;
    return new Date(isoString).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

/** Icon chuông cute — đường cong mềm mại, có ngôi sao nhỏ */
const BellIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M12 3.5C9.24 3.5 7 5.74 7 8.5v5l-1.5 1.5v.5h13v-.5L17 13.5v-5C17 5.74 14.76 3.5 12 3.5Z"
      fill="currentColor" opacity="0.18"
    />
    <path
      d="M12 3.5C9.24 3.5 7 5.74 7 8.5v5l-1.5 1.5v.5h13v-.5L17 13.5v-5C17 5.74 14.76 3.5 12 3.5Z"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    />
    <path d="M10.5 19.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M12 3.5V2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    {/* Ngôi sao nhỏ cute */}
    <path d="M19 5l.4 1 1 .4-1 .4L19 8l-.4-1.2-1-.4 1-.4L19 5Z" fill="currentColor" opacity="0.7" />
  </svg>
);

// ─── Component ────────────────────────────────────────────
const NotificationPanel: React.FC<NotificationPanelProps> = ({ variant = "user" }) => {
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotifCategory | "all">("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number | null>(null);

  // ── Polling has-unread (nhẹ, 30s) ─────────────────────
  const pollUnread = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || token === "null") return;
    try {
      const unread = await checkHasUnread();
      setHasUnread(unread);
    } catch {
      // bỏ qua lỗi mạng
    }
  }, []);

  useEffect(() => {
    pollUnread();
    pollRef.current = window.setInterval(pollUnread, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollUnread]);

  // ── Load full list khi mở panel ───────────────────────
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  // ── Đóng khi click ngoài ──────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Đánh dấu tất cả đã đọc ───────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setHasUnread(false);
    } catch {
      // bỏ qua
    }
  };

  // ── Click vào một thông báo ───────────────────────────
  const handleItemClick = async (notif: NotificationDto) => {
    if (!notif.read) {
      try {
        await markOneRead(notif.id);
        setItems((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        const stillUnread = items.some((n) => n.id !== notif.id && !n.read);
        setHasUnread(stillUnread);
      } catch {
        // bỏ qua
      }
    }
  };

  const visibleItems =
    activeCategory === "all"
      ? items
      : items.filter((n) => n.category === activeCategory);

  const categories = Array.from(new Set(items.map((n) => n.category))) as NotifCategory[];
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="np-root" ref={panelRef}>
      {/* ── Bell trigger ──────────────────── */}
      <button
        type="button"
        className={`np-trigger ${variant === "admin" ? "np-trigger-admin" : "np-trigger-user"}`}
        aria-label="Thông báo"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon />
        {hasUnread && <span className="np-dot" aria-label="Có thông báo mới" />}
      </button>

      {/* ── Dropdown panel ────────────────── */}
      {open && (
        <div
          className={`np-panel ${variant === "admin" ? "np-panel-admin" : ""}`}
          role="dialog"
          aria-label="Thông báo"
        >
          {/* Header */}
          <div className="np-header">
            <div className="np-header-left">
              <span className="np-header-title">Thông báo</span>
              {unreadCount > 0 && (
                <span className="np-unread-pill">{unreadCount} mới</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button type="button" className="np-mark-all" onClick={handleMarkAllRead}>
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Category chips */}
          {categories.length > 0 && (
            <div className="np-chips" role="group" aria-label="Lọc thông báo">
              <button
                type="button"
                className={`np-chip ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                Tất cả
              </button>
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`np-chip ${activeCategory === cat ? "active" : ""}`}
                    style={
                      activeCategory === cat
                        ? { background: meta.bg, color: meta.color, borderColor: meta.color + "55" }
                        : {}
                    }
                    onClick={() => setActiveCategory(cat)}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* List */}
          <div className="np-list" role="list">
            {loading && (
              <div className="np-loading">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="np-skeleton-item">
                    <div className="np-skeleton-dot" />
                    <div className="np-skeleton-body">
                      <div className="np-skeleton-line long" />
                      <div className="np-skeleton-line short" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && visibleItems.length === 0 && (
              <div className="np-empty">
                <span className="np-empty-icon">🔔</span>
                <p>Không có thông báo nào</p>
              </div>
            )}

            {!loading &&
              visibleItems.map((notif, idx) => {
                const meta = CATEGORY_META[notif.category];
                return (
                  <div
                    key={notif.id}
                    className={`np-item ${notif.read ? "np-item-read" : "np-item-unread"}`}
                    style={{ animationDelay: `${idx * 25}ms` }}
                    role="listitem"
                    onClick={() => handleItemClick(notif)}
                  >
                    <span
                      className="np-severity-dot"
                      style={{ background: SEVERITY_DOT[notif.severity] }}
                      aria-hidden="true"
                    />

                    <div className="np-item-body">
                      <div className="np-item-top">
                        <span className="np-item-title">{notif.title}</span>
                        <span
                          className="np-item-cat"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="np-item-desc">{notif.body}</p>
                      <span className="np-item-time">{relativeTime(notif.createdAt)}</span>
                    </div>

                    {!notif.read && <span className="np-unread-dot" aria-hidden="true" />}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
