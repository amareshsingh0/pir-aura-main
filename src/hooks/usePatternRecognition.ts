import { useMemo } from "react";
import { format, parseISO, isSameDay, isSameHour } from "date-fns";

interface HistoryEntry {
  type: "motion" | "clear";
  time: string;
}

interface Pattern {
  type: "daily" | "hourly" | "weekly";
  time: string;
  confidence: number;
  description: string;
}

export const usePatternRecognition = (historyData: HistoryEntry[]) => {
  const patterns = useMemo(() => {
    const patterns: Pattern[] = [];
    const motionTimes = historyData
      .filter((e) => e.type === "motion")
      .map((e) => parseISO(e.time));

    if (motionTimes.length < 5) return patterns;

    // Hourly pattern detection
    const hourCounts: { [hour: number]: number } = {};
    motionTimes.forEach((time) => {
      const hour = time.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostCommonHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (mostCommonHour && mostCommonHour[1] >= 3) {
      patterns.push({
        type: "hourly",
        time: `${mostCommonHour[0]}:00`,
        confidence: Math.min((mostCommonHour[1] / motionTimes.length) * 100, 100),
        description: `Motion detected most often at ${mostCommonHour[0]}:00`,
      });
    }

    // Daily pattern detection
    const dayCounts: { [day: number]: number } = {};
    motionTimes.forEach((time) => {
      const day = time.getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const mostCommonDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    if (mostCommonDay && mostCommonDay[1] >= 2) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      patterns.push({
        type: "daily",
        time: dayNames[parseInt(mostCommonDay[0])],
        confidence: Math.min((mostCommonDay[1] / motionTimes.length) * 100, 100),
        description: `Most active on ${dayNames[parseInt(mostCommonDay[0])]}`,
      });
    }

    return patterns;
  }, [historyData]);

  const predictNextMotion = useMemo(() => {
    if (historyData.length < 3) return null;

    const recentMotions = historyData
      .filter((e) => e.type === "motion")
      .slice(-10)
      .map((e) => parseISO(e.time));

    if (recentMotions.length < 3) return null;

    const intervals: number[] = [];
    for (let i = 1; i < recentMotions.length; i++) {
      intervals.push(recentMotions[i].getTime() - recentMotions[i - 1].getTime());
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const nextMotion = new Date(recentMotions[recentMotions.length - 1].getTime() + avgInterval);

    return {
      predictedTime: nextMotion,
      confidence: Math.min(70, (recentMotions.length / 10) * 100),
      message: `Next motion expected in ${Math.round(avgInterval / 60000)} minutes`,
    };
  }, [historyData]);

  return { patterns, predictNextMotion };
};











