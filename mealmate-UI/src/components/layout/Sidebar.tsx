import React, { useState } from "react"; 
import { useLocation, Link } from "react-router-dom";
import "./Sidebar.css";

import { useAuth } from "@/context/AuthContext"; 
import ProfileModal from "./ProfileModal";

import iconGroup from "@/assets/icon/Icon-group.svg";
import fridgeMenuIcon from "@/assets/icon/Icon-fridge.svg";
import iconLogo from "@/assets/icon/Icon-logo.svg";
import iconRecipe from "@/assets/icon/Icon-recipe.svg";
import iconSchedule from "@/assets/icon/Icon-schedule.svg";
import iconStatistic from "@/assets/icon/Icon-statistic.svg";
import iconShopping from "@/assets/icon/Icon-shopping.svg";

import defaultAvatar from "@/assets/avatar/26.svg";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  
  const authContext = useAuth();
  const userFromContext = authContext?.user;

  let userFromLocalStorage = null;
  const authUserString = localStorage.getItem("authUser");
  if (authUserString) {
    try {
      userFromLocalStorage = JSON.parse(authUserString);
    } catch (e) {
      console.error("Lỗi parse authUser tại Sidebar:", e);
    }
  }

  const baseAuthUser = userFromContext || userFromLocalStorage;

  const checkIsAdmin = (userObj: any): boolean => {
    if (!userObj) return false;
    const roleObj = userObj.role;
    const roleName = (typeof roleObj === "object" && roleObj !== null ? roleObj.name : roleObj) 
                     || userObj.roleName 
                     || "";

    return String(roleName).toUpperCase().includes("ADMIN");
  };

  const isAdmin = checkIsAdmin(baseAuthUser);

  const getRoleLabel = (userObj: any) => {
    if (!userObj) return "Thành viên";
    
    // Bốc chuỗi tên vai trò từ hệ thống dữ liệu (hỗ trợ cả Object role hoặc chuỗi roleName)
    const roleObj = userObj.role;
    const roleName = (typeof roleObj === "object" && roleObj !== null ? roleObj.name : roleObj) 
                     || userObj.roleName 
                     || "";

    const upperRole = String(roleName).toUpperCase();

    // 1. Quản trị viên hệ thống
    const currentFamilyStr = localStorage.getItem("currentFamily");
    let hasFamily = userObj.family;
    if (!hasFamily && currentFamilyStr) {
      try {
        hasFamily = JSON.parse(currentFamilyStr);
      } catch (e) {}
    }
    if (upperRole.includes("ADMIN") && !hasFamily) {
      return "Quản trị viên hệ thống";
    }

    // 2. Chủ nhà (Người nội trợ)
    let isHousekeeper = false;
    if (userObj.family) {
      const hId = userObj.family.housekeeperId;
      const currentUserId = Number(userObj.id || userObj.userId);
      if (hId && Number(hId) === currentUserId) {
        isHousekeeper = true;
      }
    } else if (currentFamilyStr) {
      try {
        const currentFamily = JSON.parse(currentFamilyStr);
        const hId = currentFamily.housekeeperId;
        const currentUserId = Number(userObj.id || userObj.userId);
        if (hId && Number(hId) === currentUserId) {
          isHousekeeper = true;
        }
      } catch (e) {
        // ignore
      }
    }

    if (upperRole.includes("BOSS") || upperRole.includes("HOUSEKEEPER") || isHousekeeper) {
      return "Người nội trợ";
    }

    return "Thành viên";
  };

  let refinedUserData = null;
  if (baseAuthUser) {
    const currentUserId = Number(baseAuthUser.id || baseAuthUser.userId);
    const cachedMembersString = localStorage.getItem("familyMembersCache");
    let foundFullProfile = null;

    if (cachedMembersString) {
      try {
        const cachedMembers = JSON.parse(cachedMembersString);
        if (Array.isArray(cachedMembers)) {
          foundFullProfile = cachedMembers.find((m: any) => Number(m.id) === currentUserId);
        }
      } catch (e) {
        console.error("Lỗi xử lý cache tại Sidebar:", e);
      }
    }

    // Lấy thông tin gia đình hiện tại từ localStorage
    let currentFamily = null;
    const currentFamilyStr = localStorage.getItem("currentFamily");
    if (currentFamilyStr) {
      try {
        currentFamily = JSON.parse(currentFamilyStr);
      } catch (e) {
        console.error("Lỗi parse currentFamily tại Sidebar:", e);
      }
    }

    if (foundFullProfile) {
      refinedUserData = {
        id: foundFullProfile.id,
        fullName: foundFullProfile.fullName,
        roleName: foundFullProfile.roleName, 
        email: foundFullProfile.email,
        phone: foundFullProfile.phone,
        gender: foundFullProfile.gender,
        avatarUrl: foundFullProfile.avatarUrl,
        family: currentFamily
      };
    } else {
      refinedUserData = {
        id: currentUserId,
        fullName: baseAuthUser.fullName || baseAuthUser.full_name || baseAuthUser.name || "Thành viên Fiza",
        roleName: baseAuthUser.roleName || (isAdmin ? "ADMIN" : "CUSTOMER"),
        email: baseAuthUser.email || "Chưa cập nhật",
        phone: baseAuthUser.phone || "Chưa cập nhật",
        gender: baseAuthUser.gender || "OTHER",
        avatarUrl: baseAuthUser.avatarUrl || undefined,
        family: currentFamily
      };
    }
  }

  const rawName = baseAuthUser?.fullName || baseAuthUser?.full_name || baseAuthUser?.name || "Thành viên Fiza";
  const rawAvatar = baseAuthUser?.avatarUrl || baseAuthUser?.avatar_url || baseAuthUser?.avatar;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-section">
        <div className="sidebar-logo">
          <div className="sidebar-logo-box">
            <img src={iconLogo} alt="Logo" className="sidebar-logo-icon" />
          </div>
          <span className="sidebar-brand-full">Fiza</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            <Link 
              className={`sidebar-menu-item ${location.pathname === "/admin/users" ? "active" : ""}`} 
              to="/admin/users"
            >
              <span className="sidebar-icon-wrap">
                <img src={iconGroup} alt="Quản lý người dùng" className="sidebar-menu-icon" />
              </span>
              <span className="sidebar-menu-text">Quản lý người dùng</span>
            </Link>

            <Link 
              className={`sidebar-menu-item ${location.pathname === "/admin/foods" ? "active" : ""}`} 
              to="/admin/foods"
            >
              {/* 🎯 ĐÃ ĐỒNG BỘ: Sử dụng thẻ img chứa fridgeMenuIcon hình tủ lạnh ổn định */}
              <span className="sidebar-icon-wrap">
                <img src={fridgeMenuIcon} alt="Quản lý thực phẩm" className="sidebar-menu-icon" />
              </span>
              <span className="sidebar-menu-text">Quản lý thực phẩm</span>
            </Link>

            <Link 
              className={`sidebar-menu-item ${location.pathname === "/admin/recipes" ? "active" : ""}`} 
              to="/admin/recipes"
            >
              <span className="sidebar-icon-wrap">
                <img src={iconRecipe} alt="Quản lý món ăn" className="sidebar-menu-icon" />
              </span>
              <span className="sidebar-menu-text">Quản lý món ăn</span>
            </Link>

            <Link 
              className={`sidebar-menu-item ${location.pathname === "/admin/performance" ? "active" : ""}`} 
              to="/admin/performance"
            >
              <span className="sidebar-icon-wrap">
                <img src={iconStatistic} alt="Quản lý hiệu suất" className="sidebar-menu-icon" />
              </span>
              <span className="sidebar-menu-text">Quản lý hiệu suất</span>
            </Link>
          </>
        ) : (
          <>
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
              to="/recipes"
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
          </>
        )}
      </nav>

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
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </div>

          <div className="sidebar-profile-text">
            <p>{rawName}</p>
            <span>{getRoleLabel(baseAuthUser)}</span>
          </div>
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        familyName={localStorage.getItem("currentFamilyName") || "Gia đình Fiza"}
        isMe={true} 
        memberData={refinedUserData}
      />
    </aside>
  );
};

export default Sidebar;