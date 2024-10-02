// 確認モーダルコンポーネント
const ConfirmationModal = ({ show, message, onConfirm, onCancel }) => {
  if (!show) return null; // モーダルが表示されていない場合は何もレンダリングしない

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
            >
              いいえ
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
            >
              はい
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
