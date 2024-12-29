import PropTypes from "prop-types";
import { LogoutButton } from "./components";
import { memo } from "react";

export const Header = memo(({ dailyCheckStatus }) => (
  <div className="d-flex align-items-center justify-content-between">
    <div className="d-flex align-items-center">
      <h1 className="fw-bold mb-0">Daily棚卸</h1>
      <span className="fw-bold ms-3">{dailyCheckStatus}</span>
    </div>
    <div>
      <LogoutButton />
    </div>
  </div>
));

Header.displayName = "Header";

Header.propTypes = {
  dailyCheckStatus: PropTypes.string.isRequired,
};
