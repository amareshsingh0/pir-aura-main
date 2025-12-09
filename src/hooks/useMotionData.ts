import { useState, useEffect, useCallback, useRef } from "react";

interface HistoryEntry {
  type: "motion" | "clear";
  time: string;
}

interface MonthlyData {
  [key: string]: number;
}

interface MotionData {
  motionDetected: boolean;
  isOffline: boolean;
  lastDetection: string;
  streakCount: number;
  todayCount: number;
  monthCount: number;
  avgDaily: number;
  uptime: string;
  historyData: HistoryEntry[];
  monthlyData: MonthlyData;
  jsonData: string;
  lastUpdate: string;
}

const STORAGE_KEY = "pirMotionData";

export const useMotionData = () => {
  const [data, setData] = useState<MotionData>({
    motionDetected: false,
    isOffline: true,
    lastDetection: "Never",
    streakCount: 0,
    todayCount: 0,
    monthCount: 0,
    avgDaily: 0,
    uptime: "00:00:00",
    historyData: [],
    monthlyData: {},
    jsonData: "Connecting to sensor...",
    lastUpdate: "--",
  });

  const startTimeRef = useRef(Date.now());
  const lastMotionStateRef = useRef<boolean | null>(null);
  const lastDetectionTimeRef = useRef<Date | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev) => ({
          ...prev,
          historyData: parsed.historyData || [],
          monthlyData: parsed.monthlyData || {},
          todayCount: parsed.todayCount || 0,
          streakCount: parsed.streakCount || 0,
        }));
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((newData: Partial<MotionData>) => {
    setData((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          historyData: updated.historyData,
          monthlyData: updated.monthlyData,
          todayCount: updated.todayCount,
          streakCount: updated.streakCount,
        })
      );
      return updated;
    });
  }, []);

  // Update uptime
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const seconds = String(elapsed % 60).padStart(2, "0");
      setData((prev) => ({ ...prev, uptime: `${hours}:${minutes}:${seconds}` }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update last detection time display
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastDetectionTimeRef.current) {
        const ago = Math.floor((Date.now() - lastDetectionTimeRef.current.getTime()) / 1000);
        const mins = Math.floor(ago / 60);
        const display = mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
        setData((prev) => ({ ...prev, lastDetection: display }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch motion data
  const fetchMotionData = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/status", { cache: "no-store" });
      const jsonData = await res.json();

      const motion = jsonData.motion === true || jsonData.motion === 1;
      const now = new Date();

      setData((prev) => {
        const newData = { ...prev };
        newData.jsonData = JSON.stringify(jsonData, null, 2);
        newData.lastUpdate = now.toLocaleTimeString();
        newData.isOffline = false;
        newData.motionDetected = motion;

        if (motion !== lastMotionStateRef.current) {
          if (motion) {
            newData.streakCount = prev.streakCount + 1;
            newData.todayCount = prev.todayCount + 1;
            lastDetectionTimeRef.current = now;
            newData.lastDetection = "Just now";

            const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
            newData.monthlyData = {
              ...prev.monthlyData,
              [monthKey]: (prev.monthlyData[monthKey] || 0) + 1,
            };

            newData.historyData = [
              ...prev.historyData,
              { type: "motion", time: now.toLocaleString() },
            ];

            // Calculate month count
            newData.monthCount = newData.monthlyData[monthKey] || 0;
          } else if (lastMotionStateRef.current === true) {
            newData.historyData = [
              ...prev.historyData,
              { type: "clear", time: now.toLocaleString() },
            ];
          }
          lastMotionStateRef.current = motion;
        }

        // Calculate average daily
        const days = Object.keys(newData.monthlyData).length || 1;
        const total = Object.values(newData.monthlyData).reduce((a, b) => a + b, 0);
        newData.avgDaily = Math.round(total / days);

        return newData;
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        isOffline: true,
        jsonData: "Connection Lost\nCheck your sensor server",
      }));
    }
  }, []);

  // Poll for data
  useEffect(() => {
    fetchMotionData();
    const interval = setInterval(fetchMotionData, 1000);
    return () => clearInterval(interval);
  }, [fetchMotionData]);

  const clearHistory = useCallback(() => {
    if (window.confirm("Clear all history data?")) {
      saveToStorage({
        historyData: [],
        todayCount: 0,
        monthlyData: {},
        monthCount: 0,
        avgDaily: 0,
        streakCount: 0,
      });
    }
  }, [saveToStorage]);

  const exportCSV = useCallback(() => {
    let csv = "Type,Timestamp\n";
    data.historyData.forEach((e) => {
      csv += `${e.type},${e.time}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `motion-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data.historyData]);

  return { data, clearHistory, exportCSV };
};
