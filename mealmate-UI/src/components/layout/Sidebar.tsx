// import { useAuth } from "@/context/AuthContext"; // Import useAuth để lấy thông tin user thực
import React from "react";
import { NavLink } from "react-router-dom"; // Import NavLink
import "./Sidebar.css";

import avatar from "@/assets/avatar/26.svg";
import iconFridge from "@/assets/icon/Icon-fridge.svg";
import iconGroup from "@/assets/icon/Icon-group.svg";
import iconLogo from "@/assets/icon/Icon-logo.svg";
import iconRecipe from "@/assets/icon/Icon-recipe.svg";
import iconSchedule from "@/assets/icon/Icon-schedule.svg";
import iconShopping from "@/assets/icon/Icon-shopping.svg";
import iconStatistic from "@/assets/icon/Icon-statistic.svg";

const Sidebar: React.FC = () => {

  // Định nghĩa danh sách menu để map ra cho gọn
  const menuItems = [
    { path: "/group", icon: iconGroup, label: "Nhóm gia đình" },
    { path: "/fridge", icon: iconFridge, label: "Tủ lạnh nhà tôi" },
    { path: "/shopping", icon: iconShopping, label: "Kế hoạch đi chợ" },
    { path: "/schedule", icon: iconSchedule, label: "Kế hoạch bữa ăn" },
    { path: "/recipe", icon: iconRecipe, label: "Thư viện công thức" },
    { path: "/statistic", icon: iconStatistic, label: "Báo cáo & Thống kê" },
  ];

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
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            // NavLink sẽ tự động thêm class 'active' nếu đường dẫn khớp
            className={({ isActive }) =>
              `sidebar-menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon-wrap">
              <img src={item.icon} alt={item.label} className="sidebar-menu-icon" />
            </span>
            <span className="sidebar-menu-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* <div className="sidebar-profile-section">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            <div className="sidebar-avatar-line" />
            <img src={user?.avatar || defaultAvatar} alt="Avatar" />
          </div>

          <div className="sidebar-profile-text">
            {/* Hiển thị tên thực từ database */}
      {/* <p>{user?.full_name || "Khách"}</p>
            <span>{user?.role === 'CUSTOMER' ? 'Thành viên' : 'Nội trợ'}</span>
          </div>
        </div>
      </div> */}
      <div className="sidebar-profile-section">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            <div className="sidebar-avatar-line" />
            <img src={avatar} alt="" />
          </div>

          <div className="sidebar-profile-text">
            <p>Minh Quang</p>
            <span>Nội trợ</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;