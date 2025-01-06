import { useState, useEffect } from "react";
import {
  fetchItems,
  addItem,
  fetchInventoryHistory,
  addInventory,
  fetchSupportedItems,
} from "../../../../utils/supabaseFunctions";

export const useInventoryCheck = () => {
  const [items, setItems] = useState([]); // 項目一覧
  const [newInventorys, setNewInventorys] = useState({}); // 入力した在庫数を保持
  const [inventoryHistory, setInventoryHistory] = useState({}); // 在庫履歴
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
    const savedInventorys =
      JSON.parse(localStorage.getItem("newInventorys")) || {};
    setNewInventorys(savedInventorys);
  }, []);

  // ローカルストレージに入力途中のデータを保存
  useEffect(() => {
    // newInventorysが空でないときに実行
    if (Object.keys(newInventorys).length > 0) {
      localStorage.setItem("newInventorys", JSON.stringify(newInventorys));
    }
  }, [newInventorys]);

  // 在庫履歴をバックエンドから取得してグルーピング(非同期処理)
  const handleFetchInventoryHistory = async (itemId) => {
    try {
      const { unit1_history, unit2_history } = await fetchInventoryHistory(
        itemId
      ); // ユーザーごとの在庫履歴を取得

      // 日付を「分」単位で丸める
      const roundToMinute = (dateString) => {
        const date = new Date(dateString);
        date.setSeconds(0, 0); // 秒以降を切り捨て
        return date.toLocaleString("ja-JP", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        });
      };

      // unit1とunit2のデータをグルーピング
      const groupByDate = (history, key) => {
        history.forEach((entry) => {
          const roundedDate = roundToMinute(entry.date);
          if (!groupedHistory[roundedDate]) {
            groupedHistory[roundedDate] = {};
          }
          groupedHistory[roundedDate][key] = entry.inventory;
        });
      };

      const groupedHistory = {};

      groupByDate(unit1_history, "unit1_history");
      groupByDate(unit2_history, "unit2_history");

      // 在庫履歴を更新
      setInventoryHistory((prevHistory) => {
        const newHistory = { ...prevHistory };
        newHistory[itemId] = groupedHistory;
        return newHistory;
      });
    } catch (error) {
      console.error("Failed to fetch inventory history:", error);
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
      const { unit1_history } = await fetchInventoryHistory(items[0].id);
      console.log("unit1_history:", unit1_history);
      if (unit1_history.length > 0) {
        const latestUnit1Date = new Date(
          unit1_history[unit1_history.length - 1].date
        ).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
        latestCheckDate = latestUnit1Date;
      }
      console.log("latestCheckDate:", latestCheckDate);

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

  // setNewInventorysの更新
  const handleInventoryChange = (itemId, unit, inventory) => {
    setNewInventorys((prevInventorys) => {
      const updatedInventorys = { ...prevInventorys };
      if (!updatedInventorys[itemId]) {
        updatedInventorys[itemId] = {}; // 新規項目の場合は初期化
      }
      updatedInventorys[itemId][unit] = inventory; // 在庫数を更新
      return updatedInventorys;
    });
  };

  // キーパッドのボタンを押したときの処理
  const handleKeypadPress = (key) => {
    const currentInventory =
      newInventorys[currentItemId] && newInventorys[currentItemId][currentUnit]
        ? newInventorys[currentItemId][currentUnit]
        : "";
    const newInventory = currentInventory + key.toString();
    handleInventoryChange(currentItemId, currentUnit, newInventory); // 入力した在庫数を更新
  };

  // 入力した在庫数を削除
  const handleDelete = () => {
    handleInventoryChange(currentItemId, currentUnit, "");
  };

  // モーダルを表示
  const handleConfirmClick = () => {
    setModalMessage("本当に確定してよいですか？");
    setShowModal(true);
  };

  // モーダルで「はい」がクリックされたとき
  const handleModalYes = async () => {
    try {
      // スプレッドシートにデータを送信
      const GAS_ENDPOINT = import.meta.env.VITE_GAS_ENDPOINT;

      // 商品IDに対応する商品名と単位を取得
      const supportedItems = await fetchSupportedItems(); // { id, name, unit1, unit2 } の配列
      const itemMap = supportedItems.reduce((map, item) => {
        map[item.id] = item; // 商品IDをキーにデータをマッピング
        return map;
      }, {});

      const dataToSend = {
        items: Object.keys(newInventorys).map((itemId) => {
          const item = itemMap[itemId] || {};
          return {
            itemName: item.name || "", // 商品名
            unit1Inventory: newInventorys[itemId]?.unit1 || "", // 在庫1
            unit1Name: item.unit1 || "", // 単位1
            unit2Inventory: newInventorys[itemId]?.unit2 || "", // 在庫2
            unit2Name: item.unit2 || "", // 単位2
          };
        }),
      };

      const response = await fetch(GAS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (result.success) {
        console.log("Data successfully sent to Google Sheets");
      } else {
        console.error("Failed to send data:", result.error);
      }

      // Supabaseにデータを送信
      for (const itemId in newInventorys) {
        for (const unit in newInventorys[itemId]) {
          await addInventory(itemId, newInventorys[itemId][unit], unit); // 在庫を追加
        }
      }

      // 在庫数を初期化
      setNewInventorys({});
      // ローカルストレージのデータをリセット
      localStorage.removeItem("newInventorys");
      // exportToCSV(newInventorys, items);
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to add inventorys:", error);
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
      handleFetchInventoryHistory(itemId); // 在庫履歴を取得
    }
  };

  // フォーカスされている項目と単位を更新
  const handleFocus = (itemId, unit) => {
    setCurrentItemId(itemId);
    setCurrentUnit(unit);
  };

  // ある項目の在庫数が全て正しく入力されているかどうかチェック
  const allInventorysEntered = () => {
    // 項目がない場合は確定ボタンを無効にする
    if (items.length === 0) return false;

    // everyメソッドは，配列のすべての要素が条件を満たす場合にtrueを返す
    return items.every((item) => {
      // unit2が存在する場合はunit1とunit2の両方が入力されているかどうかチェック
      if (item.unit2) {
        return (
          newInventorys[item.id] &&
          newInventorys[item.id].unit1 !== undefined &&
          newInventorys[item.id].unit1 !== "" &&
          newInventorys[item.id].unit2 !== undefined &&
          newInventorys[item.id].unit2 !== ""
        );
      }
      // unit1のみチェック
      else {
        return (
          newInventorys[item.id] &&
          newInventorys[item.id].unit1 !== undefined &&
          newInventorys[item.id].unit1 !== ""
        );
      }
    });
  };

  // 全ての項目の在庫数が全て正しく入力されているかどうかチェック
  const isInventoryComplete = (item) => {
    // unit2が存在する場合はunit1とunit2の両方が入力されているかどうかチェック
    if (item.unit2) {
      return (
        newInventorys[item.id] &&
        newInventorys[item.id].unit1 !== undefined &&
        newInventorys[item.id].unit1 !== "" &&
        newInventorys[item.id].unit2 !== undefined &&
        newInventorys[item.id].unit2 !== ""
      );
    }
    // unit1のみチェック
    return (
      newInventorys[item.id] &&
      newInventorys[item.id].unit1 !== undefined &&
      newInventorys[item.id].unit1 !== ""
    );
  };

  return {
    items,
    newInventorys,
    inventoryHistory,
    accordionState,
    currentItemId,
    currentUnit,
    dailyCheckStatus,
    showModal,
    modalMessage,
    handleAddItem,
    handleKeypadPress,
    handleDelete,
    handleConfirmClick,
    handleModalYes,
    handleModalNo,
    toggleAccordion,
    handleFocus,
    allInventorysEntered,
    isInventoryComplete,
  };
};
