// 在庫履歴を表示するコンポーネント
const StockHistory = ({ item, stockHistory }) => {
  return (
    <ul className="list-group mt-2">
      <li className="list-group-item">
        <div className="d-flex flex-wrap">
          {Object.keys(stockHistory).map((date, index) => (
            <div key={index} className="me-3">
              <span>{date}</span>
              <div>
                <span style={{ color: "red" }}>
                  {stockHistory[date].unit1_history}
                </span>
                ({item.unit1})
              </div>
              {item.unit2 && (
                <div>
                  <span style={{ color: "blue" }}>
                    {stockHistory[date].unit2_history}
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

export default StockHistory;
