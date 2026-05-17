import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import avatar from "@/assets/avatar/26.svg";

import iconGroup from "@/assets/icon/Icon-group.svg";
import iconShopping from "@/assets/icon/Icon-shopping.svg";
import iconFridge from "@/assets/icon/Icon-fridge.svg";
import iconLogo from "@/assets/icon/Icon-logo.svg";
import iconSchedule from "@/assets/icon/Icon-schedule.svg";
import iconStatistic from "@/assets/icon/Icon-statistic.svg";
import iconRecipe from "@/assets/icon/Icon-recipe.svg";

const navItems = [
  { label: "Nhóm gia đình", to: "/family", icon: iconGroup },
  { label: "Tủ lạnh nhà tôi", to: "/fridge", icon: iconFridge },
  { label: "Kế hoạch đi chợ", to: "/shopping", icon: iconShopping },
  { label: "Kế hoạch bữa ăn", to: "/suggestions", icon: iconSchedule },
  { label: "Báo cáo & Thống kê", to: "/reports", icon: iconStatistic }
];

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo-section">
        <div className="sidebar-logo">
          <div className="sidebar-logo-box">
            <img src={iconLogo} alt="" className="sidebar-logo-icon" />
          </div>
          <span className="sidebar-brand-full">Fiza</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end
            className={({ isActive }) => `sidebar-menu-item${isActive ? " active" : ""}`}
          >
            <span className="sidebar-icon-wrap">
              <img src={item.icon} alt="" className="sidebar-menu-icon" />
            </span>
            <span className="sidebar-menu-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

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