import type { ShoppingListItem } from '@/features/shopping-plan/shopping';
import { updateItemNote } from '@/features/shopping-plan/shoppingApi';
import { Check, ChevronDown, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import './ShoppingItemRow.css';

interface RowProps {
    item: ShoppingListItem;
    mode: 'CREATE' | 'DETAIL';
    members?: any[];
    onUpdate?: (id: number, fields: Partial<ShoppingListItem>) => void;
    onDelete?: (id: number) => void;
    onToggleStatus?: (id: number) => void;
}

const ShoppingItemRow: React.FC<RowProps> = ({ item, mode, members = [], onUpdate, onDelete, onToggleStatus }) => {
    const [localNote, setLocalNote] = useState(item.note || '');

    useEffect(() => {
        setLocalNote(item.note || '');
    }, [item.note]);

    const handleDetailNoteBlur = async () => {
        if (localNote !== (item.note || '')) {
            try {
                await updateItemNote(item.id, localNote);
                toast.success(`Đã lưu ghi chú cho ${item.foodName || 'thực phẩm'}`);
                onUpdate?.(item.id, { note: localNote });
            } catch (error: any) {
                toast.error("Lưu ghi chú thất bại: " + error.message);
                // Revert to old note value if API fails
                setLocalNote(item.note || '');
            }
        }
    };

    if (mode === 'CREATE') {
        const selectedMember = members.find(m => m.id === item.assignedTo);
        const displayName = selectedMember ? selectedMember.name : (item.assigneeName || 'Chưa giao');
        return (
            <div className="shopping-row-edit">
                <div className="food-info-edit">
                    <span className="food-name">{item.foodName || 'Thực phẩm'}</span>
                    <input
                        className="item-note-input"
                        type="text"
                        value={item.note || ''}
                        placeholder="Thêm lưu ý..."
                        onChange={(e) => onUpdate?.(item.id, { note: e.target.value })}
                    />
                </div>

                <div className="input-group">
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdate?.(item.id, { quantity: Number(e.target.value) })}
                    />
                    <span className="unit-label">{item.unit}</span>
                </div>

                <div className="assignee-select-wrapper">
                    <span className="assignee-display-text">{displayName}</span>
                    <ChevronDown size={14} className="assignee-chevron" />
                    <select
                        className="assignee-dropdown-hidden"
                        value={item.assignedTo || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            onUpdate?.(item.id, {
                                assignedTo: val === '' ? undefined : Number(val)
                            });
                        }}
                    >
                        <option value="">Chưa giao</option>
                        {members.map((m: any) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="delete-row-btn" onClick={() => onDelete?.(item.id)}>
                    <X size={16} />
                </button>
            </div>
        );
    }

    // --- GIAO DIỆN LÚC XEM CHI TIẾT (CÓ CHECKBOX) ---
    return (
        <div className={`shopping-row-view ${item.isPurchased ? 'completed' : ''}`}>
            <div
                className={`checkbox ${item.isPurchased ? 'checked' : ''}`}
                onClick={() => onToggleStatus?.(item.id)}
            >
                {item.isPurchased && <Check size={14} color="white" />}
            </div>

            <div className="food-info-display">
                <span className="food-name-display">{item.foodName}</span>
                <input
                    className="item-note-input"
                    type="text"
                    value={localNote}
                    placeholder="Thêm lưu ý..."
                    onChange={(e) => setLocalNote(e.target.value)}
                    onBlur={handleDetailNoteBlur}
                />
            </div>

            <div className="quantity-display">
                {item.quantity} {item.unit}
            </div>

            <div className="assignee-badge">
                {item.assignee?.name || 'Chưa giao'}
            </div>
        </div>
    );
};

export default ShoppingItemRow;