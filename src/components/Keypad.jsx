// キーパッドコンポーネント
import PropTypes from "prop-types";

const Keypad = ({ handleKeypadPress, handleDelete }) => {
  const keys = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ["Del", 0],
  ];

  return (
    <div
      className="shadow p-3"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
      }}
    >
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="d-flex justify-content-center">
          {row.map((key) => (
            <button
              key={key}
              className="btn btn-outline-dark m-1"
              style={{ width: "85px", height: "85px", fontSize: "20px" }}
              onClick={() => {
                if (key === "Del") handleDelete();
                else handleKeypadPress(key);
              }}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

Keypad.propTypes = {
  handleKeypadPress: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default Keypad;
