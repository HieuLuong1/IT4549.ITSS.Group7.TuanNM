import { CheckCircle2, TrendingUp } from 'lucide-react';
import React from 'react';
import './ProgressSection.css';

interface ProgressSectionProps {
    percentage: number;
    message: string;
    detail?: string;
    onClick?: () => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ percentage, message, detail = '', onClick }) => {

    return (
        <div className="progress-widget" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <div className="progress-compact-view">
                <div className="progress-info-left">
                    <div className="progress-icon-wrapper">
                        <TrendingUp size={18} color="#44BD97" />
                    </div>
                    <span className="progress-label">Tiến độ mua sắm</span>
                </div>
                <span className="progress-percentage-badge">{percentage}%</span>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar-track">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>


            <div className="progress-hover-content">
                <p className="progress-msg-text">{message}</p>
                {detail && <span className="progress-detail-tag">{detail}</span>}
                {percentage === 100 && (
                    <div className="complete-badge">
                        <CheckCircle2 size={14} /> Hoàn tất
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressSection;