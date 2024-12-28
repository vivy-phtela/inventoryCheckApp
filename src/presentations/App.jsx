import { LoginPage, InventoryCheckPage } from "./components";
import { useAuthSession } from "./hooks";

export const App = () => {
  const session = useAuthSession();

  // セッションがない場合、ログインページを表示
  if (!session) {
    return <LoginPage />;
  }

  // それ以外の場合は在庫管理ページを表示
  return <InventoryCheckPage />;
};
