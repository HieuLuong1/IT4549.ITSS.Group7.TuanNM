import React, { useEffect, useState } from 'react';
import { getWeeklyAggregate, toggleWeeklyItemStatus } from '@/features/shopping-plan/shoppingApi';
import type { WeeklyShoppingAggregate } from '@/features/shopping-plan/shopping';
import CategoryCard from './CategoryCard';
import WeeklyItemRow from './WeeklyItemRow';
import toast from 'react-hot-toast';
import './WeeklyAggregateView.css';

interface WeeklyAggregateViewProps {
    familyId: number | null;
    startDate: string;
    onToggleSuccess?: () => void;
}

const categoryIcons: Record<string, string> = {
    'Rau củ': '🥦',
    'Thịt & Hải sản': '🥩',
    'Sữa & Trứng': '🥛',
    'Gia vị': '🧂',
    'Đồ khô': '🍞'
};

const WeeklyAggregateView: React.FC<WeeklyAggregateViewProps> = ({ familyId, startDate, onToggleSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<WeeklyShoppingAggregate[]>([]);

    const fetchWeeklyAggregate = async () => {
        if (!familyId) return;
        try {
            setLoading(true);
            const data = await getWeeklyAggregate(familyId, startDate);
            setItems(data);
        } catch (error: any) {
            console.error('Error fetching weekly aggregate:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeeklyAggregate();
    }, [familyId, startDate]);

    const handleToggle = async (item: WeeklyShoppingAggregate) => {
        if (!familyId) return;
        const newStatus = !item.isPurchased;
        
        // Optimistic UI Update
        setItems(prev => prev.map(i => i.foodId === item.foodId ? { ...i, isPurchased: newStatus } : i));

        try {
            await toggleWeeklyItemStatus(familyId, item.foodId, startDate, newStatus);
            toast.success(`Đã cập nhật trạng thái ${item.foodName} ✨`);
            if (onToggleSuccess) {
                onToggleSuccess();
            }
        } catch (error: any) {
            toast.error('Lỗi khi cập nhật trạng thái: ' + error.message);
            // Revert state on error
            setItems(prev => prev.map(i => i.foodId === item.foodId ? { ...i, isPurchased: !newStatus } : i));
        }
    };

    if (loading) {
        return (
            <div className="weekly-loading">
                Đang tải dữ liệu gộp tuần...
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="weekly-empty-state">
                <span className="empty-icon">🛒</span>
                <span className="empty-text">Không có thực phẩm nào trong tuần này</span>
            </div>
        );
    }

    // Group items by categoryName
    const grouped = items.reduce((acc: Record<string, WeeklyShoppingAggregate[]>, item) => {
        const cat = item.categoryName || 'Khác';
        if (!acc[cat]) {
            acc[cat] = [];
        }
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <div className="weekly-aggregate-layout">
            {Object.entries(grouped).map(([category, catItems]) => (
                <CategoryCard
                    key={category}
                    title={category}
                    icon={categoryIcons[category] || '📦'}
                    itemCount={catItems.length}
                >
                    {catItems.map(item => (
                        <WeeklyItemRow
                            key={item.foodId}
                            name={item.foodName}
                            quantity={item.totalQuantity}
                            unit={item.unit}
                            usageDays={item.neededDays}
                            isPurchased={item.isPurchased}
                            onToggle={() => handleToggle(item)}
                        />
                    ))}
                </CategoryCard>
            ))}
        </div>
    );
};

export default WeeklyAggregateView;
