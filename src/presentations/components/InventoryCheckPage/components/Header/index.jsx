import PropTypes from "prop-types";
import { LogoutButton } from "./components";

export const Header = ({ dailyCheckStatus }) => (
  <div className="d-flex align-items-center justify-content-between">
    {/* 左側：h1とspan */}
    <div className="d-flex align-items-center">
      <h1 className="fw-bold mb-0">Daily棚卸</h1>
      <span className="fw-bold ms-3">{dailyCheckStatus}</span>
    </div>
    {/* 右側：LogoutButton */}
    <div>
      <LogoutButton />
    </div>
  </div>
);

Header.propTypes = {
  dailyCheckStatus: PropTypes.string.isRequired,
};
