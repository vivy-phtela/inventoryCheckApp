import LoginPage from "./components/LoginPage";
import InventoryPage from "./components/InventoryPage";
import { useAuthSession } from "./hooks";

function App() {
  const session = useAuthSession();

  // セッションがない場合、ログインページを表示
  if (!session) {
    return <LoginPage />;
  }

  // それ以外の場合は在庫管理ページを表示
  return <InventoryPage />;
}

export default App;
