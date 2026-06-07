import React from "react";
import RecipeBrowser from "./RecipeBrowser";

type MenuSuggestionScreenProps = {
  onCancel: () => void;
  searchValue?: string;
};

// Màn hình Gợi ý món ăn hiển thị nội tuyến trong trang Tủ lạnh (giống màn Thêm thực phẩm).
const MenuSuggestionScreen: React.FC<MenuSuggestionScreenProps> = ({ onCancel, searchValue }) => {
  return <RecipeBrowser variant="suggestion" onBack={onCancel} searchValue={searchValue} />;
};

export default MenuSuggestionScreen;
