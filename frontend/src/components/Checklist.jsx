import React, { useState, useEffect } from "react";
import Keypad from "./Keypad";
import AddItem from "./AddItem";
import "bootstrap/dist/css/bootstrap.min.css";

const Checklist = () => {
  const [items, setItems] = useState([]); // 項目一覧
  const [newStocks, setNewStocks] = useState({}); // 入力した在庫数を保持
  const [stockHistory, setStockHistory] = useState({}); // 在庫履歴
  const [accordionState, setAccordionState] = useState({}); // 履歴表示アコーディオンの開閉状態
  const [currentItemId, setCurrentItemId] = useState(null); // フォーカスされてる項目のID
  const [currentUnit, setCurrentUnit] = useState(null); // フォーカスされてる単位(unit1かunit2)
  const [dailyCheckStatus, setDailyCheckStatus] = useState("本日未実施"); // 実施状況

  // ページ読み込み時に1回だけ実行
  useEffect(() => {
    const fetchAndCheckItems = async () => {
      const fetchedItems = await fetchItems();
      checkDailyStatus(fetchedItems);
    };
    fetchAndCheckItems();
  }, []);

  // 項目をバックエンドから取得(非同期処理)
  const fetchItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/items");
      const data = await response.json();
      setItems(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  // 在庫履歴をバックエンドから取得してグルーピング(非同期処理)
  const fetchStockHistory = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/stocks/${itemId}`);
      const data = await response.json();

      // 日付ごとにunit1とunit2の在庫数をグルーピング
      const groupedHistory = {};
      ["unit1_history", "unit2_history"].forEach((unitType) => {
        data[unitType].forEach((entry) => {
          const date = new Date(entry.date).toLocaleString("ja-JP", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          });
          if (!groupedHistory[date]) {
            groupedHistory[date] = {};
          }
          groupedHistory[date][unitType] = entry.stock;
        });
      });

      // 在庫履歴を更新
      setStockHistory(function (prevHistory) {
        var newHistory = { ...prevHistory };
        newHistory[itemId] = groupedHistory;
        return newHistory;
      });
    } catch (error) {
      console.error("Failed to fetch stock history:", error);
    }
  };

  // 実施状況をチェック(非同期処理)
  const checkDailyStatus = async (items) => {
    try {
      // 今日の日付を取得
      const today = new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });

      let latestCheckDate = null;
      // unit1の最新の在庫履歴の日付だけを取得
      const response = await fetch(
        `http://localhost:5000/stocks/${items[0].id}`
      );
      const data = await response.json();
      const latestUnit1Date = new Date(
        data.unit1_history[0].date
      ).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
      latestCheckDate = latestUnit1Date;

      if (latestCheckDate === today) {
        setDailyCheckStatus("本日実施済み");
      } else {
        setDailyCheckStatus("本日未実施");
      }
    } catch (error) {
      console.error("Failed to check daily status:", error);
    }
  };

  // 新しい項目をバックエンドに送信(非同期処理)
  const addItem = async (item, unit1, unit2) => {
    try {
      await fetch("http://localhost:5000/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item, unit1, unit2 }),
      });
      fetchItems(); //最新の項目一覧を取得
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  // setNewStocksの更新
  const handleStockChange = (itemId, unit, stock) => {
    setNewStocks((prevStocks) => {
      const updatedStocks = { ...prevStocks };
      if (updatedStocks[itemId] === undefined) {
        updatedStocks[itemId] = {}; // 新規項目の場合は初期化
      }
      updatedStocks[itemId][unit] = stock; // 在庫数を更新
      return updatedStocks;
    });
  };

  // キーパッドのボタンを押したときの処理
  const handleKeypadPress = (key) => {
    const currentStock = // 現在の在庫数を取得
      newStocks[currentItemId] && newStocks[currentItemId][currentUnit]
        ? newStocks[currentItemId][currentUnit]
        : "";
    const newStock = currentStock + key.toString();
    handleStockChange(currentItemId, currentUnit, newStock); // 入力した在庫数を更新
  };

  // 入力した在庫数を削除
  const handleDelete = () => {
    handleStockChange(currentItemId, currentUnit, "");
  };

  // 入力した在庫数をバックエンドに送信(非同期処理)
  const addStocks = async () => {
    try {
      // newStocksオブジェクトの全てのitemIdを参照
      for (const itemId in newStocks) {
        // itemId内の全てのunitを参照
        for (const unit in newStocks[itemId]) {
          await fetch("http://localhost:5000/stocks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              item_id: itemId,
              stock: newStocks[itemId][unit],
              unit: unit,
            }),
          });
        }
      }
      setNewStocks({}); // 在庫数を初期化
      window.location.reload(); // ページをリロード
    } catch (error) {
      console.error("Failed to add stocks:", error);
    }
  };

  // アコーディオンの開閉状態を切り替え
  const toggleAccordion = (itemId) => {
    setAccordionState((prevState) => {
      const newState = { ...prevState };
      // 開いているときは閉じる、閉じているときは開く
      if (newState[itemId]) {
        newState[itemId] = false;
      } else {
        newState[itemId] = true;
      }
      return newState;
    });
    // アコーディオンが閉じているとき
    if (!accordionState[itemId]) {
      fetchStockHistory(itemId);
    }
  };

  // フォーカスされている項目と単位を更新
  const handleFocus = (itemId, unit) => {
    setCurrentItemId(itemId);
    setCurrentUnit(unit);
  };

  // ある項目の在庫数が全て正しく入力されているかどうかチェック
  const allStocksEntered = () => {
    // everyメソッドは，配列のすべての要素が条件を満たす場合にtrueを返す
    return items.every((item) => {
      // unit2が存在する場合はunit1とunit2の両方が入力されているかどうかチェック
      if (item.unit2) {
        return (
          newStocks[item.id] &&
          newStocks[item.id].unit1 !== undefined &&
          newStocks[item.id].unit1 !== "" &&
          newStocks[item.id].unit2 !== undefined &&
          newStocks[item.id].unit2 !== ""
        );
      }
      // unit1のみチェック
      else {
        return (
          newStocks[item.id] &&
          newStocks[item.id].unit1 !== undefined &&
          newStocks[item.id].unit1 !== ""
        );
      }
    });
  };

  // 全ての項目の在庫数が全て正しく入力されているかどうかチェック
  const isStockComplete = (item) => {
    // unit2が存在する場合はunit1とunit2の両方が入力されているかどうかチェック
    if (item.unit2) {
      return (
        newStocks[item.id] &&
        newStocks[item.id].unit1 !== undefined &&
        newStocks[item.id].unit1 !== "" &&
        newStocks[item.id].unit2 !== undefined &&
        newStocks[item.id].unit2 !== ""
      );
    }
    // unit1のみチェック
    return (
      newStocks[item.id] &&
      newStocks[item.id].unit1 !== undefined &&
      newStocks[item.id].unit1 !== ""
    );
  };

  return (
    <div className="containe-fluid p-5">
      <div className="d-flex align-items-center">
        <h1 className="fw-bold">Daily棚卸</h1>
        <span className="fw-bold ms-3">{dailyCheckStatus}</span>
      </div>
      <AddItem addItem={addItem} />
      <ul className="list-group">
        {items.map((item) => (
          <li
            key={item.id}
            className={`list-group-item ${
              // 入力されている場合は背景色を変更
              isStockComplete(item) ? "bg-info text-white" : ""
            }`}
            style={{ width: "70%", margin: "0 auto 0 0" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="flex-grow-1">{item.item}</div>
              <div className="d-flex flex-column align-items-center me-3">
                <input
                  type="number"
                  className={`form-control ${
                    // フォーカスされている場合は枠線の色を強調
                    currentItemId === item.id && currentUnit === "unit1"
                      ? "border-primary"
                      : "border-secondary"
                  }`}
                  style={{ width: "100px", textAlign: "center" }}
                  value={newStocks[item.id]?.unit1 || ""}
                  onFocus={() => handleFocus(item.id, "unit1")}
                  readOnly // キーパッドでしか入力できないようにする
                />
                <span className="mt-1">{item.unit1}</span>
              </div>
              {item.unit2 && (
                <div className="d-flex flex-column align-items-center me-3">
                  <input
                    type="number"
                    className={`form-control ${
                      currentItemId === item.id && currentUnit === "unit2"
                        ? "border-primary"
                        : "border-secondary"
                    }`}
                    style={{ width: "100px", textAlign: "center" }}
                    value={newStocks[item.id]?.unit2 || ""}
                    onFocus={() => handleFocus(item.id, "unit2")}
                    readOnly
                  />
                  <span className="mt-1">{item.unit2}</span>
                </div>
              )}
              <button
                className="btn btn-secondary" // アコーディオンの開閉ボタン
                onClick={() => toggleAccordion(item.id)}
              >
                {accordionState[item.id]
                  ? "在庫履歴を非表示"
                  : "在庫履歴を表示"}
              </button>
            </div>
            {accordionState[item.id] &&
              stockHistory[item.id] && ( // アコーディオンが開いていて，かつ在庫履歴が存在する場合に表示
                <ul className="list-group mt-2">
                  <li className="list-group-item">
                    <div className="d-flex flex-wrap">
                      {Object.keys(stockHistory[item.id]).map(
                        (
                          date,
                          index // 各日付ごとに在庫数を表示
                        ) => (
                          <div key={index} className="me-3">
                            <span>{date}</span>
                            <div>
                              <span style={{ color: "red" }}>
                                {stockHistory[item.id][date].unit1_history}
                              </span>
                              ({item.unit1})
                            </div>
                            {item.unit2 !== null && ( // unit2が存在する場合はunit2を表示
                              <div>
                                <span style={{ color: "blue" }}>
                                  {stockHistory[item.id][date].unit2_history}
                                </span>
                                ({item.unit2})
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </li>
                </ul>
              )}
          </li>
        ))}
      </ul>
      <div className="d-flex justify-content-end" style={{ width: "70%" }}>
        <button
          className="btn btn-success mt-3 btn-lg"
          onClick={addStocks}
          disabled={!allStocksEntered()} // すべての欄が入力されている場合のみ有効に
        >
          確定
        </button>
      </div>
      <Keypad
        handleKeypadPress={handleKeypadPress}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default Checklist;
