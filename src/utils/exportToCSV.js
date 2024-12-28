// csv形式で在庫データをエクスポートする
import { saveAs } from "file-saver";

export const exportToCSV = (inventorys, items) => {
  let csvContent = "項目名,在庫数,単位\n";

  for (const itemId in inventorys) {
    const item = items.find((item) => item.id.toString() === itemId);
    if (!item) continue;

    for (const unit in inventorys[itemId]) {
      const unitName = unit === "unit1" ? item.unit1 : item.unit2;
      csvContent += `${item.item},${inventorys[item.id][unit]},${unitName}\n`;
    }
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "inventorys.csv");
};
