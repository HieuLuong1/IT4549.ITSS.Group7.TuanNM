import React from "react";
import "./DeleteMember.css";

interface DeleteMemberProps {
  isOpen: boolean;
  memberName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteMember: React.FC<DeleteMemberProps> = ({
  isOpen,
  memberName,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dm-modal-overlay">
      <div className="dm-modal-container">
        
        {/* ĐỒNG BỘ: dm-icon-section */}
        <div className="dm-icon-section">
          <div className="dm-icon-circle">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#BA1A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
        </div>

        {/* ĐỒNG BỘ: dm-header-section */}
        <div className="dm-header-section">
          <h2 className="dm-title-text">Xác nhận xóa thành viên</h2>
        </div>

        {/* ĐỒNG BỘ: dm-body-section */}
        <div className="dm-body-section">
          <p className="dm-content-text">
            Bạn xác nhận xóa người dùng{" "}
            <span className="dm-highlight-name">{memberName}</span> khỏi
            <br />
            nhóm gia đình?
          </p>
        </div>

        {/* 🎯 ĐỒNG BỘ CHÍNH XÁC: Đổi dm-actions-group thành dm-footer-section để ăn khớp CSS */}
        <div className="dm-footer-section">
          <button className="dm-btn dm-btn-cancel" onClick={onClose}>
            Từ chối
          </button>

          <button className="dm-btn dm-btn-confirm" onClick={onConfirm}>
            <div className="dm-btn-shadow" />
            <span className="dm-btn-confirm-text">Đồng ý</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteMember;