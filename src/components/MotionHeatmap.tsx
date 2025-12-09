import { useMemo } from "react";
import { Calendar, TrendingUp } from "lucide-react";

interface HistoryEntry {
  type: "motion" | "clear";
  time: string;
}

interface MotionHeatmapProps {
  historyData: HistoryEntry[];
  language: "en" | "hi";
}

const MotionHeatmap = ({ historyData, language }: MotionHeatmapProps) => {
  const heatmapData = useMemo(() => {
    const data: { [key: string]: number } = {};
    
    if (!historyData || historyData.length === 0) {
      return data;
    }
    
    historyData.forEach((entry) => {
      if (entry && entry.type === "motion" && entry.time) {
        try {
          const date = new Date(entry.time).toISOString().split("T")[0];
          if (date && !isNaN(new Date(entry.time).getTime())) {
            data[date] = (data[date] || 0) + 1;
          }
        } catch (e) {
          console.warn("Invalid date in historyData:", entry.time);
        }
      }
    });
    
    return data;
  }, [historyData]);

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-muted/20";
    if (count < 5) return "bg-primary/30";
    if (count < 10) return "bg-primary/50";
    if (count < 20) return "bg-primary/70";
    return "bg-primary";
  };

  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const days = getLast30Days();
  const maxCount = Math.max(...Object.values(heatmapData), 1);

  return (
    <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold">
          {language === "hi" ? "मोशन हीटमैप (30 दिन)" : "Motion Heatmap (30 Days)"}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 xs:gap-1.5 sm:gap-2 mb-4">
        {days.map((day, index) => {
          const count = heatmapData[day] || 0;
          const date = new Date(day);
          const dayName = date.toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", { weekday: "short" });
          
          return (
            <div
              key={day}
              className={`${getIntensity(count)} rounded p-1 xs:p-1.5 sm:p-2 aspect-square flex flex-col items-center justify-center text-xs transition-all hover:scale-110 cursor-pointer group relative`}
              title={`${day}: ${count} ${language === "hi" ? "मोशन" : "motions"}`}
            >
              <span className="text-[8px] xs:text-[10px] opacity-60 mb-0.5">{dayName.slice(0, 1)}</span>
              <span className="text-[10px] xs:text-xs font-bold">{date.getDate()}</span>
              {count > 0 && (
                <span className="text-[8px] xs:text-[10px] mt-0.5 font-bold">{count}</span>
              )}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 rounded transition-all" />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{language === "hi" ? "कम" : "Less"}</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-muted/20 rounded" />
            <div className="w-3 h-3 bg-primary/30 rounded" />
            <div className="w-3 h-3 bg-primary/50 rounded" />
            <div className="w-3 h-3 bg-primary/70 rounded" />
            <div className="w-3 h-3 bg-primary rounded" />
          </div>
          <span>{language === "hi" ? "अधिक" : "More"}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{language === "hi" ? `कुल: ${Object.values(heatmapData).reduce((a, b) => a + b, 0)}` : `Total: ${Object.values(heatmapData).reduce((a, b) => a + b, 0)}`}</span>
        </div>
      </div>
    </div>
  );
};

export default MotionHeatmap;

