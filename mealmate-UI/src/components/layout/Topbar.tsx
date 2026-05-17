import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Topbar.css";

import iconSearch from "@/assets/icon/Icon-search.svg";
import iconNotification from "@/assets/icon/Icon-noti.svg";

interface TopbarProps {
  title?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  familyName?: string; // Nhận từ trang cha truyền xuống (ví dụ: trang FamilyGroup)
}

const Topbar: React.FC<TopbarProps> = ({
  title = "Tủ lạnh nhà tôi",
  searchPlaceholder = "Tìm kiếm",
  searchValue = "",
  onSearchChange,
  familyName
}) => {
  // 1. Tạo một state nội bộ để tự quản lý tên gia đình nếu trang cha không truyền
  const [localFamilyName, setLocalFamilyName] = useState<string>("Gia đình Fiza");

  useEffect(() => {
    // Nếu trang cha ĐÃ TRUYỀN tên gia đình vào rồi thì dùng luôn, không gọi API nữa
    if (familyName && familyName !== "Đang tải...") {
      setLocalFamilyName(familyName);
      return;
    }

    // Nếu trang cha KHÔNG TRUYỀN (như trang MyFridge), Topbar sẽ tự chủ động đi gọi API lấy tên về
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    axios.get('http://localhost:8080/api/v1/users/familys/current', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
      setLocalFamilyName("Gia đình Fiza"); // Dự phòng khi lỗi kết nối
    });
  }, [familyName]); // Chạy lại nếu biến familyName từ trang cha thay đổi

  return (
    <header className="topbar">
      <div className="topbar-title-wrapper">
        <div className="topbar-title">{title}</div>
      </div>

      <div className="topbar-actions">
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

        <div className="topbar-notification">
          <img src={iconNotification} alt="" className="topbar-bell-icon" />

          <div className="topbar-notification-badge">
            <div>3</div>
          </div>
        </div>

        {/* 2. Hiển thị state localFamilyName đã được xử lý tự động */}
        <div className="topbar-family-button">
          <div>{localFamilyName}</div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;