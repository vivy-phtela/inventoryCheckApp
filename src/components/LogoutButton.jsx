import { supabase } from "../../utils/supabase";

const LogoutButton = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("ログアウトに失敗しました: " + error.message);
    } else {
      window.location.reload(); // ログアウト後にページをリロード
    }
  };

  return (
    <div>
      <button onClick={handleLogout} className="btn btn-outline-secondary">
        ログアウト
      </button>
    </div>
  );
};

export default LogoutButton;
