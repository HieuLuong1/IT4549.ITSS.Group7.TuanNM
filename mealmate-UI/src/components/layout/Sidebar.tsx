import React, { useState } from "react"; // 🎯 ĐÃ SỬA: Thêm useState để quản lý trạng thái đóng/mở modal
import { useLocation, Link } from "react-router-dom";
import "./Sidebar.css";

// 🎯 ĐÃ SỬA: Import useAuth hệ thống để bốc thông tin đăng nhập thực tế
import { useAuth } from "@/context/AuthContext"; 

// 🎯 ĐÃ SỬA: Import Component ProfileModal vừa tạo ở bước trước
import ProfileModal from "./ProfileModal";

// Giữ lại toàn bộ hệ thống icon điều hướng
import iconGroup from "@/assets/icon/Icon-group.svg";
import fridgeMenuIcon from "@/assets/icon/Icon-fridge.svg";
import iconLogo from "@/assets/icon/Icon-logo.svg";
import iconRecipe from "@/assets/icon/Icon-recipe.svg";
import iconSchedule from "@/assets/icon/Icon-schedule.svg";
import iconShopping from "@/assets/icon/Icon-shopping.svg";
import iconStatistic from "@/assets/icon/Icon-statistic.svg";

// Avatar mặc định phòng trường hợp tài khoản chưa cài ảnh
import defaultAvatar from "@/assets/avatar/26.svg";

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  // 🎯 ĐÃ SỬA: Khai báo State kiểm soát việc hiển thị Modal thông tin cá nhân (Mặc định ẩn)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  
  // Lấy dữ liệu từ Context (nếu máy đó có cấu hình)
  const authContext = useAuth();
  const userFromContext = authContext?.user;

  // 🎯 PHÒNG VỆ CHỐNG LỆCH MÁY: Bốc thêm từ LocalStorage để cứu vãn nếu máy khác không dùng Context
  let userFromLocalStorage = null;
  const authUserString = localStorage.getItem("authUser");
  if (authUserString) {
    try {
      userFromLocalStorage = JSON.parse(authUserString);
    } catch (e) {
      console.error("Lỗi parse authUser tại Sidebar:", e);
    }
  }

  // Chốt đối tượng dữ liệu cuối cùng (Ưu tiên Context -> LocalStorage)
  const displayUser = userFromContext || userFromLocalStorage;

  // 🎯 GIẢI QUYẾT LỆCH BIẾN: Quét sạch mọi cách đặt tên thuộc tính (CamelCase của Java lẫn SnakeCase của JS)
  const rawName = displayUser?.fullName || displayUser?.full_name || displayUser?.name || "Thành viên Fiza";
  const rawAvatar = displayUser?.avatarUrl || displayUser?.avatar_url || displayUser?.avatar;

  // 🎯 PHÂN QUYỀN HIỂN THỊ: Ép chữ hiển thị tiếng Việt dựa trên Role Object hoặc chuỗi String của các máy
  const getRoleLabel = () => {
    if (!displayUser) return "Thành viên";
    
    // Đón đầu mọi kiểu trả về của trường Role từ Backend
    const roleObj = displayUser.role;
    const roleName = (typeof roleObj === "object" && roleObj !== null ? roleObj.name : roleObj) 
                     || displayUser.roleName 
                     || "";

    const normalizedRole = String(roleName).toUpperCase();
    
    if (normalizedRole.includes("ADMIN") || normalizedRole.includes("HOUSEKEEPER")) {
      return "Nội trợ";
    }
    return "Thành viên";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-section">
        <div className="sidebar-logo">
          <div className="sidebar-logo-box">
            <img src={iconLogo} alt="Logo" className="sidebar-logo-icon" />
          </div>
          <span className="sidebar-brand-full">MealMate</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link 
          className={`sidebar-menu-item ${location.pathname === "/family" ? "active" : ""}`} 
          to="/family"
        >
          <span className="sidebar-icon-wrap">
            <img src={iconGroup} alt="" className="sidebar-menu-icon" />
          </span>
          <span className="sidebar-menu-text">Nhóm gia đình</span>
        </Link>

        <Link 
          className={`sidebar-menu-item ${location.pathname === "/fridge" || location.pathname === "/" ? "active" : ""}`} 
          to="/fridge"
        >
          <span className="sidebar-icon-wrap">
            <img src={fridgeMenuIcon} alt="" className="sidebar-menu-icon" />
          </span>
          <span className="sidebar-menu-text">Tủ lạnh nhà tôi</span>
        </Link>

        <Link 
          className={`sidebar-menu-item ${location.pathname === "/shopping" ? "active" : ""}`} 
          to="/shopping"
        >
          <span className="sidebar-icon-wrap">
            <img src={iconShopping} alt="" className="sidebar-menu-icon" />
          </span>
          <span className="sidebar-menu-text">Kế hoạch đi chợ</span>
        </Link>

        <Link 
          className={`sidebar-menu-item ${location.pathname === "/suggestions" ? "active" : ""}`} 
          to="/suggestions"
        >
          <span className="sidebar-icon-wrap">
            <img src={iconSchedule} alt="" className="sidebar-menu-icon" />
          </span>
          <span className="sidebar-menu-text">Kế hoạch bữa ăn</span>
        </Link>

        <Link 
          className={`sidebar-menu-item ${location.pathname === "/recipes" ? "active" : ""}`} 
          to="#"
        >
          <span className="sidebar-icon-wrap">
            <img src={iconRecipe} alt="" className="sidebar-menu-icon" />
          </span>
          <span className="sidebar-menu-text">Thư viện công thức</span>
        </Link>

        <Link 
          className={`sidebar-menu-item ${location.pathname === "/reports" ? "active" : ""}`} 
          to="/reports"
        >
          <span className="sidebar-icon-wrap">
            <img src={iconStatistic} alt="" className="sidebar-menu-icon" />
          </span>
          <span className="sidebar-menu-text">Báo cáo &amp; Thống kê</span>
        </Link>
      </nav>

      {/* 🎯 ĐÃ SỬA: Thêm sự kiện onClick để mở Modal khi bấm vào vùng Profile, bổ sung inline style đổi hình con trỏ */}
      <div 
        className="sidebar-profile-section"
        onClick={() => setIsProfileModalOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            <div className="sidebar-avatar-line" />
            <img 
              src={rawAvatar || defaultAvatar} 
              alt="Avatar" 
              onError={(e) => {
                // Biện pháp phòng vệ: Nếu link ảnh lỗi hoặc null, tự động đưa về ảnh local SVG
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </div>

          <div className="sidebar-profile-text">
            {/* Tên hiển thị động từ DB */}
            <p>{rawName}</p>
            {/* Vai trò tương ứng */}
            <span>{getRoleLabel()}</span>
          </div>
        </div>
      </div>

      {/* 🎯 ĐÃ SỬA: Gắn cấu trúc Modal vào chân Sidebar, truyền State kiểm soát đóng mở */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        familyName={localStorage.getItem("currentFamilyName") || undefined}
      />
    </aside>
  );
};

export default Sidebar;