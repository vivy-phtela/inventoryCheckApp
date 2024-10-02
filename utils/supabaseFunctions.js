import { supabase } from "./supabase";

// 全ての項目を取得
export const fetchItems = async () => {
  const { data, error } = await supabase.from("items").select("*");
  if (error) throw error;
  return data;
};

// 項目を追加
export const addItem = async (item, unit1, unit2) => {
  const { data, error } = await supabase
    .from("items")
    .insert([{ item, unit1, unit2 }]);
  if (error) throw error;
  return data;
};

// 在庫履歴を取得
export const fetchStockHistory = async (itemId) => {
  // unit1の在庫履歴を取得
  const { data: unit1Data, error: unit1Error } = await supabase
    .from("stock_history")
    .select("*")
    .eq("item_id", itemId)
    .eq("unit", "unit1")
    .order("date", { ascending: false })
    .limit(3); // 最新の3件のみ取得

  if (unit1Error) throw unit1Error;

  // unit2の在庫履歴を取得
  const { data: unit2Data, error: unit2Error } = await supabase
    .from("stock_history")
    .select("*")
    .eq("item_id", itemId)
    .eq("unit", "unit2")
    .order("date", { ascending: false })
    .limit(3); // 最新の3件のみ取得

  if (unit2Error) throw unit2Error;

  return {
    unit1_history: unit1Data.map((sh) => ({ stock: sh.stock, date: sh.date })),
    unit2_history: unit2Data.map((sh) => ({ stock: sh.stock, date: sh.date })),
  };
};

// 在庫数を追加
export const addStock = async (itemId, stock, unit) => {
  const { data, error } = await supabase
    .from("stock_history")
    .insert([{ item_id: itemId, stock, unit }]);
  if (error) throw error;
  return data;
};
