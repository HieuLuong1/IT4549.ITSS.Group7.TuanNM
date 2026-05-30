import React, { useState, useEffect } from "react";
// 🎯 ĐÃ SỬA: Thay thế axios gốc bằng instance api cấu hình động của dự án
import api from "@/services/api";
import "./Topbar.css";

import iconSearch from "@/assets/icon/Icon-search.svg";
import iconNotification from "@/assets/icon/Icon-noti.svg";
import ReceiveInviteModal from "@/pages/customer/group/ReceiveInviteModal"; 

interface TopbarProps {
  title?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  familyName?: string; // Nhận từ trang cha truyền xuống (ví dụ: trang FamilyGroup)
  showSearch?: boolean;
}

const Topbar: React.FC<TopbarProps> = ({
  title = "Tủ lạnh nhà tôi",
  searchPlaceholder = "Tìm kiếm",
  searchValue = "",
  onSearchChange,
  familyName,
  showSearch = true
}) => {
  const [localFamilyName, setLocalFamilyName] = useState<string>("Gia đình Fiza");
  const [inviteInfo, setInviteInfo] = useState<{ isOpen: boolean; familyName: string; familyId: number | null }>({
    isOpen: false,
    familyName: "",
    familyId: null
  });

  // Luồng lấy tên gia đình hiện tại
  useEffect(() => {
    if (familyName && familyName !== "Đang tải...") {
      setLocalFamilyName(familyName);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // 🎯 ĐÃ SỬA: Chuyển sang dùng api chung của dự án và bỏ http://localhost:8080
    api.get('/api/v1/users/familys/current', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      if (response.data) {
        if (response.data.success && response.data.data && response.data.data.name) {
          setLocalFamilyName(response.data.data.name);
        } else if (response.data.name) {
          setLocalFamilyName(response.data.name);
        }
      }
    })
    .catch(error => {
      console.error("Topbar tự gọi API lấy tên gia đình bị lỗi:", error);
      setLocalFamilyName("Gia đình Fiza"); 
    });
  }, [familyName]);

  // Luồng Polling kiểm tra lời mời ngầm (Chống spam 401)
  useEffect(() => {
    const checkIncomingInvite = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token || token === "null" || token === "undefined") return;
      if (inviteInfo.isOpen) return; // Nếu đang mở modal thì không check nữa

      try {
        // 🎯 ĐÃ SỬA: Chuyển sang dùng api chung của dự án và bỏ http://localhost:8080
        const res = await api.get('/api/v1/users/users/check-invite', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.data && res.data.success && res.data.data) {
          setInviteInfo({
            isOpen: true,
            familyName: res.data.data.familyName,
            familyId: res.data.data.familyId
          });
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          console.warn("⚠️ Token không hợp lệ hoặc đã hết hạn.");
        }
      }
    };

    checkIncomingInvite();
    const timer = setInterval(checkIncomingInvite, 5000); // 5 giây chạy 1 lần ổn định
    
    return () => clearInterval(timer);
  }, [inviteInfo.isOpen]);

  const handleAcceptInvite = async () => {
    const token = localStorage.getItem("accessToken");
    if (!inviteInfo.familyId) return;

    try {
      // 🎯 ĐÃ SỬA: Chuyển sang dùng api chung của dự án và bỏ http://localhost:8080
      await api.post(`/api/v1/users/users/accept-invite`, 
        { familyId: inviteInfo.familyId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert("🎉 Bạn đã gia nhập nhóm gia đình mới thành công!");
      setInviteInfo({ isOpen: false, familyName: "", familyId: null });
      window.location.reload(); 
    } catch (err) {
      alert("❌ Đồng ý gia nhập thất bại!");
    }
  };

  const handleDeclineInvite = async () => {
    const token = localStorage.getItem("accessToken");
    if (!inviteInfo.familyId) return;

    try {
      // 🎯 ĐÃ SỬA: Truyền thêm familyId vào body để Backend cập nhật đúng bản ghi PostgreSQL
      await api.post(`/api/v1/users/users/decline-invite`, 
        { familyId: inviteInfo.familyId }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setInviteInfo({ isOpen: false, familyName: "", familyId: null });
    } catch (err) {
      console.error("Từ chối lời mời thất bại:", err);
      setInviteInfo({ isOpen: false, familyName: "", familyId: null });
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-title-wrapper">
        <div className="topbar-title">{title}</div>
      </div>

      <div className="topbar-actions">
        {showSearch && (
          <div className="topbar-search">
            <div className="topbar-search-input">
              <input
                type="text"
                className="topbar-search-field"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
            </div>

            <div className="topbar-search-icon-wrapper">
              <img src={iconSearch} alt="" className="topbar-search-icon" />
            </div>
          </div>
        )}

        <div className="topbar-notification">
          <img src={iconNotification} alt="" className="topbar-bell-icon" />
          <div className="topbar-notification-badge">
            <div>3</div>
          </div>
        </div>

        <div className="topbar-family-button">
          <div>{localFamilyName}</div>
        </div>
      </div>

      <ReceiveInviteModal 
        isOpen={inviteInfo.isOpen}
        familyName={inviteInfo.familyName}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />
    </header>
  );
};

export default Topbar;
