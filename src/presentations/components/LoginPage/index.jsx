import { LoginForm, Footer } from "./components";

export const LoginPage = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 position-relative">
      <h1 className="mb-5 text-center display-4 fw-bold">Daily棚卸システム</h1>
      <LoginForm />
      <Footer />
    </div>
  );
};
