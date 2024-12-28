// ログインページのコンポーネント
import { useState } from "react";
import { supabase } from "../../../utils/supabase";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // ページ遷移をキャンセル

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("ログインに失敗しました");
    } else {
      setError("");
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 position-relative">
      <h1 className="mb-5 text-center display-4 fw-bold">Daily棚卸システム</h1>
      <div className="card p-3" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">ログイン</h3>
        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label>Email:</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Password:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            ログイン
          </button>
          {error && <p className="text-danger mt-3 text-center">{error}</p>}
        </form>
      </div>
      <footer
        className="position-absolute bottom-0 text-center w-100 py-2"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <p className="mb-0 fs-6 fw-light">&copy; 2024 Tsubasa Watanabe</p>
      </footer>
    </div>
  );
};
