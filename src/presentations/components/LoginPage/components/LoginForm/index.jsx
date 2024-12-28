import { useLogin } from "./hooks";

export const LoginForm = () => {
  const { email, setEmail, password, setPassword, error, handleLogin } =
    useLogin();

  return (
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
  );
};
