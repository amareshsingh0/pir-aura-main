// Excel export utility using CSV format (works in Excel)
import { format } from "date-fns";

interface HistoryEntry {
  type: "motion" | "clear";
  time: string;
}

interface MotionData {
  todayCount: number;
  monthCount: number;
  avgDaily: number;
  uptime: string;
  historyData: HistoryEntry[];
}

export const exportToExcel = (data: MotionData, fileName?: string) => {
  // Create CSV content (Excel can open CSV files)
  const headers = [
    "Date",
    "Time",
    "Type",
    "Motion Count",
    "Month Count",
    "Average Daily",
    "Uptime"
  ];

  const rows = data.historyData.map((entry) => {
    const date = new Date(entry.time);
    return [
      format(date, "yyyy-MM-dd"),
      format(date, "HH:mm:ss"),
      entry.type === "motion" ? "Motion Detected" : "Motion Cleared",
      data.todayCount.toString(),
      data.monthCount.toString(),
      data.avgDaily.toFixed(2),
      data.uptime
    ];
  });

  // Add summary row
  rows.unshift([
    "SUMMARY",
    "",
    "",
    data.todayCount.toString(),
    data.monthCount.toString(),
    data.avgDaily.toFixed(2),
    data.uptime
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  // Add BOM for Excel UTF-8 support
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName || `motion-data-${format(new Date(), "yyyy-MM-dd")}`}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};







