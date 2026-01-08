import React from 'react';
import './ConfirmModal.css';

/**
 * 现代化确认对话框组件
 * 替换复古的 window.confirm
 */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <div className="confirm-icon">⚠️</div>
          <h3 className="confirm-title">{title}</h3>
        </div>

        <div className="confirm-body">
          <p className="confirm-message">{message}</p>
        </div>

        <div className="confirm-footer">
          <button
            className="confirm-btn confirm-btn-cancel"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="confirm-btn confirm-btn-ok"
            onClick={onConfirm}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
