import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase.js";

export const useAuthSession = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 初回に現在のセッションを取得
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();

    // セッションが更新されたときに反映
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // クリーンアップ処理
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return session;
};
