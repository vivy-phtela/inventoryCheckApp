import { useState, useEffect } from "react";
import Keypad from "./Keypad";
import AddItem from "./AddItem";
import ConfirmationModal from "./ConfirmationModal";
import ChecklistItem from "./ChecklistItem";
import Header from "./Header";
import LogoutButton from "./LogoutButton";
import {
  fetchItems,
  addItem,
  fetchStockHistory,
  addStock,
} from "../../utils/supabaseFunctions";
import { exportToCSV } from "../../utils/exportToCSV";

const Checklist = () => {
  const [items, setItems] = useState([]); // 項目一覧
  const [newStocks, setNewStocks] = useState({}); // 入力した在庫数を保持
  const [stockHistory, setStockHistory] = useState({}); // 在庫履歴
  const [accordionState, setAccordionState] = useState({}); // 履歴表示アコーディオンの開閉状態
  const [currentItemId, setCurrentItemId] = useState(null); // フォーカスされてる項目のID
  const [currentUnit, setCurrentUnit] = useState(null); // フォーカスされてる単位(unit1かunit2)
  const [dailyCheckStatus, setDailyCheckStatus] = useState("本日未実施"); // 実施状況
  const [showModal, setShowModal] = useState(false); // モーダルの表示状態
  const [modalMessage, setModalMessage] = useState(""); // モーダルに表示するメッセージ

  // データを取得(非同期処理)
  useEffect(() => {
    const fetchAndCheckItems = async () => {
      const fetchedItems = await fetchItems(); // ユーザーごとの項目を取得
      setItems(fetchedItems);
      checkDailyStatus(fetchedItems); // 実施状況をチェック
    };
    fetchAndCheckItems();
  }, []);

  // ローカルストレージから入力途中のデータを取得
  useEffect(() => {
    const savedStocks = JSON.parse(localStorage.getItem("newStocks")) || {};
    setNewStocks(savedStocks);
  }, []);

  // ローカルストレージに入力途中のデータを保存
  useEffect(() => {
    // newStocksが空でないときに実行
    if (Object.keys(newStocks).length > 0) {
      localStorage.setItem("newStocks", JSON.stringify(newStocks));
    }
  }, [newStocks]);

  // 在庫履歴をバックエンドから取得してグルーピング(非同期処理)
  const handleFetchStockHistory = async (itemId) => {
    try {
      const { unit1_history, unit2_history } = await fetchStockHistory(itemId); // ユーザーごとの在庫履歴を取得

      // 日付ごとにunit1とunit2の在庫数をグルーピング
      const groupedHistory = {};
      unit1_history.forEach((entry) => {
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
        groupedHistory[date].unit1_history = entry.stock;
      });

      unit2_history.forEach((entry) => {
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
        groupedHistory[date].unit2_history = entry.stock;
      });

      // 在庫履歴を更新
      setStockHistory((prevHistory) => {
        const newHistory = { ...prevHistory };
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
      if (items.length === 0) {
        setDailyCheckStatus("本日未実施");
        return;
      }

      // 今日の日付を取得
      const today = new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });

      let latestCheckDate = null;
      // unit1の最新の在庫履歴の日付だけを取得
      const { unit1_history } = await fetchStockHistory(items[0].id);
      if (unit1_history.length > 0) {
        const latestUnit1Date = new Date(
          unit1_history[0].date
        ).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
        latestCheckDate = latestUnit1Date;
      }

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
  const handleAddItem = async (item, unit1, unit2) => {
    try {
      await addItem(item, unit1, unit2); // ユーザーごとの項目を追加
      const fetchedItems = await fetchItems();
      setItems(fetchedItems); // 最新の項目一覧を取得
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  // setNewStocksの更新
  const handleStockChange = (itemId, unit, stock) => {
    setNewStocks((prevStocks) => {
      const updatedStocks = { ...prevStocks };
      if (!updatedStocks[itemId]) {
        updatedStocks[itemId] = {}; // 新規項目の場合は初期化
      }
      updatedStocks[itemId][unit] = stock; // 在庫数を更新
      return updatedStocks;
    });
  };

  // キーパッドのボタンを押したときの処理
  const handleKeypadPress = (key) => {
    const currentStock =
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

  // モーダルを表示
  const handleConfirmClick = () => {
    setModalMessage("本当に確定してよいですか？");
    setShowModal(true);
  };

  // モーダルで「はい」がクリックされたとき
  const handleModalYes = async () => {
    try {
      // データを送信
      // console.log(newStocks);
      for (const itemId in newStocks) {
        for (const unit in newStocks[itemId]) {
          await addStock(itemId, newStocks[itemId][unit], unit); // 在庫を追加
        }
      }
      // 在庫数を初期化
      setNewStocks({});
      // ローカルストレージのデータをリセット
      localStorage.removeItem("newStocks");
      // CSVを出力
      exportToCSV(newStocks, items);
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to add stocks:", error);
    }
  };

  // モーダルで「いいえ」がクリックされたとき
  const handleModalNo = () => {
    setShowModal(false);
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
      handleFetchStockHistory(itemId); // 在庫履歴を取得
    }
  };

  // フォーカスされている項目と単位を更新
  const handleFocus = (itemId, unit) => {
    setCurrentItemId(itemId);
    setCurrentUnit(unit);
  };

  // ある項目の在庫数が全て正しく入力されているかどうかチェック
  const allStocksEntered = () => {
    // 項目がない場合は確定ボタンを無効にする
    if (items.length === 0) return false;

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
    <div className="container-fluid p-5">
      <div className="d-flex justify-content-between align-items-center">
        <Header dailyCheckStatus={dailyCheckStatus} />
        <LogoutButton />
      </div>
      <AddItem addItem={handleAddItem} />
      <ul className="list-group">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={{
              ...item,
              currentUnit: currentItemId === item.id ? currentUnit : null,
            }}
            newStock={newStocks[item.id] || {}}
            onFocus={handleFocus}
            onAccordionToggle={toggleAccordion}
            isComplete={isStockComplete(item)}
            isAccordionOpen={accordionState[item.id]}
            stockHistory={stockHistory[item.id]}
          />
        ))}
      </ul>
      <div className="d-flex justify-content-end" style={{ width: "70%" }}>
        <button
          className="btn btn-success mt-3 btn-lg"
          onClick={handleConfirmClick}
          disabled={!allStocksEntered()} // すべての欄が入力されている場合のみ有効に
        >
          確定
        </button>
      </div>
      <Keypad
        handleKeypadPress={handleKeypadPress}
        handleDelete={handleDelete}
      />

      <ConfirmationModal
        show={showModal}
        message={modalMessage}
        onConfirm={handleModalYes}
        onCancel={handleModalNo}
      />
    </div>
  );
};

export default Checklist;
