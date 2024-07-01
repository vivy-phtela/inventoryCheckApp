import { supabase } from "./spabase";

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
  const { data, error } = await supabase
    .from("stock_history")
    .select("*")
    .eq("item_id", itemId) // item_idカラムがitemIdと等しいレコードをフィルタリング
    .order("date", { ascending: false }); // dateカラムで降順にレコードを並べ替え
  if (error) throw error;
  return data;
};

// 在庫数を追加
export const addStock = async (itemId, stock, unit) => {
  const { data, error } = await supabase
    .from("stock_history")
    .insert([{ item_id: itemId, stock, unit }]);
  if (error) throw error;
  return data;
};
