import React from "react";
// 🎯 ĐÃ GIỮ: createPortal giúp đẩy modal lên front, không bao giờ bị che khuất
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "./ProfileModal.css"; 

import defaultAvatar from "@/assets/avatar/26.svg";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyName?: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, familyName }) => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const userFromContext = authContext?.user;
  const logoutFromContext = (authContext as any)?.logout; 

  let userFromLocalStorage = null;
  const authUserString = localStorage.getItem("authUser");
  if (authUserString) {
    try {
      userFromLocalStorage = JSON.parse(authUserString);
    } catch (e) {
      console.error("Lỗi đọc thông tin local tại ProfileModal:", e);
    }
  }

  const displayUser = userFromContext || userFromLocalStorage;

  if (!isOpen) return null;

  // Trích xuất dữ liệu thực tế từ CSDL
  const fullName = displayUser?.fullName || displayUser?.full_name || displayUser?.name || "Khách ẩn danh";
  const email = displayUser?.email || "Chưa cập nhật";
  const phone = displayUser?.phone || "Chưa cập nhật";
  const genderRaw = String(displayUser?.gender || "").toUpperCase();
  const genderText = genderRaw === "MALE" ? "Nam" : genderRaw === "FEMALE" ? "Nữ" : "Khác";
  const avatarUrl = displayUser?.avatarUrl || displayUser?.avatar_url || displayUser?.avatar || defaultAvatar;

  const roleObj = displayUser?.role;
  const roleName = (typeof roleObj === "object" && roleObj !== null ? roleObj.name : roleObj) 
                   || displayUser?.roleName 
                   || "";
  const isHousekeeper = String(roleName).toUpperCase().includes("ADMIN") || String(roleName).toUpperCase().includes("HOUSEKEEPER");
  const roleLabel = isHousekeeper ? "Chủ nhà" : "Thành viên";

  const handleLogoutClick = () => {
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản khỏi hệ thống không?");
    if (!confirmLogout) return;

    if (typeof logoutFromContext === "function") {
      logoutFromContext();
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("currentFamilyName");
    }
    
    onClose(); 
    navigate("/login"); 
    window.location.reload(); 
  };

  return createPortal(
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Nút đóng hình dấu X */}
        <button type="button" className="profile-modal-close-btn" onClick={onClose} aria-label="Đóng">
          ×
        </button>

        {/* Nhãn Tag tiêu đề */}
        <div className="profile-modal-tag-wrapper">
          <span className="profile-modal-tag">THÔNG TIN TÀI KHOẢN</span>
        </div>

        <div className="profile-modal-body">
          
          {/* CỘT TRÁI: Ảnh lớn và Vai trò chính */}
          <div className="profile-modal-sidebar">
            <div className="profile-modal-avatar-container">
              <img 
                className="profile-modal-avatar-img" 
                src={avatarUrl} 
                onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                alt="Avatar"
              />
              <div className="profile-modal-avatar-badge">
                <div className="profile-modal-avatar-badge-icon" />
              </div>
            </div>

            <div className="profile-modal-meta-info">
              <h3 className="profile-modal-username">{fullName}</h3>
              <span className="profile-modal-role-badge">{roleLabel}</span>
            </div>
          </div>

          {/* CỘT PHẢI: Toàn bộ thông tin được chia lưới */}
          <div className="profile-modal-content">
            <h4 className="profile-modal-section-title">Thông tin thành viên</h4>

            {/* 🎯 ĐÃ SỬA: Bao bọc các hàng thông tin vào Grid chia 2 cột */}
            <div className="profile-modal-info-grid">
              
              <div className="profile-modal-info-col">
                <span className="profile-modal-info-label">Họ và tên</span>
                <span className="profile-modal-info-value">{fullName}</span>
              </div>

              <div className="profile-modal-info-col">
                <span className="profile-modal-info-label">Vai trò</span>
                <span className="profile-modal-info-value">{roleLabel}</span>
              </div>

              <div className="profile-modal-info-col">
                <span className="profile-modal-info-label">Gia đình</span>
                <span className="profile-modal-info-value">{familyName || "Gia đình Fiza"}</span>
              </div>

              <div className="profile-modal-info-col">
                <span className="profile-modal-info-label">Số điện thoại</span>
                <span className="profile-modal-info-value">{phone}</span>
              </div>

              <div className="profile-modal-info-col">
                <span className="profile-modal-info-label">Giới tính</span>
                <span className="profile-modal-info-value">{genderText}</span>
              </div>

              <div className="profile-modal-info-col">
                <span className="profile-modal-info-label">Email</span>
                <span className="profile-modal-info-value">{email}</span>
              </div>

              {/* 🎯 ĐÃ GIỮ: Mật khẩu nằm trọn 1 hàng độc lập ở dưới cùng */}
              <div className="profile-modal-password-row">
                <div className="profile-modal-password-left">
                  <span className="profile-modal-info-label">Mật khẩu</span>
                  <span className="profile-modal-info-value">••••••••</span>
                </div>
                <button type="button" className="profile-modal-password-btn">
                  Đổi mật khẩu
                </button>
              </div>

            </div>

            {/* Khối các nút hành động chân Modal */}
            <div className="profile-modal-actions">
              {/* 🎯 ĐÃ SỬA: Chuyển hoàn toàn nút Đóng thành Đăng xuất nguy hiểm */}
              <button 
                type="button" 
                className="profile-modal-btn-close" 
                onClick={handleLogoutClick}
                style={{ 
                  borderColor: '#FEE2E2', 
                  color: '#EF4444', 
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  fontWeight: '600'
                }}
              >
                Đăng xuất
              </button>
              <button type="button" className="profile-modal-btn-edit">
                Chỉnh sửa thông tin
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileModal;