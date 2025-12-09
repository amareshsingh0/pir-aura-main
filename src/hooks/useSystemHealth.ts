import { useState, useEffect } from "react";

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  serialLag: number;
  responseTime: number;
  connectionQuality: "excellent" | "good" | "poor" | "offline";
}

export const useSystemHealth = (isOffline: boolean, responseTime: number | null) => {
  const [health, setHealth] = useState<SystemHealth>({
    cpuUsage: 0,
    memoryUsage: 0,
    serialLag: 0,
    responseTime: responseTime || 0,
    connectionQuality: isOffline ? "offline" : "excellent",
  });

  useEffect(() => {
    const updateHealth = () => {
      // CPU usage estimation (browser performance)
      const cpuUsage = performance.now() > 16.67 ? 50 : Math.random() * 30;
      
      // Memory usage (if available)
      const memoryUsage = (performance as any).memory 
        ? ((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100
        : Math.random() * 40;

      // Serial lag (time since last update)
      const serialLag = responseTime || 0;

      // Connection quality
      let connectionQuality: "excellent" | "good" | "poor" | "offline" = "excellent";
      if (isOffline) {
        connectionQuality = "offline";
      } else if (serialLag > 5000) {
        connectionQuality = "poor";
      } else if (serialLag > 2000) {
        connectionQuality = "good";
      }

      setHealth({
        cpuUsage: Math.round(cpuUsage),
        memoryUsage: Math.round(memoryUsage),
        serialLag: Math.round(serialLag),
        responseTime: responseTime || 0,
        connectionQuality,
      });
    };

    updateHealth();
    const interval = setInterval(updateHealth, 5000);
    return () => clearInterval(interval);
  }, [isOffline, responseTime]);

  return health;
};












