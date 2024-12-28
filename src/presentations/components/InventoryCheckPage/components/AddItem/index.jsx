// 新しい項目を追加するフォームコンポーネント
import { useState } from "react";
import PropTypes from "prop-types";

export const AddItem = ({ addItem }) => {
  const [newItem, setNewItem] = useState(""); // 新しい項目
  const [unit1, setUnit1] = useState(""); // メイン単位
  const [unit2, setUnit2] = useState(""); // サブ単位
  const [isExpanded, setIsExpanded] = useState(false); // フォームの展開状態

  const handleAddItem = () => {
    if (newItem.trim() !== "" && unit1.trim() !== "") {
      const unit2Value = unit2.trim() === "" ? null : unit2.trim(); // サブ単位が空の場合はnullを入力
      addItem(newItem, unit1.trim(), unit2Value);
      setNewItem("");
      setUnit1("");
      setUnit2("");
      setIsExpanded(false); // 項目追加後にフォームを閉じる
    } else {
      alert("無効な入力です");
    }
  };

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
