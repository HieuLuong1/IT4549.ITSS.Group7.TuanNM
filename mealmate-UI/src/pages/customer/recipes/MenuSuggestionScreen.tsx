import React, { useEffect, useState } from "react";
import RecipeBrowser from "./RecipeBrowser";
import KitchenAssistantScreen from "./KitchenAssistantScreen";

type MenuSuggestionScreenProps = {
  onCancel: () => void;
  searchValue?: string;
};

// Màn hình Gợi ý món ăn hiển thị nội tuyến trong trang Tủ lạnh.
// Mặc định mở "Trợ lý nhà bếp" (top 3 món hợp nhất); người dùng có thể
// chuyển sang danh sách đầy đủ (thiết kế lưới cũ) khi cần tìm thêm.
const MenuSuggestionScreen: React.FC<MenuSuggestionScreenProps> = ({ onCancel, searchValue }) => {
  const [view, setView] = useState<"assistant" | "browser">("assistant");

  // Khi người dùng gõ tìm kiếm trên thanh công cụ, tự chuyển sang danh sách đầy đủ.
  useEffect(() => {
    if (view === "assistant" && searchValue && searchValue.trim().length > 0) {
      setView("browser");
    }
  }, [searchValue, view]);

  if (view === "assistant") {
    return <KitchenAssistantScreen onBackToFridge={onCancel} onViewAll={() => setView("browser")} />;
  }

  return <RecipeBrowser variant="suggestion" onBack={() => setView("assistant")} searchValue={searchValue} />;
};

export default MenuSuggestionScreen;
