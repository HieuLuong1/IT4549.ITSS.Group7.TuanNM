import { Check } from 'lucide-react';
import React from 'react';
import './WeeklyItemRow.css';

interface WeeklyItemRowProps {
    name: string;
    quantity: number;
    unit: string;
    usageDays: string[]; // ["T2", "T5"]
    isPurchased: boolean;
    onToggle: () => void;
}

const mapDayToShort = (day: string) => {
    if (day.startsWith("Thứ")) {
        return "T" + day.split(" ")[1];
    }
    return day; // e.g. CN
};

const WeeklyItemRow: React.FC<WeeklyItemRowProps> = ({ name, quantity, unit, usageDays, isPurchased, onToggle }) => {
    return (
        <div className={`weekly-item-row ${isPurchased ? 'completed' : ''}`}>
            <div className={`checkbox-circle ${isPurchased ? 'checked' : ''}`} onClick={onToggle}>
                {isPurchased && <Check size={14} color="white" />}
            </div>

            <div className="item-info">
                <span className="item-name">{name}</span>
                <div className="item-days">
                    {usageDays.map((day) => (
                        <span key={day} className="day-dot">{mapDayToShort(day)}</span>
                    ))}
                </div>
            </div>

            <div className="item-badge">
                {quantity} {unit}
            </div>
        </div>
    );
};

export default WeeklyItemRow;