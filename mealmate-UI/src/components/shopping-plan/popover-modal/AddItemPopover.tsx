import { Check, ChevronDown, Minus, Plus } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './AddItemPopover.css';

interface AddItemPopoverProps {
    foodName: string;
    foodIcon?: string;
    unit?: string; // Đã chuyển thành optional (?) để an toàn tuyệt đối với TypeScript
    onConfirm: (data: { quantity: number; assignedTo: number | null; note: string; customName?: string; unit?: string }) => void;
    onCancel: () => void;
    members?: any[];
}

// Mảng đơn vị thông dụng hệ thống khi chọn thực phẩm nhóm "khác"
const COMMON_UNITS = ["kg", "g", "quả", "hộp", "bó", "chai", "túi", "lít", "ml", "phần"];

// Hàm bổ trợ cắt chuỗi đơn vị bằng dấu phẩy có xử lý an toàn cho undefined và nhóm "khác"
const parseUnitOptions = (rawValue?: string, isGenericFood = false) => {
    if (!rawValue) {
        return isGenericFood ? COMMON_UNITS : ['kg'];
    }

    const normalized = rawValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    // Nếu thuộc nhóm "khác", trộn mảng đơn vị hiện tại với mảng đơn vị thông dụng hệ thống
    if (isGenericFood) {
        const combined = [...normalized, ...COMMON_UNITS];
        return Array.from(new Set(combined));
    }

    return normalized.length > 0 ? Array.from(new Set(normalized)) : ['kg'];
};

const AddItemPopover: React.FC<AddItemPopoverProps> = ({
    foodName,
    foodIcon = "🍎",
    unit,
    members = [],
    onConfirm,
    onCancel
}) => {
    const [quantity, setQuantity] = useState(1);
    const [assigneeId, setAssigneeId] = useState<number | ''>('');
    const [note, setNote] = useState('');
    const [customName, setCustomName] = useState('');
    
    const isOther = foodName.toLowerCase().includes("khác");

    // Băm chuỗi từ DB ra mảng dựa vào cờ kiểm tra nhóm thực phẩm "khác"
    const unitOptions = parseUnitOptions(unit, isOther);
    const [selectedUnit, setSelectedUnit] = useState(unitOptions[0] || 'kg');

    const getAssigneeName = () => {
        if (assigneeId === '') return 'Chọn người phụ trách';
        const found = members.find(m => m.id === assigneeId);
        return found ? found.fullName : 'Chọn người phụ trách';
    };

    const handleConfirm = () => {
        if (isOther && !customName.trim()) {
            toast.error("Vui lòng nhập tên thực phẩm cụ thể!");
            return;
        }
        onConfirm({
            quantity,
            assignedTo: assigneeId === '' ? null : assigneeId,
            note,
            customName: isOther ? customName.trim() : undefined,
            unit: selectedUnit // Gửi lên duy nhất 1 đơn vị được chọn từ dropdown
        });
    };

    // Cập nhật lại đơn vị nếu prop `unit` hoặc tên món ăn từ ngoài thay đổi
    React.useEffect(() => {
        const options = parseUnitOptions(unit, foodName.toLowerCase().includes("khác"));
        setSelectedUnit(options[0] || 'kg');
    }, [unit, foodName]);

    return (
        <div className="add-item-popover">
            {/* Tên thực phẩm */}
            <div className="popover-food-header">
                <span className="popover-food-icon">{foodIcon}</span>
                <span className="popover-food-name">{foodName}</span>
            </div>

            {isOther && (
                <div className="popover-row-vertical">
                    <label className="required-label">TÊN THỰC PHẨM CỤ THỂ</label>
                    <input
                        className="custom-name-input"
                        placeholder="Ví dụ: Rau cải cúc, Thịt bò Mỹ..."
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                    />
                </div>
            )}

            <div className="popover-divider"></div>

            {/* Người phụ trách */}
            <div className="popover-row">
                <label>GIAO CHO</label>
                <div className="custom-select">
                    <span>{getAssigneeName()}</span>
                    <ChevronDown size={16} />
                    <select
                        className="custom-select-native"
                        value={assigneeId}
                        onChange={(e) => {
                            const val = e.target.value;
                            setAssigneeId(val === '' ? '' : Number(val));
                        }}
                    >
                        <option value="">Chọn người phụ trách</option>
                        {members.map((m: any) => (
                            <option key={m.id} value={m.id}>{m.fullName}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Số lượng & Đơn vị dạng Dropdown */}
            <div className="popover-row-vertical">
                <label>SỐ LƯỢNG</label>
                <div className="quantity-controls">
                    <div className="quantity-input-box">
                        <button type="button" onClick={() => setQuantity(q => Math.max(0.5, q - 0.5))}><Minus size={14} /></button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                        <button type="button" onClick={() => setQuantity(q => q + 0.5)}><Plus size={14} /></button>
                    </div>

                    <select
                        className="popover-unit-select"
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                    >
                        {unitOptions.map(u => (
                            <option key={u} value={u}>{u.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Ghi chú nhanh */}
            <div className="popover-row-vertical">
                <input
                    className="note-input"
                    placeholder="Ghi chú nhanh..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            {/* Footer nút hành động */}
            <div className="popover-footer">
                <button type="button" className="popover-btn-cancel" onClick={onCancel}>Hủy</button>
                <button type="button" className="popover-btn-confirm" onClick={handleConfirm}>
                    <Check size={18} /> Xác nhận
                </button>
            </div>

            <div className="popover-arrow"></div>
        </div>
    );
};

export default AddItemPopover;