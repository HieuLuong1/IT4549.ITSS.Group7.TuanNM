import React, { useState } from "react";
import "./AddFoodToFridgeScreen.css";

type AddFoodMode = "SHOPPING_PLAN" | "MANUAL";
type ItemStatus = "selected" | "skipped";

type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  selectedByDefault?: boolean;
  expanded?: boolean;
};

type ShoppingCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: ShoppingItem[];
};

type AddFoodToFridgeScreenProps = {
  onCancel: () => void;
};

const shoppingCategories: ShoppingCategory[] = [
  {
    id: "dairy",
    name: "Trứng & Sữa",
    icon: "🥛",
    color: "#E5F5FF",
    items: [
      { id: "milk", name: "Sữa tươi nguyên chất", quantity: 2, unit: "L", selectedByDefault: true, expanded: true },
      { id: "egg", name: "Trứng gà ta", quantity: 10, unit: "quả", selectedByDefault: true, expanded: true },
    ],
  },
  {
    id: "meat",
    name: "Thịt",
    icon: "🥩",
    color: "#FFE5E5",
    items: [{ id: "beef", name: "Thịt bò thăn", quantity: 400, unit: "g" }],
  },
  {
    id: "seafood",
    name: "Hải sản",
    icon: "🦐",
    color: "#E5F5FF",
    items: [{ id: "shrimp", name: "Tôm sú tươi", quantity: 1, unit: "kg" }],
  },
];

const storageLocations = ["Ngăn mát", "Ngăn đông", "Tủ đồ khô"];
const specificLocations = ["Kệ trên", "Kệ giữa", "Kệ dưới", "Ngăn rau củ", "Cánh tủ"];
const categoryOptions = ["Trứng & Sữa", "Thịt", "Hải sản", "Rau củ", "Trái cây", "Đồ khô", "Gia vị"];
const unitOptions = ["g", "kg", "ml", "L", "quả", "hộp", "gói"];

const AddFoodToFridgeScreen: React.FC<AddFoodToFridgeScreenProps> = ({ onCancel }) => {
  const [mode, setMode] = useState<AddFoodMode>("SHOPPING_PLAN");
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemStatus>>(() => {
    return shoppingCategories.reduce<Record<string, ItemStatus>>((acc, category) => {
      category.items.forEach((item) => {
        acc[item.id] = item.selectedByDefault ? "selected" : "skipped";
      });
      return acc;
    }, {});
  });

  const selectedCount = Object.values(itemStatuses).filter((status) => status === "selected").length;
  const skippedCount = Object.values(itemStatuses).filter((status) => status === "skipped").length;

  const setItemStatus = (itemId: string, status: ItemStatus) => {
    setItemStatuses((current) => ({ ...current, [itemId]: status }));
  };

  return (
    <div className="add-fridge-screen">
      <header className="add-fridge-header">
        <button className="add-fridge-back" type="button" onClick={onCancel} aria-label="Quay lại tủ lạnh">
          <span />
        </button>
        <div>
          <h1>Thêm thực phẩm vào tủ lạnh</h1>
          <p>Xác nhận thực phẩm đã mua hoặc thêm thực phẩm thủ công vào tủ lạnh</p>
        </div>
      </header>

      <div className="add-fridge-tabs" role="tablist" aria-label="Cách thêm thực phẩm">
        <button
          className={mode === "SHOPPING_PLAN" ? "active" : ""}
          type="button"
          onClick={() => setMode("SHOPPING_PLAN")}
        >
          Từ kế hoạch đi chợ
        </button>
        <button className={mode === "MANUAL" ? "active" : ""} type="button" onClick={() => setMode("MANUAL")}>
          Thêm thủ công
        </button>
      </div>

      {mode === "SHOPPING_PLAN" ? (
        <div className="add-fridge-plan-layout">
          <section className="purchased-food-card">
            <h2>Danh sách thực phẩm đã mua</h2>
            <p>Chọn thực phẩm cần đưa vào tủ và bổ sung thông tin lưu trữ.</p>

            <div className="shopping-category-list">
              {shoppingCategories.map((category) => (
                <section className="shopping-category" key={category.id}>
                  <div className="shopping-category-header">
                    <div className="shopping-category-icon" style={{ backgroundColor: category.color }}>
                      {category.icon}
                    </div>
                    <div>
                      <h3>{category.name}</h3>
                      <p>{category.items.length} mục</p>
                    </div>
                  </div>

                  <div className="shopping-item-list">
                    {category.items.map((item) => {
                      const status = itemStatuses[item.id];
                      return (
                        <article className={`shopping-item ${status === "selected" ? "selected" : ""}`} key={item.id}>
                          <div className="shopping-item-main">
                            <button
                              className={`shopping-check ${status === "selected" ? "selected" : ""}`}
                              type="button"
                              onClick={() => setItemStatus(item.id, status === "selected" ? "skipped" : "selected")}
                              aria-label={status === "selected" ? "Bỏ chọn thực phẩm" : "Chọn thực phẩm"}
                            >
                              {status === "selected" && <span />}
                            </button>

                            <div className="shopping-item-info">
                              <div className="shopping-item-topline">
                                <h4>{item.name}</h4>
                                <div className="shopping-item-actions">
                                  <button
                                    className={status === "selected" ? "active" : ""}
                                    type="button"
                                    onClick={() => setItemStatus(item.id, "selected")}
                                  >
                                    Đã mua
                                  </button>
                                  <button
                                    className={status === "skipped" ? "active skip" : ""}
                                    type="button"
                                    onClick={() => setItemStatus(item.id, "skipped")}
                                  >
                                    Bỏ qua
                                  </button>
                                </div>
                              </div>
                              <p>
                                Đã mua: {item.quantity} {item.unit}
                              </p>
                            </div>
                          </div>

                          {item.expanded && status === "selected" && (
                            <div className="shopping-item-fields">
                              <Field label="SL nhập" value={String(item.quantity)} />
                              <Field label="Đơn vị" as="select" options={unitOptions} value={item.unit} />
                              <Field label="Hạn sử dụng" type="date" />
                              <Field label="Danh mục" as="select" options={categoryOptions} value={category.name} />
                              <Field label="Vị trí chính" as="select" options={storageLocations} value="Ngăn mát" />
                              <Field label="Vị trí cụ thể" as="select" options={specificLocations} value="Kệ giữa" />
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </section>

          <aside className="add-fridge-summary">
            <h2>Tóm tắt nhập tủ</h2>

            <div className="add-fridge-summary-stats">
              <SummaryBox label="Đã chọn" value={selectedCount} variant="selected" />
              <SummaryBox label="Cần bổ sung HSD" value={0} variant="warning" />
              <SummaryBox label="Bỏ qua" value={skippedCount} variant="muted" />
            </div>

            <div className="add-fridge-note">
              <h3>Lưu ý</h3>
              <ul>
                <li>Chỉ thực phẩm đã chọn mới được thêm vào tủ.</li>
                <li>Cần bổ sung hạn sử dụng và vị trí lưu trữ.</li>
                <li>Có thể bỏ qua thực phẩm đã dùng ngay.</li>
              </ul>
            </div>

            <div className="add-fridge-summary-actions">
              <button type="button" onClick={onCancel}>
                Hủy
              </button>
              <button type="button">Xác nhận thêm vào tủ</button>
            </div>
          </aside>
        </div>
      ) : (
        <section className="manual-add-card">
          <h2>Thêm thực phẩm thủ công</h2>
          <p>Nhập thông tin thực phẩm cần lưu trữ trong tủ lạnh.</p>

          <div className="manual-form">
            <Field label="Tên thực phẩm" required placeholder="Nhập tên thực phẩm" wide />
            <Field label="Danh mục" required as="select" options={categoryOptions} />
            <Field label="Số lượng" required placeholder="Nhập số lượng" />
            <Field label="Đơn vị" required as="select" options={unitOptions} />
            <Field label="Ngày nhập" type="date" />
            <Field label="Hạn sử dụng" required type="date" />
            <Field label="Vị trí chính" required as="select" options={storageLocations} />
            <Field label="Vị trí cụ thể" as="select" options={specificLocations} />
            <Field label="Ghi chú" placeholder="Nhập ghi chú nếu có" wide multiline />
          </div>

          <div className="manual-form-actions">
            <button type="button" onClick={onCancel}>
              Hủy
            </button>
            <button type="button">Thêm vào tủ</button>
          </div>
        </section>
      )}
    </div>
  );
};

type FieldProps = {
  label: string;
  required?: boolean;
  value?: string;
  placeholder?: string;
  type?: string;
  as?: "input" | "select";
  options?: string[];
  wide?: boolean;
  multiline?: boolean;
};

const Field: React.FC<FieldProps> = ({
  label,
  required,
  value,
  placeholder,
  type = "text",
  as = "input",
  options = [],
  wide,
  multiline,
}) => {
  return (
    <label className={`add-fridge-field ${wide ? "wide" : ""} ${multiline ? "multiline" : ""}`}>
      <span>
        {label} {required && <strong>*</strong>}
      </span>
      {multiline ? (
        <textarea placeholder={placeholder} />
      ) : as === "select" ? (
        <select defaultValue={value || ""}>
          {!value && <option value="">Chọn {label.toLowerCase()}</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} defaultValue={value} placeholder={placeholder} />
      )}
    </label>
  );
};

type SummaryBoxProps = {
  label: string;
  value: number;
  variant: "selected" | "warning" | "muted";
};

const SummaryBox: React.FC<SummaryBoxProps> = ({ label, value, variant }) => {
  return (
    <div className={`summary-box ${variant}`}>
      <span>{label}</span>
      <strong>{String(value).padStart(2, "0")}</strong>
    </div>
  );
};

export default AddFoodToFridgeScreen;
