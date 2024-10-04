import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginPage from "./components/LoginPage";
import InventoryPage from "./components/InventoryPage";

function App() {
  const [session, setSession] = useState(null); // セッション

  useEffect(() => {
    // 初回に現在のセッションをチェック
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();

    // セッションが更新された時のリスナーを設定
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // クリーンアップ
    return () => {
      // リスナーを解除
      subscription?.unsubscribe();
    };
  }, []);

  // ログインしていない場合はログインページを表示
  if (!session) {
    return <LoginPage />;
  }

  // ログインしている場合は在庫管理ページを表示
  return <InventoryPage />;
}

export default App;
