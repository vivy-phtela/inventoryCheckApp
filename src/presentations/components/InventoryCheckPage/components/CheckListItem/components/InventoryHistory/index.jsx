import PropTypes from "prop-types";

export const InventoryHistory = ({ item, inventoryHistory }) => {
  return (
    <ul className="list-group mt-2">
      <li className="list-group-item">
        <div className="d-flex flex-wrap">
          {Object.keys(inventoryHistory).map((date, index) => (
            <div key={index} className="me-3">
              <span>{date}</span>
              <div>
                <span style={{ color: "red" }}>
                  {inventoryHistory[date].unit1_history}
                </span>
                ({item.unit1})
              </div>
              {item.unit2 && (
                <div>
                  <span style={{ color: "blue" }}>
                    {inventoryHistory[date].unit2_history}
                  </span>
                  ({item.unit2})
                </div>
              )}
            </div>
          ))}
        </div>
      </li>
    </ul>
  );
};

InventoryHistory.propTypes = {
  item: PropTypes.shape({
    unit1: PropTypes.string.isRequired,
    unit2: PropTypes.string,
  }).isRequired,
  inventoryHistory: PropTypes.objectOf(
    PropTypes.shape({
      unit1_history: PropTypes.number.isRequired,
      unit2_history: PropTypes.number,
    })
  ).isRequired,
};
