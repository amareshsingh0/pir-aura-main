import { useState, useEffect, useRef } from "react";

interface UptimeLog {
  type: "uptime" | "downtime";
  startTime: string;
  endTime: string | null;
  duration: string;
}

export const useUptimeLogs = (isOffline: boolean) => {
  const [logs, setLogs] = useState<UptimeLog[]>([]);
  const currentLogRef = useRef<UptimeLog | null>(null);
  const lastStateRef = useRef<boolean>(!isOffline);

  useEffect(() => {
    const now = new Date().toISOString();

    if (isOffline && !lastStateRef.current) {
      // Went offline - end uptime log
      if (currentLogRef.current && currentLogRef.current.type === "uptime") {
        const duration = Math.floor((Date.now() - new Date(currentLogRef.current.startTime).getTime()) / 1000);
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        
        setLogs((prev) => [
          ...prev,
          {
            ...currentLogRef.current!,
            endTime: now,
            duration: `${hours}h ${minutes}m ${seconds}s`,
          },
        ]);
      }

      // Start downtime log
      currentLogRef.current = {
        type: "downtime",
        startTime: now,
        endTime: null,
        duration: "0s",
      };
    } else if (!isOffline && lastStateRef.current !== !isOffline) {
      // Came online - end downtime log
      if (currentLogRef.current && currentLogRef.current.type === "downtime") {
        const duration = Math.floor((Date.now() - new Date(currentLogRef.current.startTime).getTime()) / 1000);
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        
        setLogs((prev) => [
          ...prev,
          {
            ...currentLogRef.current!,
            endTime: now,
            duration: `${hours}h ${minutes}m ${seconds}s`,
          },
        ]);
      }

      // Start uptime log
      currentLogRef.current = {
        type: "uptime",
        startTime: now,
        endTime: null,
        duration: "0s",
      };
    }

    lastStateRef.current = !isOffline;
  }, [isOffline]);

  // Update current log duration
  useEffect(() => {
    if (!currentLogRef.current) return;

    const interval = setInterval(() => {
      if (currentLogRef.current) {
        const duration = Math.floor((Date.now() - new Date(currentLogRef.current.startTime).getTime()) / 1000);
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        
        currentLogRef.current.duration = `${hours}h ${minutes}m ${seconds}s`;
        setLogs((prev) => [...prev]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return logs;
};












