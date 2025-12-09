import jsPDF from "jspdf";

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  let csv = headers.join(",") + "\n";

  data.forEach((row) => {
    csv += headers.map((h) => JSON.stringify(row[h] || "")).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = (title: string, content: string, filename: string) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 14, 40);
  doc.save(`${filename}.pdf`);
};

// Re-export Excel export function
export { exportToExcel } from "./excelExport";






