import { supabase } from "./supabase";

// 現在のユーザーIDを取得する
const getUserId = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id;
};

// 全ての項目を取得
export const fetchItems = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};

// 項目を追加
export const addItem = async (item, unit1, unit2) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("items")
    .insert([{ item, unit1, unit2, user_id: userId }]);
  if (error) throw error;
  return data;
};

// 在庫履歴を取得
export const fetchInventoryHistory = async (itemId) => {
  const userId = await getUserId();

  // unit1の在庫履歴を取得
  const { data: unit1Data, error: unit1Error } = await supabase
    .from("inventory_history")
    .select("*")
    .eq("item_id", itemId)
    .eq("unit", "unit1")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(3); // 最新の3件のみ取得

  if (unit1Error) throw unit1Error;

  // unit2の在庫履歴を取得
  const { data: unit2Data, error: unit2Error } = await supabase
    .from("inventory_history")
    .select("*")
    .eq("item_id", itemId)
    .eq("unit", "unit2")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(3); // 最新の3件のみ取得

  if (unit2Error) throw unit2Error;

  return {
    unit1_history: unit1Data.map((sh) => ({
      inventory: sh.inventory,
      date: sh.date,
    })),
    unit2_history: unit2Data.map((sh) => ({
      inventory: sh.inventory,
      date: sh.date,
    })),
  };
};

// 在庫数を追加
export const addInventory = async (itemId, inventory, unit) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("inventory_history")
    .insert([{ item_id: itemId, inventory, unit, user_id: userId }]);
  if (error) throw error;
  return data;
};

// IDに対応している商品名、単位を取得
export const fetchSupportedItems = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("items")
    .select("id, item, unit1, unit2")
    .eq("user_id", userId);

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    name: item.item,
    unit1: item.unit1,
    unit2: item.unit2,
  }));
};
