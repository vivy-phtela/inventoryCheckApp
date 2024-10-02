// ヘッダーコンポーネント
const Header = ({ dailyCheckStatus }) => (
  <div className="d-flex align-items-center mb-4">
    <h1 className="fw-bold">Daily棚卸</h1>
    <span className="fw-bold ms-3">{dailyCheckStatus}</span>
  </div>
);

export default Header;
