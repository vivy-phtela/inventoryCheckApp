// 項目追加コンポーネント
import React, { useState } from "react";

const AddItem = ({ addItem }) => {
  const [newItem, setNewItem] = useState(""); // 新しい項目
  const [unit1, setUnit1] = useState(""); // メイン単位
  const [unit2, setUnit2] = useState(""); // サブ単位

  const handleAddItem = () => {
    if (newItem.trim() !== "" && unit1.trim() !== "") {
      const unit2Value = unit2.trim() === "" ? null : unit2.trim(); // サブ単位が空の場合はnullを入力
      addItem(newItem, unit1.trim(), unit2Value);
      setNewItem("");
      setUnit1("");
      setUnit2("");
    }
  };

  return (
    <div className="input-group mt-4 mb-5">
      <input
        type="text"
        className="form-control"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder="新たな項目を追加"
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
        placeholder="サブ単位"
      />
      <button className="btn btn-danger" onClick={handleAddItem}>
        追加
      </button>
    </div>
  );
};

export default AddItem;
