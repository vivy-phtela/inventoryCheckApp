import { useState } from "react";
import PropTypes from "prop-types";

export const ConfirmationModal = ({ show, message, onConfirm, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false); // ローディング状態
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null; // モーダルが表示されない場合は何も表示しない

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading} // ローディング中は無効化
            >
              いいえ
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={isLoading} // ローディング中は無効化
            >
              {isLoading ? (
                <div className="d-flex align-items-center">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  >
                    <span className="visually-hidden"></span>
                  </div>
                  Loading...
                </div>
              ) : (
                "はい"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
