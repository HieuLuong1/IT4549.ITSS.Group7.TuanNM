import React, { useState } from "react";
import "./RecipeLibrary.css";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import RecipeBrowser from "./RecipeBrowser";

const RecipeLibrary: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState("");

  return (
    <div className="recipe-library-layout">
      <Sidebar />

      <div className="recipe-library-page">
        <Topbar
          title="Thư viện công thức"
          searchPlaceholder="Tìm kiếm công thức..."
          searchValue={searchKeyword}
          onSearchChange={setSearchKeyword}
        />
        <RecipeBrowser variant="library" searchValue={searchKeyword} />
      </div>
    </div>
  );
};

export default RecipeLibrary;
