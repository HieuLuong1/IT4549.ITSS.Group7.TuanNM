import React from "react";
import "./Topbar.css";

import iconSearch from "@/assets/icon/Icon-search.svg";
import iconNotification from "@/assets/icon/Icon-noti.svg";

type TopbarProps = {
  title?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFamilyButton?: boolean;
};

const Topbar: React.FC<TopbarProps> = ({
  title = "Tủ lạnh nhà tôi",
  searchPlaceholder = "Tìm kiếm",
  showSearch = true,
  showFamilyButton = true
}) => {
  return (
    <header className="topbar">
      <div className="topbar-title-wrapper">
        <div className="topbar-title">{title}</div>
      </div>

      <div className="topbar-actions">
        {showSearch && (
          <div className="topbar-search">
            <div className="topbar-search-input">
              <div className="topbar-search-text">{searchPlaceholder}</div>
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

        {showFamilyButton && (
          <div className="topbar-family-button">
            <div>Gia đình siêu nhân</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;