import PropTypes from "prop-types";
import { useAddItem } from "./hooks";

export const AddItem = ({ addItem }) => {
  const {
    newItem,
    unit1,
    unit2,
    isExpanded,
    setNewItem,
    setUnit1,
    setUnit2,
    setIsExpanded,
    handleAddItem,
  } = useAddItem(addItem);

  return (
    <div className="mt-3 mb-4">
      <button
        className="btn btn-danger"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "閉じる" : "項目を追加"}
      </button>

      {isExpanded && (
        <div className="ms-3 card mt-3" style={{ maxWidth: "600px" }}>
          <div className="card-body">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="項目名"
              />
              <input
                type="text"
                className="form-control"
                value={unit1}
                onChange={(e) => setUnit1(e.target.value)}
                placeholder="メイン単位"
              />
              <input
                type="text"
                className="form-control"
                value={unit2}
                onChange={(e) => setUnit2(e.target.value)}
                placeholder="サブ単位（任意）"
              />
              <button className="btn btn-danger" onClick={handleAddItem}>
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AddItem.propTypes = {
  addItem: PropTypes.func.isRequired,
};
