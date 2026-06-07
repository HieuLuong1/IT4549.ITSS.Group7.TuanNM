import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { uploadFile } from "@/features/uploads/uploadApi";
import "./ProfileModal.css";
import defaultAvatar from "@/assets/avatar/26.svg";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyName?: string;
  memberData?: any;
  isMe?: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen, onClose, familyName, memberData, isMe = false,
}) => {
  const navigate = useNavigate();
  const { user: userFromContext, logout: logoutFromContext } = useAuth() as any;

  const userFromLocalStorage = (() => {
    try { return JSON.parse(localStorage.getItem("authUser") || "null"); }
    catch { return null; }
  })();

  const displayUser = memberData || (isMe ? (userFromContext || userFromLocalStorage) : null);

  // ── Form state ──────────────────────────────────────────
  const [isEditing, setIsEditing]           = useState(false);
  const [editFullName, setEditFullName]      = useState("");
  const [editPhone, setEditPhone]            = useState("");
  const [editGender, setEditGender]          = useState("OTHER");
  const [editPassword, setEditPassword]      = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting]      = useState(false);

  // ── Avatar upload ───────────────────────────────────────
  const [avatarPreview, setAvatarPreview]       = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && displayUser) {
      setEditFullName(displayUser?.fullName || displayUser?.full_name || "");
      setEditPhone(displayUser?.phone || displayUser?.phoneNumber || "");
      setEditGender(String(displayUser?.gender || "OTHER").toUpperCase());
      setEditPassword("");
      setConfirmPassword("");
      setAvatarPreview("");
      setIsEditing(false);
    }
  }, [isOpen]);

  if (!isOpen || !displayUser) return null;

  const email            = displayUser?.email || "Chưa cập nhật";
  const currentAvatarUrl = displayUser?.avatarUrl || displayUser?.avatar_url || defaultAvatar;
  const shownAvatar      = avatarPreview || currentAvatarUrl;

  const roleObj   = displayUser?.role;
  const roleName  = (typeof roleObj === "object" && roleObj !== null ? roleObj.name : roleObj) || displayUser?.roleName || "";
  const norm      = String(roleName).toUpperCase();
  const roleLabel = norm.includes("ADMIN") ? "Quản trị viên"
                  : norm.includes("HOUSEKEEPER") ? "Chủ nhà"
                  : "Thành viên";

  const genderLabel = editGender === "MALE" ? "Nam" : editGender === "FEMALE" ? "Nữ" : "Khác";

  // ── Avatar upload ───────────────────────────────────────
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh (jpg, png, webp...)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5 MB");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const result = await uploadFile(file, "mealmate/avatars");
      setAvatarPreview(result.url);
      toast.success("Ảnh đã tải lên — nhấn Lưu để cập nhật.");
    } catch {
      toast.error("Không tải được ảnh. Vui lòng thử lại!");
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // ── Save ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editFullName.trim()) { toast.error("Họ và tên không được để trống!"); return; }
    const hasNewPwd = editPassword.trim().length > 0 || confirmPassword.trim().length > 0;
    if (hasNewPwd) {
      if (editPassword.trim().length < 6) { toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!"); return; }
      if (editPassword.trim() !== confirmPassword.trim()) { toast.error("Xác nhận mật khẩu không khớp!"); return; }
    }
    const token = localStorage.getItem("accessToken");
    setIsSubmitting(true);
    try {
      const payload: any = {
        fullName: editFullName.trim(), full_name: editFullName.trim(),
        phone: editPhone.trim(), phoneNumber: editPhone.trim(), phone_number: editPhone.trim(),
        gender: editGender,
      };
      if (avatarPreview) payload.avatarUrl = avatarPreview;
      if (hasNewPwd)     payload.password  = editPassword.trim();

      const res = await api.put("/api/v1/users/users/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);

        // Lấy avatarUrl chính xác từ response backend (đã lưu DB)
        // Fallback sang avatarPreview (URL Cloudinary) nếu backend chưa trả về
        const savedAvatarUrl: string =
          res.data?.data?.avatarUrl || avatarPreview || currentAvatarUrl;

        const currentUserId = userFromLocalStorage?.userId || userFromLocalStorage?.id;

        // 1. Cập nhật authUser trong localStorage
        if (userFromLocalStorage) {
          localStorage.setItem("authUser", JSON.stringify({
            ...userFromLocalStorage,
            fullName: editFullName.trim(), full_name: editFullName.trim(),
            phone: editPhone.trim(), gender: editGender,
            avatarUrl: savedAvatarUrl,
            avatar_url: savedAvatarUrl,
          }));
        }

        // 2. Cập nhật familyMembersCache trong localStorage
        // (Sidebar.tsx và các component khác đọc cache này → phải đồng bộ)
        if (savedAvatarUrl && currentUserId) {
          try {
            const cacheRaw = localStorage.getItem("familyMembersCache");
            if (cacheRaw) {
              const cache = JSON.parse(cacheRaw);
              if (Array.isArray(cache)) {
                const updated = cache.map((m: any) =>
                  Number(m.id) === Number(currentUserId)
                    ? { ...m, avatarUrl: savedAvatarUrl, avatar_url: savedAvatarUrl,
                            fullName: editFullName.trim(), phone: editPhone.trim(), gender: editGender }
                    : m
                );
                localStorage.setItem("familyMembersCache", JSON.stringify(updated));
              }
            }
          } catch {
            // bỏ qua lỗi cache
          }
        }

        window.location.reload();
      } else {
        toast.error(res.data?.message || "Không thể lưu thông tin.");
      }
    } catch {
      toast.error("Hệ thống từ chối cập nhật! Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Bạn có chắc muốn đăng xuất không?")) return;
    if (typeof logoutFromContext === "function") logoutFromContext();
    else ["accessToken", "authUser", "currentFamilyName"].forEach((k) => localStorage.removeItem(k));
    onClose();
    navigate("/login");
    window.location.reload();
  };

  const handleCancel = () => {
    setAvatarPreview("");
    setEditPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  return createPortal(
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-card" onClick={(e) => e.stopPropagation()}>

        {/* Close btn */}
        <button className="pm-close" onClick={onClose} aria-label="Đóng">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Tag */}
        <div className="pm-tag-row">
          <span className="pm-tag">{isMe ? "THÔNG TIN TÀI KHOẢN" : "THÔNG TIN THÀNH VIÊN"}</span>
        </div>

        {/* Body */}
        <div className="pm-body">

          {/* Sidebar */}
          <div className="pm-sidebar">
            <div className="pm-avatar-wrap">
              <img
                className="pm-avatar-img"
                src={shownAvatar}
                alt="Avatar"
                onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
              />
              {isMe && isEditing && (
                <>
                  <button
                    type="button"
                    className={`pm-avatar-cam ${isUploadingAvatar ? "spinning" : ""}`}
                    onClick={() => avatarInputRef.current?.click()}
                    aria-label="Thay ảnh đại diện"
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/>
                        <circle cx="12" cy="13" r="3"/>
                      </svg>
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarFileChange}
                  />
                </>
              )}
            </div>

            <div className="pm-sidebar-meta">
              <h3 className="pm-username">
                {isEditing ? (editFullName || "—") : (displayUser?.fullName || displayUser?.full_name || "—")}
              </h3>
              <span className="pm-role-pill">{roleLabel}</span>
              {familyName && <span className="pm-family-hint">{familyName}</span>}
            </div>
          </div>

          {/* Content */}
          <div className="pm-content">
            <p className="pm-section-title">Thông tin chi tiết</p>

            <div className="pm-grid">

              <div className="pm-field">
                <span className="pm-label">Họ và tên</span>
                {isEditing
                  ? <input className="pm-input" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
                  : <span className="pm-value">{displayUser?.fullName || displayUser?.full_name || "—"}</span>}
              </div>

              <div className="pm-field">
                <span className="pm-label">Email</span>
                {isEditing
                  ? <input className="pm-input pm-input-lock" value={email} disabled />
                  : <span className="pm-value">{email}</span>}
              </div>

              <div className="pm-field">
                <span className="pm-label">Số điện thoại</span>
                {isEditing
                  ? <input className="pm-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Chưa cập nhật" />
                  : <span className="pm-value">{editPhone || "Chưa cập nhật"}</span>}
              </div>

              <div className="pm-field">
                <span className="pm-label">Giới tính</span>
                {isEditing
                  ? (
                    <select className="pm-select" value={editGender} onChange={(e) => setEditGender(e.target.value)}>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  )
                  : <span className="pm-value">{genderLabel}</span>}
              </div>

              <div className="pm-field">
                <span className="pm-label">Vai trò</span>
                <span className="pm-value">{roleLabel}</span>
              </div>

              {isMe && (
                <div className="pm-field">
                  <span className="pm-label">Mật khẩu</span>
                  {isEditing
                    ? <input type="password" className="pm-input" placeholder="Để trống nếu không đổi" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                    : <span className="pm-value">••••••••</span>}
                </div>
              )}

              {/* Xác nhận mật khẩu — chỉ khi edit và đang nhập */}
              {isMe && isEditing && editPassword.length > 0 && (
                <div className="pm-field pm-field-full">
                  <span className="pm-label">Xác nhận mật khẩu mới</span>
                  <input type="password" className="pm-input" placeholder="Nhập lại mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              )}

            </div>

            {/* Actions */}
            {isMe && (
              <div className="pm-actions">
                {!isEditing ? (
                  <>
                    <button className="pm-btn-danger" onClick={handleLogout}>Đăng xuất</button>
                    <button className="pm-btn-primary" onClick={() => setIsEditing(true)}>Chỉnh sửa thông tin</button>
                  </>
                ) : (
                  <>
                    <button className="pm-btn-ghost" onClick={handleCancel} disabled={isSubmitting}>Hủy bỏ</button>
                    <button className="pm-btn-primary" onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileModal;
