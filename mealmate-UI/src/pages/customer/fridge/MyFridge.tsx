import React, { useEffect, useMemo, useState } from "react";
import "./MyFridge.css";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import api from "@/services/api";

import AddFoodToFridgeScreen from "./AddFoodToFridgeScreen";
import FoodDetailPopup from "./FoodDetailPopup";

import iconAlert from "@/assets/icon/Icon-alert.svg";
import iconArrow from "@/assets/icon/Icon-arrow.svg";
import iconBox from "@/assets/icon/Icon-box.svg";
import iconClock from "@/assets/icon/Icon-clock.svg";
import iconPlus from "@/assets/icon/Icon-plus.svg";
import iconRecipe from "@/assets/icon/Icon-recipe.svg";
import angryFridgeIcon from "@/assets/icon/angry-fridge.svg";
import happyFridgeIcon from "@/assets/icon/happy-fridge.svg";
import neutralFridgeIcon from "@/assets/icon/neutral-fridge.svg";

type StorageLocation = "COOL" | "FREEZER" | "DRY";
type FridgeItemStatus = "STORED" | "EXPIRED" | "USED" | "REMOVED";
type FilterMode = "LOCATION" | "CATEGORY";

export type RemoveReasonCode =
  | "USED_UP"
  | "EXPIRED_DISCARDED"
  | "SPOILED"
  | "WRONG_INFO"
  | "OTHER";

export type FridgeItemFromApi = {
  id: number;
  familyId: number;
  foodId: number;
  standardFoodName?: string;
  displayName?: string;
  unit?: string;
  categoryId?: number;
  categoryName?: string;
  categoryIconKey?: string;
  categoryColorCode?: string;
  preservationMethods?: string[];
  quantity: number;
  storageLocation?: StorageLocation;
  specificLocation?: string;
  addedDate?: string;
  expiryDate?: string;
  status: FridgeItemStatus;
  imageUrl?: string;
  note?: string;
};

type CategoryFromApi = {
  id: number;
  name: string;
  iconKey?: string;
  colorCode?: string;
};

const EXPIRING_SOON_THRESHOLD = 3;

const foodIconMap: Record<string, string> = {
  tomato: "🍅",
  milk: "🥛",
  beef: "🥩",
  apple: "🍎",
  fish: "🐟",
  egg: "🥚",
  carrot: "🥕",
  rice: "🌾",
  watermelon: "🍉",
  vegetable: "🥬",
  fruit: "🍎",
  meat: "🥩",
  seafood: "🐟",
  dairy: "🥛",
  "dry-food": "🌾",
  dry_food: "🌾",
  spice: "🧂",
  drink: "🥤",
  default_food: "🍽️",
};

const storageLocationLabelMap: Record<StorageLocation, string> = {
  COOL: "Ngăn mát",
  FREEZER: "Ngăn đông",
  DRY: "Tủ đồ khô",
};

const specificLocationLabelMap: Record<string, string> = {
  VEGETABLE_DRAWER: "Ngăn rau củ",
  FRUIT_DRAWER: "Ngăn trái cây",
  DOOR_SHELF: "Cánh tủ",
  TOP_SHELF: "Kệ trên",
  MIDDLE_SHELF: "Kệ giữa",
  BOTTOM_SHELF: "Kệ dưới",
};

const getFoodName = (item: FridgeItemFromApi) => {
  return item.displayName || item.standardFoodName || "Thực phẩm";
};

const getFoodIcon = (item: FridgeItemFromApi) => {
  const iconKey = item.categoryIconKey || "default_food";
  return foodIconMap[iconKey] || foodIconMap.default_food;
};

const getFoodIconBg = (item: FridgeItemFromApi) => {
  return item.categoryColorCode || "#F1F5F9";
};

const getStorageLocationText = (storageLocation?: StorageLocation) => {
  if (!storageLocation) return "Chưa phân loại";
  return storageLocationLabelMap[storageLocation] || storageLocation;
};

const getSpecificLocationText = (specificLocation?: string) => {
  if (!specificLocation) return "";
  return specificLocationLabelMap[specificLocation] || specificLocation;
};

const getQuantityText = (item: FridgeItemFromApi) => {
  return `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`;
};

const toLocalDate = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateToDisplay = (dateString?: string) => {
  const date = toLocalDate(dateString);
  if (!date) return "Chưa có";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const getDateDiffInDays = (fromDate: Date, toDate: Date) => {
  const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

const getDaysLeft = (expiryDate?: string) => {
  const expiry = toLocalDate(expiryDate);
  if (!expiry) return null;
  return getDateDiffInDays(new Date(), expiry);
};

const getDaysLeftLabel = (daysLeft: number | null) => {
  if (daysLeft === null) return "Chưa có hạn sử dụng";
  if (daysLeft < 0) return `Quá hạn ${Math.abs(daysLeft)} ngày`;
  if (daysLeft === 0) return "Hết hạn hôm nay";
  return `Còn ${daysLeft} ngày`;
};

const getProgressColor = (daysLeft: number | null) => {
  if (daysLeft === null) return "#94A3B8";
  if (daysLeft <= 3) return "#EF4444";
  if (daysLeft <= 7) return "#F59E0B";
  return "#6ED4B4";
};

const getProgressTrackColor = (daysLeft: number | null) => {
  if (daysLeft === null) return "#E2E8F0";
  if (daysLeft <= 3) return "#FEE2E2";
  if (daysLeft <= 7) return "#FFEDD5";
  return "#CFE7DF";
};

const getProgressWidth = (addedDate?: string, expiryDate?: string) => {
  const added = toLocalDate(addedDate);
  const expiry = toLocalDate(expiryDate);
  if (!added || !expiry) return "100%";

  const totalShelfLifeDays = Math.max(getDateDiffInDays(added, expiry), 1);
  const daysLeft = Math.max(getDateDiffInDays(new Date(), expiry), 0);
  const percent = Math.min((daysLeft / totalShelfLifeDays) * 100, 100);
  return `${Number(percent.toFixed(2))}%`;
};

const MyFridge: React.FC = () => {
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [fridgeItems, setFridgeItems] = useState<FridgeItemFromApi[]>([]);
  const [fridgeOverviewItems, setFridgeOverviewItems] = useState<FridgeItemFromApi[]>([]);
  const [categories, setCategories] = useState<CategoryFromApi[]>([]);
  const [selectedFood, setSelectedFood] = useState<FridgeItemFromApi | null>(null);
  const [keyword, setKeyword] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("LOCATION");
  const [activeLocation, setActiveLocation] = useState<StorageLocation | "ALL">("ALL");
  const [activeCategoryId, setActiveCategoryId] = useState<number | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get<CategoryFromApi[]>("/api/categories");
        setCategories(response.data);
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadFridgeOverview = async () => {
      try {
        const response = await api.get<FridgeItemFromApi[]>("/api/fridge-items");
        setFridgeOverviewItems(response.data);
      } catch {
        setFridgeOverviewItems([]);
      }
    };

    loadFridgeOverview();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get<FridgeItemFromApi[]>("/api/fridge-items", {
          params: {
            keyword: keyword.trim() || undefined,
            categoryId: filterMode === "CATEGORY" && activeCategoryId !== "ALL" ? activeCategoryId : undefined,
          },
        });
        setFridgeItems(response.data);
      } catch {
        setErrorMessage("Không tải được dữ liệu tủ lạnh.");
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [activeCategoryId, filterMode, keyword]);

  const visibleItems = useMemo(() => {
    if (filterMode === "CATEGORY") return fridgeItems;
    if (activeLocation === "ALL") return fridgeItems;
    return fridgeItems.filter((item) => item.storageLocation === activeLocation);
  }, [activeLocation, filterMode, fridgeItems]);

  const categoryFilters = useMemo(() => {
    if (categories.length > 0) return categories;

    const byId = new Map<number, CategoryFromApi>();
    fridgeItems.forEach((item) => {
      if (!item.categoryId || byId.has(item.categoryId)) return;

      byId.set(item.categoryId, {
        id: item.categoryId,
        name: item.categoryName || "Danh mục",
        iconKey: item.categoryIconKey,
        colorCode: item.categoryColorCode,
      });
    });

    return Array.from(byId.values());
  }, [categories, fridgeItems]);

  const handleFilterModeChange = (nextMode: FilterMode) => {
    setFilterMode(nextMode);
    if (nextMode === "LOCATION") {
      setActiveCategoryId("ALL");
    } else {
      setActiveLocation("ALL");
    }
  };

  const totalFridgeItemsCount = fridgeOverviewItems.length;

  const expiringItemsCount = fridgeOverviewItems.filter((item) => {
    const daysLeft = getDaysLeft(item.expiryDate);
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_SOON_THRESHOLD;
  }).length;

  const expiredItemsCount = fridgeOverviewItems.filter((item) => {
    const daysLeft = getDaysLeft(item.expiryDate);
    return daysLeft !== null && daysLeft < 0;
  }).length;

  const almostOutCount = fridgeOverviewItems.filter((item) => item.quantity <= 1).length;
  const fridgeStatus = useMemo(() => {
    if (totalFridgeItemsCount === 0) {
      return {
        icon: neutralFridgeIcon,
        title: "Tủ lạnh của bạn đang chờ thực phẩm...",
        description: "Nhấn dấu “+” bên dưới để thêm thực phẩm đầu tiên.",
      };
    }

    if (expiredItemsCount > 0 || expiringItemsCount > 0 || almostOutCount > 0) {
      return {
        icon: angryFridgeIcon,
        title: "Tủ lạnh của bạn cần chú ý!",
        description: "Hãy kiểm tra lại các thực phẩm có thể hết hạn hoặc sắp hết.",
      };
    }

    return {
      icon: happyFridgeIcon,
      title: "Tủ lạnh của bạn đang hạnh phúc!",
      description: "Tất cả thực phẩm đều tươi ngon và đầy đủ.",
    };
  }, [almostOutCount, expiredItemsCount, expiringItemsCount, totalFridgeItemsCount]);

  const handleSaveQuantity = async (fridgeItemId: number, newQuantityValue: number) => {
    const response = await api.patch<FridgeItemFromApi>(`/api/fridge-items/${fridgeItemId}`, {
      quantity: newQuantityValue,
    });

    setFridgeItems((prevItems) =>
      prevItems.map((item) => (item.id === fridgeItemId ? { ...item, ...response.data } : item))
    );
    setFridgeOverviewItems((prevItems) =>
      prevItems.map((item) => (item.id === fridgeItemId ? { ...item, ...response.data } : item))
    );
    setSelectedFood((current) => (current?.id === fridgeItemId ? { ...current, ...response.data } : current));
  };

  const handleRemoveFood = async (
    fridgeItemId: number,
    removedReason: RemoveReasonCode,
    removedReasonNote?: string
  ) => {
    await api.patch<FridgeItemFromApi>(`/api/fridge-items/${fridgeItemId}/remove`, {
      removedReason,
      removedReasonNote,
    });

    setFridgeItems((prevItems) => prevItems.filter((item) => item.id !== fridgeItemId));
    setFridgeOverviewItems((prevItems) => prevItems.filter((item) => item.id !== fridgeItemId));
    setSelectedFood(null);
  };

  return (
    <div className="my-fridge-layout">
      <Sidebar />

      <div className="my-fridge-page">
        <Topbar />

        {isAddingFood ? (
          <AddFoodToFridgeScreen onCancel={() => setIsAddingFood(false)} />
        ) : (
          <div className="my-fridge">
          <div className="my-fridge-content">
            <main className="my-fridge-main">
              <div className="my-fridge-toolbar">
                <div className="my-fridge-view-tabs">
                  <button
                    className={filterMode === "LOCATION" ? "active" : ""}
                    onClick={() => handleFilterModeChange("LOCATION")}
                  >
                    Theo vị trí
                  </button>
                  <button
                    className={filterMode === "CATEGORY" ? "active" : ""}
                    onClick={() => handleFilterModeChange("CATEGORY")}
                  >
                    Theo thực phẩm
                  </button>
                </div>

                <input
                  className="my-fridge-search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm thực phẩm"
                />
              </div>

              <div className="my-fridge-filter-tabs">
                {filterMode === "LOCATION" ? (
                  <>
                    <button className={activeLocation === "ALL" ? "active" : ""} onClick={() => setActiveLocation("ALL")}>
                      Tất cả
                    </button>
                    <button className={activeLocation === "COOL" ? "active" : ""} onClick={() => setActiveLocation("COOL")}>
                      Ngăn mát
                    </button>
                    <button
                      className={activeLocation === "FREEZER" ? "active" : ""}
                      onClick={() => setActiveLocation("FREEZER")}
                    >
                      Ngăn đông
                    </button>
                    <button className={activeLocation === "DRY" ? "active" : ""} onClick={() => setActiveLocation("DRY")}>
                      Tủ đồ khô
                    </button>
                  </>
                ) : (
                  <>
                    <button className={activeCategoryId === "ALL" ? "active" : ""} onClick={() => setActiveCategoryId("ALL")}>
                      Tất cả
                    </button>
                    {categoryFilters.map((category) => (
                      <button
                        key={category.id}
                        className={activeCategoryId === category.id ? "active" : ""}
                        onClick={() => setActiveCategoryId(category.id)}
                      >
                        <span
                          className="my-fridge-category-icon"
                          style={{ backgroundColor: category.colorCode || "#F1F5F9" }}
                        >
                          {foodIconMap[category.iconKey || "default_food"] || foodIconMap.default_food}
                        </span>
                        {category.name}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {errorMessage && <div className="my-fridge-state error">{errorMessage}</div>}
              {isLoading && <div className="my-fridge-state">Đang tải dữ liệu tủ lạnh...</div>}
              {!isLoading && !errorMessage && visibleItems.length === 0 && (
                <div className="my-fridge-state">Chưa có thực phẩm phù hợp.</div>
              )}

              <section className="my-fridge-grid">
                {visibleItems.map((item) => {
                  const daysLeft = getDaysLeft(item.expiryDate);
                  const specificLocationText = getSpecificLocationText(item.specificLocation);

                  return (
                    <article
                      className="my-fridge-card"
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedFood(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setSelectedFood(item);
                      }}
                    >
                      <div className="my-fridge-card-top">
                        <div className="my-fridge-food-icon" style={{ backgroundColor: getFoodIconBg(item) }}>
                          {getFoodIcon(item)}
                        </div>

                        <div className="my-fridge-food-info">
                          <h3>{getFoodName(item)}</h3>
                          <p>{getQuantityText(item)}</p>
                        </div>
                      </div>

                      <div className="my-fridge-food-meta">
                        <p>
                          <strong>{getStorageLocationText(item.storageLocation)}</strong>
                          {specificLocationText && <span> • {specificLocationText}</span>}
                        </p>
                        <p className="expiry-date">HSD: {formatDateToDisplay(item.expiryDate)}</p>
                      </div>

                      <div className="my-fridge-progress-area">
                        <p>{getDaysLeftLabel(daysLeft)}</p>
                        <div
                          className="my-fridge-progress-track"
                          style={{ backgroundColor: getProgressTrackColor(daysLeft) }}
                        >
                          <div
                            className="my-fridge-progress-bar"
                            style={{
                              width: getProgressWidth(item.addedDate, item.expiryDate),
                              backgroundColor: getProgressColor(daysLeft),
                            }}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            </main>

            <aside className="my-fridge-sidebar">
              <section className="fridge-status-card">
                <h2>Trạng thái tủ lạnh</h2>
                <div className="fridge-status-body">
                  <div className="fridge-status-visual" aria-hidden="true">
                    <img src={fridgeStatus.icon} alt="" />
                  </div>

                  <div className="fridge-status-copy">
                    <h3>{fridgeStatus.title}</h3>
                    <p>{fridgeStatus.description}</p>
                  </div>
                </div>

                <div className="fridge-status-total-pill">
                  <strong>{totalFridgeItemsCount}</strong>
                  <span>thực phẩm</span>
                </div>
              </section>

              <section className="my-fridge-alerts">
                <button className="alert-card danger">
                  <img src={iconAlert} alt="" className="alert-icon" />
                  <span>{expiringItemsCount} thực phẩm sắp hết hạn</span>
                  <img src={iconArrow} alt="" className="alert-arrow" />
                </button>

                <button className="alert-card neutral">
                  <img src={iconClock} alt="" className="alert-icon" />
                  <span>{expiredItemsCount} thực phẩm đã hết hạn</span>
                  <img src={iconArrow} alt="" className="alert-arrow" />
                </button>

                <button className="alert-card success">
                  <img src={iconBox} alt="" className="alert-icon" />
                  <span>{almostOutCount} thực phẩm sắp hết</span>
                  <img src={iconArrow} alt="" className="alert-arrow" />
                </button>
              </section>

              <section className="my-fridge-actions">
                <button className="round-action add" aria-label="Thêm thực phẩm" onClick={() => setIsAddingFood(true)}>
                  <img src={iconPlus} alt="" />
                  <span>Thêm thực phẩm</span>
                </button>
                <button className="round-action suggest" aria-label="Gợi ý món ăn">
                  <img src={iconRecipe} alt="" />
                  <span>Gợi ý món ăn</span>
                </button>
              </section>
            </aside>
          </div>
          </div>
        )}
      </div>

      {selectedFood && (
        <FoodDetailPopup
          key={selectedFood.id}
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          onSaveQuantity={handleSaveQuantity}
          onRemoveFood={handleRemoveFood}
        />
      )}
    </div>
  );
};

export default MyFridge;
