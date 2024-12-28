import { useState } from "react";

export const useAddItem = (addItem) => {
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

  return {
    newItem,
    unit1,
    unit2,
    isExpanded,
    setNewItem,
    setUnit1,
    setUnit2,
    setIsExpanded,
    handleAddItem,
  };
};
