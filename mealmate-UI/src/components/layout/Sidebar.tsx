import React, { useState } from "react"; 
import { useLocation, Link } from "react-router-dom";
import "./Sidebar.css";

// 🎯 GIỮ NGUYÊN: Import useAuth hệ thống để bốc thông tin đăng nhập thực tế
import { useAuth } from "@/context/AuthContext"; 

// 🎯 GIỮ NGUYÊN: Import Component ProfileModal chuẩn của bạn
import ProfileModal from "./ProfileModal";

// --- Hệ thống Icon dành cho Người dùng cuối (CUSTOMER) ---
import iconGroup from "@/assets/icon/Icon-group.svg";
import fridgeMenuIcon from "@/assets/icon/Icon-fridge.svg";
import iconLogo from "@/assets/icon/Icon-logo.svg";
import iconRecipe from "@/assets/icon/Icon-recipe.svg";
import iconSchedule from "@/assets/icon/Icon-schedule.svg";
import iconStatistic from "@/assets/icon/Icon-statistic.svg";
import iconShopping from "@/assets/icon/Icon-shopping.svg";

// --- Hệ thống Icon dành cho Quản trị viên (ADMIN) ---
import { 
  Users, 
  UtensilsCrossed, 
  BookOpen, 
  BarChart3, 
  LogOut 
} from "lucide-react";

// Avatar mặc định phòng trường hợp tài khoản chưa cài ảnh
import defaultAvatar from "@/assets/avatar/26.svg";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  // State kiểm soát việc hiển thị Modal thông tin cá nhân
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  
  // Lấy dữ liệu từ Context
  const authContext = useAuth();
  const userFromContext = authContext?.user;

  // Phòng vệ chống lệch máy: Bốc thêm từ LocalStorage
  let userFromLocalStorage = null;
  const authUserString = localStorage.getItem("authUser");
  if (authUserString) {
    try {
      userFromLocalStorage = JSON.parse(authUserString);
    } catch (e) {
      console.error("Lỗi parse authUser tại Sidebar:", e);
    }
  }

  // Gốc dữ liệu đăng nhập cơ bản
  const baseAuthUser = userFromContext || userFromLocalStorage;

  // =========================================================================
  // 🛡️ PHÂN QUYỀN: CHỈ CẦN LÀ ADMIN THÌ MỚI LÀ TRUE, CÒN LẠI LÀ CUSTOMER HẾT
  // =========================================================================
  const checkIsAdmin = (userObj: any): boolean => {
    if (!userObj) return false;
    const roleObj = userObj.role;
    // Bốc chuỗi tên quyền (hỗ trợ cả dạng object { name: '...' } hoặc dạng string '...')
    const roleName = (typeof roleObj === "object" && roleObj !== null ? roleObj.name : roleObj) 
                     || userObj.roleName 
                     || "";

    // Chỉ giữ lại điều kiện duy nhất: chứa từ khóa "ADMIN"
    return String(roleName).toUpperCase().includes("ADMIN");
  };

  const isAdmin = checkIsAdmin(baseAuthUser);

  // Hiển thị text vai trò vùng chân Sidebar (Nếu là ADMIN thì ghi Người nội trợ/Admin, ngược lại ghi Thành viên)
  const getRoleLabel = (userObj: any) => {
    return checkIsAdmin(userObj) ? "Người nội trợ (Admin)" : "Thành viên";
  };

  // =========================================================================
  // 🎯 TÍNH TOÁN REAL-TIME DỮ LIỆU PROFILE MODAL
  // =========================================================================
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

    if (foundFullProfile) {
      refinedUserData = {
        id: foundFullProfile.id,
        fullName: foundFullProfile.fullName,
        roleName: foundFullProfile.roleName, 
        email: foundFullProfile.email,
        phone: foundFullProfile.phone,
        gender: foundFullProfile.gender,
        avatarUrl: foundFullProfile.avatarUrl
      };
    } else {
      refinedUserData = {
        id: currentUserId,
        fullName: baseAuthUser.fullName || baseAuthUser.full_name || baseAuthUser.name || "Thành viên Fiza",
        roleName: baseAuthUser.roleName || (isAdmin ? "ADMIN" : "CUSTOMER"),
        email: baseAuthUser.email || "Chưa cập nhật",
        phone: baseAuthUser.phone || "Chưa cập nhật",
        gender: baseAuthUser.gender || "OTHER",
        avatarUrl: baseAuthUser.avatarUrl || undefined
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
          // =========================================================================
          // 🛡️ GIAO DIỆN CHỈ DÀNH CHO ADMIN
          // =========================================================================
          <>
            <Link 
              className={`sidebar-menu-item ${location.pathname === "/admin/users" ? "active" : ""}`} 
              to="/admin/users"
            >
              <span className="sidebar-icon-wrap">
                <Users size={20} className="sidebar-menu-icon-lucide" />
              </span>
              <span className="sidebar-menu-text">Quản lý người dùng</span>
            </Link>

            <Link 
              className={`sidebar-menu-item ${location.pathname === "/admin/foods" ? "active" : ""}`} 
              to="/admin/foods"
            >
              <span className="sidebar-icon-wrap">
                <UtensilsCrossed size={20} className="sidebar-menu-icon-lucide" />
              </span>
              <span className="sidebar-menu-text">Quản lý thực phẩm</span>
            </Link>

            <Link 
              className={`sidebar-menu-item ${location.pathname === "/admin/recipes" ? "active" : ""}`} 
              to="/admin/recipes"
            >
              <span className="sidebar-icon-wrap">
                <BookOpen size={20} className="sidebar-menu-icon-lucide" />
              </span>
              <span className="sidebar-menu-text">Quản lý món ăn</span>
            </Link>

            <Link 
              className={`sidebar-menu-item ${location.pathname === "/admin/performance" ? "active" : ""}`} 
              to="/admin/performance"
            >
              <span className="sidebar-icon-wrap">
                <BarChart3 size={20} className="sidebar-menu-icon-lucide" />
              </span>
              <span className="sidebar-menu-text">Quản lý hiệu suất</span>
            </Link>

            <Link 
              className="sidebar-menu-item logout-item" 
              to="#"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              <span className="sidebar-icon-wrap">
                <LogOut size={20} className="sidebar-menu-icon-lucide" color="#ef4444" />
              </span>
              <span className="sidebar-menu-text" style={{ color: '#ef4444' }}>Đăng xuất</span>
            </Link>
          </>
        ) : (
          // =========================================================================
          // 🏠 GIAO DIỆN CUSTOMER (Bao gồm tất cả các chức danh còn lại)
          // =========================================================================
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

      {/* Vùng Profile ở chân Sidebar */}
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