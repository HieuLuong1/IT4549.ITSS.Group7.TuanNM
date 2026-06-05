import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Edit3,
  Info,
  Loader2,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import "./MenuSuggestion.css";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";
import {
  recommendationApi,
  type FamilyInfo,
  type MealType,
  type MenuGenerateMode,
  type MenuPlanDay,
  type MenuPlanMeal,
  type MenuPlanRecipe,
  type RecipeRecommendation,
} from "@/features/recommendations/recommendationApi";

type ToastState = {
  message: string;
  variant: "success" | "error";
};

type DraftMeal = {
  mealType: MealType;
  recommendation: RecipeRecommendation | null;
};

type DraftDay = {
  date: string;
  meals: DraftMeal[];
};

type EditMealForm = {
  mealItemId: number;
  currentRecipeId: number;
  selectedRecipeId: number;
  mealType: MealType;
  date: string;
  status: "SUGGESTED" | "CONFIRMED";
  recipeName: string;
};

const mealTypes: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];

const mealMeta: Record<MealType, { label: string; time: string; icon: React.ReactNode; accent: string }> = {
  BREAKFAST: {
    label: "Bữa sáng",
    time: "07:00",
    icon: <Coffee size={20} />,
    accent: "#ffdbcb",
  },
  LUNCH: {
    label: "Bữa trưa",
    time: "12:30",
    icon: <Sun size={20} />,
    accent: "rgba(109, 212, 180, 0.2)",
  },
  DINNER: {
    label: "Bữa tối",
    time: "19:00",
    icon: <Moon size={20} />,
    accent: "rgba(121, 64, 29, 0.1)",
  },
};

const weekdayShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const weekdayLong = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateOnly = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getWeekStart = (date: Date) => {
  const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
};

const formatDisplayDate = (dateString: string) => {
  const date = parseDateOnly(dateString);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getAuthUserId = (contextUserId?: number) => {
  if (contextUserId) return contextUserId;

  try {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) return null;
    const parsed = JSON.parse(storedUser) as { userId?: number; id?: number };
    return parsed.userId || parsed.id || null;
  } catch {
    return null;
  }
};

const getMealFromDay = (day: MenuPlanDay | undefined, mealType: MealType): MenuPlanMeal => {
  const meal = day?.meals.find((item) => item.mealType === mealType);
  return meal || { mealType, recipes: [] };
};

const getRecipeInitial = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const MenuSuggestion: React.FC = () => {
  const { user } = useAuth();
  const userId = getAuthUserId(user?.userId);

  const [family, setFamily] = useState<FamilyInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toDateOnly(new Date()));
  const [weekStartDate, setWeekStartDate] = useState(() => toDateOnly(getWeekStart(new Date())));
  const [menuDays, setMenuDays] = useState<MenuPlanDay[]>([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftMode, setDraftMode] = useState<MenuGenerateMode>("WEEK");
  const [draftStartDate, setDraftStartDate] = useState(() => toDateOnly(new Date()));
  const [draftDays, setDraftDays] = useState<DraftDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditMealForm | null>(null);
  const [editOptions, setEditOptions] = useState<RecipeRecommendation[]>([]);
  const [isLoadingEditOptions, setIsLoadingEditOptions] = useState(false);
  const [isUpdatingMealItem, setIsUpdatingMealItem] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const weekDays = useMemo(() => {
    const start = parseDateOnly(weekStartDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [weekStartDate]);

  const selectedMenuDay = useMemo(() => {
    return menuDays.find((day) => day.date === selectedDate);
  }, [menuDays, selectedDate]);

  const selectedRecipeCount = useMemo(() => {
    return mealTypes.reduce((count, mealType) => count + getMealFromDay(selectedMenuDay, mealType).recipes.length, 0);
  }, [selectedMenuDay]);

  const weekRecipeCount = useMemo(() => {
    return menuDays.reduce((total, day) => {
      return total + day.meals.reduce((mealTotal, meal) => mealTotal + meal.recipes.length, 0);
    }, 0);
  }, [menuDays]);

  const showToast = useCallback((message: string, variant: ToastState["variant"]) => {
    setToast({ message, variant });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const loadFamily = useCallback(async () => {
    const currentFamily = await recommendationApi.getCurrentFamily();
    if (!Number.isFinite(currentFamily.id)) {
      throw new Error("Current family id is missing");
    }
    setFamily(currentFamily);
    return currentFamily;
  }, []);

  const loadMenuPlan = useCallback(
    async (familyId: number, targetUserId: number, startDate: string) => {
      if (!Number.isFinite(familyId) || !Number.isFinite(targetUserId)) {
        setMenuDays([]);
        return;
      }

      setIsLoadingPlan(true);
      try {
        const endDate = toDateOnly(addDays(parseDateOnly(startDate), 6));
        const response = await recommendationApi.getMenuPlan({ familyId, userId: targetUserId, startDate, endDate });
        setMenuDays(response.days);
      } catch {
        showToast("Không tải được thực đơn đã lưu.", "error");
        setMenuDays([]);
      } finally {
        setIsLoadingPlan(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (!userId) return;

    loadFamily()
      .then((currentFamily) =>
        loadMenuPlan(currentFamily.id, userId, weekStartDate).catch((error: unknown) =>
          showToast(getErrorMessage(error, "Không tải được thực đơn đã lưu."), "error")
        )
      )
      .catch((error: unknown) => showToast(getErrorMessage(error, "Không xác định được gia đình hiện tại."), "error"));
  }, [loadFamily, loadMenuPlan, showToast, userId, weekStartDate]);

  const handleShiftWeek = (direction: -1 | 1) => {
    const nextStart = toDateOnly(addDays(parseDateOnly(weekStartDate), direction * 7));
    setWeekStartDate(nextStart);
    setSelectedDate(nextStart);
  };

  const openCreateModal = (mode: MenuGenerateMode = "WEEK", startDate = selectedDate) => {
    setDraftMode(mode);
    setDraftStartDate(startDate);
    setDraftDays([]);
    setIsModalOpen(true);
  };

  const generateDraft = async () => {
    if (!family?.id || !userId) {
      showToast("Cần có gia đình và tài khoản đăng nhập để tạo thực đơn.", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await recommendationApi.generateMenuDraft({
        familyId: family.id,
        userId,
        startDate: draftStartDate,
        mode: draftMode,
        candidateLimit: 12,
      });

      setDraftDays(response.days);
      if (response.days.every((day) => day.meals.every((meal) => !meal.recommendation))) {
        showToast("Không tìm thấy món phù hợp với nguyên liệu hiện có.", "error");
      }
    } catch (error) {
      showToast(getErrorMessage(error, "Tạo thực đơn tự động bị lỗi. Kiểm tra lại dữ liệu tủ lạnh và recipe."), "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDraft = async () => {
    if (!family?.id || !userId) {
      showToast("Cần có gia đình và tài khoản đăng nhập để lưu thực đơn.", "error");
      return;
    }

    const selectedItems = draftDays.flatMap((day) =>
      day.meals
        .filter((meal) => meal.recommendation)
        .map((meal) => ({ date: day.date, mealType: meal.mealType, recipeId: meal.recommendation?.recipeId }))
    );

    if (selectedItems.length === 0) {
      showToast("Chưa có món nào trong bản xem trước để lưu.", "error");
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(
        selectedItems.map((item) =>
          recommendationApi.addRecommendationToMeal(item.recipeId as number, {
            familyId: family.id,
            mealType: item.mealType,
            date: item.date,
            status: "CONFIRMED",
          })
        )
      );

      const nextWeekStart = toDateOnly(getWeekStart(parseDateOnly(draftStartDate)));
      setWeekStartDate(nextWeekStart);
      setSelectedDate(draftStartDate);
      await loadMenuPlan(family.id, userId, nextWeekStart);
      setIsModalOpen(false);
      showToast("Đã lưu thực đơn vào kế hoạch bữa ăn.", "success");
    } catch {
      showToast("Không lưu được thực đơn. Vui lòng thử lại.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const loadEditOptions = useCallback(
    async (nextForm: EditMealForm) => {
      if (!family?.id || !userId) return;

      setIsLoadingEditOptions(true);
      try {
        const response = await recommendationApi.recommendRecipes({
          familyId: family.id,
          userId,
          mealType: nextForm.mealType,
          date: nextForm.date,
          limit: 12,
        });
        setEditOptions(response.recommendations);
      } catch (error) {
        setEditOptions([]);
        showToast(getErrorMessage(error, "Không tải được danh sách món thay thế."), "error");
      } finally {
        setIsLoadingEditOptions(false);
      }
    },
    [family?.id, showToast, userId]
  );

  const openEditMealItem = (recipe: MenuPlanRecipe, mealType: MealType) => {
    const form: EditMealForm = {
      mealItemId: recipe.mealItemId,
      currentRecipeId: recipe.recipeId,
      selectedRecipeId: recipe.recipeId,
      mealType,
      date: selectedDate,
      status: (recipe.status === "SUGGESTED" ? "SUGGESTED" : "CONFIRMED"),
      recipeName: recipe.recipeName,
    };

    setEditForm(form);
    setEditOptions([]);
    void loadEditOptions(form);
  };

  const updateEditForm = (nextValues: Partial<EditMealForm>) => {
    setEditForm((current) => {
      if (!current) return current;
      const nextForm = { ...current, ...nextValues };
      if (nextValues.mealType || nextValues.date) {
        setEditOptions([]);
        void loadEditOptions(nextForm);
      }
      return nextForm;
    });
  };

  const saveMealItemEdit = async () => {
    if (!family?.id || !userId || !editForm) {
      showToast("Không đủ dữ liệu để chỉnh sửa món trong bữa.", "error");
      return;
    }

    setIsUpdatingMealItem(true);
    try {
      await recommendationApi.updateMealItem(editForm.mealItemId, {
        familyId: family.id,
        userId,
        recipeId: editForm.selectedRecipeId,
        mealType: editForm.mealType,
        date: editForm.date,
        status: editForm.status,
      });

      const nextWeekStart = toDateOnly(getWeekStart(parseDateOnly(editForm.date)));
      setWeekStartDate(nextWeekStart);
      setSelectedDate(editForm.date);
      await loadMenuPlan(family.id, userId, nextWeekStart);
      setEditForm(null);
      showToast("Đã cập nhật món trong thực đơn.", "success");
    } catch (error) {
      showToast(getErrorMessage(error, "Không cập nhật được món trong thực đơn."), "error");
    } finally {
      setIsUpdatingMealItem(false);
    }
  };

  const deleteMealItem = async () => {
    if (!family?.id || !userId || !editForm) {
      showToast("Không đủ dữ liệu để xóa món khỏi bữa.", "error");
      return;
    }

    setIsUpdatingMealItem(true);
    try {
      await recommendationApi.deleteMealItem(editForm.mealItemId, {
        familyId: family.id,
        userId,
      });

      const nextWeekStart = toDateOnly(getWeekStart(parseDateOnly(editForm.date)));
      setWeekStartDate(nextWeekStart);
      setSelectedDate(editForm.date);
      await loadMenuPlan(family.id, userId, nextWeekStart);
      setEditForm(null);
      showToast("Đã xóa món khỏi bữa ăn.", "success");
    } catch (error) {
      showToast(getErrorMessage(error, "Không xóa được món khỏi bữa ăn."), "error");
    } finally {
      setIsUpdatingMealItem(false);
    }
  };

  return (
    <div className="menu-suggestion-layout">
      <Sidebar />

      <div className="menu-suggestion-page">
        <Topbar title="Danh sách thực đơn" searchPlaceholder="Tìm kiếm theo ngày" showSearch={false} />

        <main className="menu-suggestion">
          <section className="menu-calendar-strip" aria-label="Chọn ngày trong tuần">
            <button className="calendar-nav-btn" type="button" onClick={() => handleShiftWeek(-1)} aria-label="Tuần trước">
              <ChevronLeft size={20} />
            </button>

            <div className="menu-week-days">
              {weekDays.map((day) => {
                const dateString = toDateOnly(day);
                return (
                  <button
                    className={`menu-day-pill ${selectedDate === dateString ? "active" : ""}`}
                    key={dateString}
                    type="button"
                    onClick={() => setSelectedDate(dateString)}
                  >
                    <span>{weekdayShort[day.getDay()]}</span>
                    <strong>{day.getDate()}</strong>
                  </button>
                );
              })}
            </div>

            <button className="calendar-nav-btn" type="button" onClick={() => handleShiftWeek(1)} aria-label="Tuần sau">
              <ChevronRight size={20} />
            </button>
          </section>

          <section className="menu-page-grid">
            <div className="meal-sections">
              {isLoadingPlan ? (
                <div className="meal-empty-state">
                  <Loader2 className="menu-spin" size={24} />
                  <span>Đang tải thực đơn trong tuần...</span>
                </div>
              ) : (
                mealTypes.map((mealType) => {
                  const meal = getMealFromDay(selectedMenuDay, mealType);
                  const meta = mealMeta[mealType];

                  return (
                    <section className="meal-section" key={mealType}>
                      <header className="meal-section-header">
                        <div className="meal-title">
                          <span style={{ color: mealType === "DINNER" ? "#79401d" : "#006b55" }}>{meta.icon}</span>
                          <h2>{meta.label}</h2>
                          <span className="meal-time">{meta.time}</span>
                        </div>

                        <button className="meal-add-btn" type="button" onClick={() => openCreateModal("DAY", selectedDate)}>
                          <Plus size={16} />
                          Thêm món
                        </button>
                      </header>

                      {meal.recipes.length > 0 ? (
                        <div className="recipe-card-grid">
                          {meal.recipes.map((recipe) => (
                            <article className="menu-recipe-card" key={recipe.mealItemId}>
                              <div className="menu-recipe-image">
                                {recipe.imageUrl ? <img src={recipe.imageUrl} alt={recipe.recipeName} /> : getRecipeInitial(recipe.recipeName)}
                              </div>
                              <div className="recipe-status-row">
                                <span className="recipe-status-pill">{recipe.status || "CONFIRMED"}</span>
                                <Check size={16} color="#006b55" />
                              </div>
                              <h3>{recipe.recipeName}</h3>
                              <p>Đã được thêm vào {meta.label.toLowerCase()} ngày {formatDisplayDate(selectedDate)}.</p>
                              <button className="recipe-edit-btn" type="button" onClick={() => openEditMealItem(recipe, mealType)}>
                                <Edit3 size={14} />
                                Chỉnh sửa
                              </button>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="meal-empty-state">
                          <Utensils size={24} />
                          <strong>Chưa có món cho {meta.label.toLowerCase()}</strong>
                          <span>Dùng tạo tự động để lấy món phù hợp với tủ lạnh gia đình.</span>
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </div>

            <aside className="menu-side-panel">
              <section className="menu-side-card">
                <h2>{family?.name || "Gia đình"}</h2>
                <p>
                  Thực đơn ngày {formatDisplayDate(selectedDate)} được đọc từ meal plan đã lưu. Tạo tự động sẽ gọi thuật toán
                  recommendation cho từng slot bữa ăn.
                </p>
                <div className="menu-side-stat">
                  <div>
                    <strong>{selectedRecipeCount}</strong>
                    <span>món trong ngày</span>
                  </div>
                  <div>
                    <strong>{weekRecipeCount}</strong>
                    <span>món trong tuần</span>
                  </div>
                </div>
              </section>

              <section className="menu-side-card">
                <h3>Tạo thực đơn tự động</h3>
                <p>Hệ thống ưu tiên nguyên liệu có trong tủ, hạn sử dụng, bữa ăn, món yêu thích và tránh lặp món gần đây.</p>
                <button className="menu-primary-btn" type="button" onClick={() => openCreateModal("WEEK", selectedDate)}>
                  <Sparkles size={18} />
                  Tạo thực đơn tuần
                </button>
              </section>
            </aside>
          </section>
        </main>
      </div>

      {isModalOpen && (
        <div className="menu-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <section className="menu-modal" onClick={(event) => event.stopPropagation()}>
            <header className="menu-modal-header">
              <div>
                <h2>Tạo thực đơn mới</h2>
                <p>Chọn ngày bắt đầu, kiểu tạo và xem trước món được recommendation đề xuất.</p>
              </div>
              <button className="menu-icon-btn" type="button" onClick={() => setIsModalOpen(false)} aria-label="Đóng">
                <X size={18} />
              </button>
            </header>

            <div className="menu-modal-body">
              <div className="menu-modal-controls">
                <div className="menu-field">
                  <label htmlFor="menu-start-date">Chọn ngày bắt đầu</label>
                  <input
                    id="menu-start-date"
                    type="date"
                    value={draftStartDate}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDraftStartDate(value);
                      setDraftDays([]);
                    }}
                  />
                </div>

                <div className="menu-field">
                  <label>Loại thực đơn</label>
                  <div className="menu-segmented">
                    <button
                      className={draftMode === "DAY" ? "active" : ""}
                      type="button"
                      onClick={() => {
                        setDraftMode("DAY");
                        setDraftDays([]);
                      }}
                    >
                      Theo ngày
                    </button>
                    <button
                      className={draftMode === "WEEK" ? "active" : ""}
                      type="button"
                      onClick={() => {
                        setDraftMode("WEEK");
                        setDraftDays([]);
                      }}
                    >
                      Theo tuần
                    </button>
                  </div>
                </div>

                <button className="menu-primary-btn" type="button" onClick={generateDraft} disabled={isGenerating}>
                  {isGenerating ? <Loader2 size={18} /> : <Sparkles size={18} />}
                  {isGenerating ? "Đang tạo..." : "Tạo thực đơn tự động"}
                </button>
              </div>

              <section className="menu-preview-panel">
                <header className="menu-preview-header">
                  <h3>Xem trước thực đơn</h3>
                  <span className="menu-score-chip">
                    <Info size={13} /> Dựa trên khẩu vị và tủ lạnh gia đình
                  </span>
                </header>

                {draftDays.length === 0 ? (
                  <div className="menu-modal-empty">
                    <span>Nhấn “Tạo thực đơn tự động” để gọi backend recommendation và sinh bản xem trước.</span>
                  </div>
                ) : (
                  <div className="menu-preview-list">
                    {draftDays.map((day, index) => {
                      const date = parseDateOnly(day.date);
                      return (
                        <article className="menu-preview-day" key={day.date}>
                          <div className="menu-preview-day-head">
                            <span>Ngày {index + 1}: {formatDisplayDate(day.date)}</span>
                            <span>{weekdayLong[date.getDay()]}</span>
                          </div>

                          {day.meals.map((meal) => {
                            const meta = mealMeta[meal.mealType];
                            return (
                              <div className="menu-preview-meal" key={`${day.date}-${meal.mealType}`}>
                                <div className="menu-preview-meal-label">
                                  <span style={{ backgroundColor: meta.accent }} className="menu-icon-btn">
                                    {meta.icon}
                                  </span>
                                  {meta.label}
                                </div>

                                <div className="menu-preview-recipe">
                                  {meal.recommendation ? (
                                    <>
                                      <strong>{meal.recommendation.recipeName}</strong>
                                      <span>
                                        Khớp {meal.recommendation.matchPercent}% nguyên liệu · Thiếu{" "}
                                        {meal.recommendation.missingIngredients.length} nguyên liệu
                                      </span>
                                    </>
                                  ) : (
                                    <span>Không có món phù hợp với slot này.</span>
                                  )}
                                </div>

                                {meal.recommendation && <span className="menu-score-chip">Score {meal.recommendation.score}</span>}
                              </div>
                            );
                          })}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <footer className="menu-modal-footer">
              <button className="menu-secondary-btn" type="button" onClick={() => setIsModalOpen(false)}>
                Hủy
              </button>
              <button className="menu-primary-btn" type="button" onClick={saveDraft} disabled={isSaving || draftDays.length === 0}>
                {isSaving ? <Loader2 size={18} /> : <CalendarDays size={18} />}
                {isSaving ? "Đang lưu..." : "Lưu thực đơn"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {editForm && (
        <div className="menu-modal-backdrop" onClick={() => setEditForm(null)}>
          <section className="menu-modal menu-edit-modal" onClick={(event) => event.stopPropagation()}>
            <header className="menu-modal-header">
              <div>
                <h2>Chỉnh sửa món trong bữa</h2>
                <p>Đổi ngày, bữa ăn, trạng thái hoặc thay bằng món recommendation khác.</p>
              </div>
              <button className="menu-icon-btn" type="button" onClick={() => setEditForm(null)} aria-label="Đóng">
                <X size={18} />
              </button>
            </header>

            <div className="menu-modal-body">
              <div className="menu-modal-controls edit-controls">
                <div className="menu-field">
                  <label htmlFor="edit-meal-date">Ngày ăn</label>
                  <input
                    id="edit-meal-date"
                    type="date"
                    value={editForm.date}
                    onChange={(event) => updateEditForm({ date: event.target.value })}
                  />
                </div>

                <div className="menu-field">
                  <label htmlFor="edit-meal-type">Bữa ăn</label>
                  <select
                    id="edit-meal-type"
                    value={editForm.mealType}
                    onChange={(event) => updateEditForm({ mealType: event.target.value as MealType })}
                  >
                    {mealTypes.map((mealType) => (
                      <option key={mealType} value={mealType}>
                        {mealMeta[mealType].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="menu-field">
                  <label htmlFor="edit-meal-status">Trạng thái</label>
                  <select
                    id="edit-meal-status"
                    value={editForm.status}
                    onChange={(event) => updateEditForm({ status: event.target.value as EditMealForm["status"] })}
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SUGGESTED">SUGGESTED</option>
                  </select>
                </div>
              </div>

              <section className="menu-preview-panel">
                <header className="menu-preview-header">
                  <h3>Món thay thế</h3>
                  <span className="menu-score-chip">
                    <Info size={13} /> Đang chọn: {editForm.recipeName}
                  </span>
                </header>

                <div className="edit-recipe-options">
                  <button
                    className={`edit-recipe-option ${editForm.selectedRecipeId === editForm.currentRecipeId ? "selected" : ""}`}
                    type="button"
                    onClick={() => updateEditForm({ selectedRecipeId: editForm.currentRecipeId })}
                  >
                    <strong>{editForm.recipeName}</strong>
                    <span>Giữ món hiện tại</span>
                  </button>

                  {isLoadingEditOptions ? (
                    <div className="menu-modal-empty compact">
                      <Loader2 className="menu-spin" size={20} />
                      <span>Đang tải món gợi ý...</span>
                    </div>
                  ) : (
                    editOptions.map((recipe) => (
                      <button
                        className={`edit-recipe-option ${editForm.selectedRecipeId === recipe.recipeId ? "selected" : ""}`}
                        key={recipe.recipeId}
                        type="button"
                        onClick={() =>
                          updateEditForm({
                            selectedRecipeId: recipe.recipeId,
                            recipeName: recipe.recipeName,
                          })
                        }
                      >
                        <strong>{recipe.recipeName}</strong>
                        <span>
                          Score {recipe.score} · Khớp {recipe.matchPercent}% · Thiếu {recipe.missingIngredients.length} nguyên liệu
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </section>
            </div>

            <footer className="menu-modal-footer">
              <button className="menu-danger-btn" type="button" onClick={deleteMealItem} disabled={isUpdatingMealItem}>
                <Trash2 size={17} />
                Xóa khỏi bữa
              </button>
              <div className="menu-modal-actions">
                <button className="menu-secondary-btn" type="button" onClick={() => setEditForm(null)}>
                  Hủy
                </button>
                <button className="menu-primary-btn" type="button" onClick={saveMealItemEdit} disabled={isUpdatingMealItem}>
                  {isUpdatingMealItem ? <Loader2 size={18} /> : <Check size={18} />}
                  {isUpdatingMealItem ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}

      {toast && <div className={`menu-toast ${toast.variant}`}>{toast.message}</div>}
    </div>
  );
};

export default MenuSuggestion;
