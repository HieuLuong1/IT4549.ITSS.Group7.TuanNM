// ============================================================
// Cầu nối "Bổ sung vào Kế hoạch đi chợ" giữa các trang.
//
// Các trang Tủ lạnh (thực phẩm sắp hết/hết hạn), Gợi ý món ăn và
// Kế hoạch bữa ăn (nguyên liệu còn thiếu) sẽ "gửi" nguyên liệu vào đây.
// Trang Kế hoạch đi chợ (modal Lập kế hoạch mới → Gợi ý) sẽ "nhận"
// các nguyên liệu này và hiển thị thành một mục gợi ý riêng.
//
// Lưu ở localStorage để dữ liệu tồn tại khi điều hướng giữa các trang,
// kèm một CustomEvent để các component đang mở cập nhật theo thời gian thực.
// ============================================================

export type PendingShoppingSource = "FRIDGE_EXPIRING" | "RECIPE_MISSING" | "MEAL_MISSING";

export interface PendingShoppingItem {
  foodId: number;
  foodName: string;
  unit: string;
  quantity: number;
  /** Nguồn gốc nguyên liệu để hiển thị nhãn phù hợp. */
  source: PendingShoppingSource;
  /** Ghi chú gợi ý (vd: "Sắp hết hạn", "Thiếu cho Canh chua cá"). */
  note?: string;
  addedAt: number;
}

const STORAGE_KEY = "mealmate.pendingShoppingItems";
export const PENDING_SHOPPING_EVENT = "mealmate:pending-shopping-changed";

const isBrowser = typeof window !== "undefined";

const emitChange = () => {
  if (!isBrowser) return;
  window.dispatchEvent(new CustomEvent(PENDING_SHOPPING_EVENT));
};

const normalizeQuantity = (value: unknown): number => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 1;
  return Number(num.toFixed(2));
};

export const getPendingShoppingItems = (): PendingShoppingItem[] => {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PendingShoppingItem =>
        item && typeof item === "object" && Number.isFinite(Number(item.foodId)),
    );
  } catch {
    return [];
  }
};

const writeItems = (items: PendingShoppingItem[]) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    emitChange();
  } catch {
    /* bỏ qua lỗi quota localStorage */
  }
};

export interface AddPendingShoppingItemInput {
  foodId: number;
  foodName: string;
  unit?: string;
  quantity?: number;
  source: PendingShoppingSource;
  note?: string;
}

/**
 * Thêm một hoặc nhiều nguyên liệu vào hàng chờ.
 * Nếu trùng foodId, mục mới sẽ ghi đè (cập nhật số lượng/ghi chú mới nhất).
 * Trả về số lượng nguyên liệu thực sự được thêm mới (chưa có trước đó).
 */
export const addPendingShoppingItems = (
  inputs: AddPendingShoppingItemInput[],
): number => {
  if (!inputs.length) return 0;

  const current = getPendingShoppingItems();
  const byFoodId = new Map<number, PendingShoppingItem>();
  current.forEach((item) => byFoodId.set(item.foodId, item));

  let newlyAdded = 0;
  inputs.forEach((input) => {
    const foodId = Number(input.foodId);
    if (!Number.isFinite(foodId)) return;
    if (!byFoodId.has(foodId)) newlyAdded += 1;

    byFoodId.set(foodId, {
      foodId,
      foodName: input.foodName || "Thực phẩm",
      unit: input.unit || "kg",
      quantity: normalizeQuantity(input.quantity),
      source: input.source,
      note: input.note,
      addedAt: Date.now(),
    });
  });

  writeItems(Array.from(byFoodId.values()).sort((a, b) => b.addedAt - a.addedAt));
  return newlyAdded;
};

export const removePendingShoppingItem = (foodId: number) => {
  const next = getPendingShoppingItems().filter((item) => item.foodId !== Number(foodId));
  writeItems(next);
};

export const clearPendingShoppingItems = () => {
  writeItems([]);
};

/** Đăng ký lắng nghe thay đổi (kể cả từ tab khác). Trả về hàm hủy đăng ký. */
export const subscribePendingShoppingItems = (listener: () => void): (() => void) => {
  if (!isBrowser) return () => undefined;
  const storageListener = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener(PENDING_SHOPPING_EVENT, listener);
  window.addEventListener("storage", storageListener);
  return () => {
    window.removeEventListener(PENDING_SHOPPING_EVENT, listener);
    window.removeEventListener("storage", storageListener);
  };
};
