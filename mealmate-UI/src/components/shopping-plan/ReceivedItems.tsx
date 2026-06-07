import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  clearPendingShoppingItems,
  getPendingShoppingItems,
  removePendingShoppingItem,
  subscribePendingShoppingItems,
  type PendingShoppingItem,
  type PendingShoppingSource,
} from "@/features/shopping-plan/shoppingSuggestions";
import "./ReceivedItems.css";

interface ReceivedItemsProps {
  /** Thêm một nguyên liệu nhận được vào danh sách kế hoạch hiện tại. */
  onItemAdd: (item: PendingShoppingItem) => void;
}

const sourceMeta: Record<PendingShoppingSource, { label: string; emoji: string }> = {
  FRIDGE_EXPIRING: { label: "Từ tủ lạnh", emoji: "🧊" },
  RECIPE_MISSING: { label: "Gợi ý món ăn", emoji: "🍽️" },
  MEAL_MISSING: { label: "Kế hoạch bữa ăn", emoji: "📅" },
};

const formatQuantity = (quantity: number, unit: string) => {
  const value = Number.isInteger(quantity) ? String(quantity) : String(Number(quantity.toFixed(2)));
  return `${value} ${unit}`.trim();
};

const ReceivedItems: React.FC<ReceivedItemsProps> = ({ onItemAdd }) => {
  const [items, setItems] = useState<PendingShoppingItem[]>([]);

  useEffect(() => {
    setItems(getPendingShoppingItems());
    const unsubscribe = subscribePendingShoppingItems(() => {
      setItems(getPendingShoppingItems());
    });
    return unsubscribe;
  }, []);

  if (items.length === 0) return null;

  const handleAdd = (item: PendingShoppingItem) => {
    onItemAdd(item);
    removePendingShoppingItem(item.foodId);
  };

  return (
    <div className="received-items-container">
      <div className="received-header">
        <div className="received-icon-box">
          <div className="received-icon-inner">📥</div>
        </div>
        <h3 className="received-title">Nguyên liệu cần bổ sung</h3>
        <button
          type="button"
          className="received-clear-btn"
          onClick={() => clearPendingShoppingItems()}
          title="Xóa tất cả gợi ý nhận được"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <p className="received-subtitle">Nguyên liệu vừa gửi sang từ Tủ lạnh, Gợi ý món ăn và Kế hoạch bữa ăn.</p>

      <div className="received-list">
        {items.map((item) => (
          <div key={item.foodId} className="received-row" title={sourceMeta[item.source]?.label}>
            {/* Chấm tròn – đồng bộ với FrequentItems */}
            <div className="received-item-check">
              <div className="received-check-dot" />
            </div>
            <span className="received-item-name">{item.foodName}</span>
            <span className="received-item-unit">{formatQuantity(item.quantity, item.unit)}</span>
            <button
              type="button"
              className="received-add-btn"
              onClick={() => handleAdd(item)}
              title="Thêm vào danh sách"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceivedItems;
