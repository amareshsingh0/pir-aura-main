import { useMemo } from "react";
import { Clock, Activity } from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";

interface HistoryEntry {
  type: "motion" | "clear";
  time: string;
}

interface MotionTimelineProps {
  historyData: HistoryEntry[];
  language: "en" | "hi";
}

const MotionTimeline = ({ historyData, language }: MotionTimelineProps) => {
  const groupedData = useMemo(() => {
    const groups: { [key: string]: HistoryEntry[] } = {};
    
    if (!historyData || historyData.length === 0) {
      return [];
    }
    
    historyData.forEach((entry) => {
      if (entry && entry.time) {
        try {
          const date = new Date(entry.time).toISOString().split("T")[0];
          if (date && !isNaN(new Date(entry.time).getTime())) {
            if (!groups[date]) {
              groups[date] = [];
            }
            groups[date].push(entry);
          }
        } catch (e) {
          console.warn("Invalid date in historyData:", entry.time);
        }
      }
    });
    
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7); // Last 7 days
  }, [historyData]);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return language === "hi" ? "आज" : "Today";
    }
    if (isYesterday(date)) {
      return language === "hi" ? "कल" : "Yesterday";
    }
    return format(date, language === "hi" ? "dd MMM" : "MMM dd");
  };

  return (
    <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold">
          {language === "hi" ? "मोशन टाइमलाइन" : "Motion Timeline"}
        </h3>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {groupedData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {language === "hi" ? "कोई डेटा नहीं" : "No data available"}
          </p>
        ) : (
          groupedData.map(([date, entries]) => (
            <div key={date} className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">{getDateLabel(date)}</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {entries.filter(e => e.type === "motion").length} {language === "hi" ? "मोशन" : "motions"}
                </span>
              </div>
              
              <div className="ml-4 space-y-1">
                {entries
                  .filter(e => e.type === "motion")
                  .slice(0, 10)
                  .map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-muted-foreground py-1"
                    >
                      <Activity className="w-3 h-3 text-primary" />
                      <span>{format(parseISO(entry.time), language === "hi" ? "h:mm a" : "h:mm a")}</span>
                    </div>
                  ))}
                {entries.filter(e => e.type === "motion").length > 10 && (
                  <p className="text-xs text-muted-foreground italic">
                    +{entries.filter(e => e.type === "motion").length - 10} {language === "hi" ? "और" : "more"}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MotionTimeline;

