import { useMemo } from "react";
import { BarChart3, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

interface HistoryEntry {
  type: "motion" | "clear";
  time: string;
}

interface MotionFrequencyProps {
  historyData: HistoryEntry[];
  language: "en" | "hi";
}

const MotionFrequency = ({ historyData, language }: MotionFrequencyProps) => {
  const frequencyData = useMemo(() => {
    const hourlyCounts: { [key: number]: number } = {};
    
    // Initialize all hours to 0
    for (let i = 0; i < 24; i++) {
      hourlyCounts[i] = 0;
    }
    
    if (!historyData || historyData.length === 0) {
      return Object.entries(hourlyCounts)
        .map(([hour]) => {
          const date = new Date();
          date.setHours(parseInt(hour), 0, 0, 0);
          return {
            hour: parseInt(hour),
            count: 0,
            label: format(date, "h a")
          };
        })
        .sort((a, b) => a.hour - b.hour);
    }
    
    historyData.forEach((entry) => {
      if (entry && entry.type === "motion" && entry.time) {
        try {
          const hour = new Date(entry.time).getHours();
          if (!isNaN(hour)) {
            hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
          }
        } catch (e) {
          console.warn("Invalid date in historyData:", entry.time);
        }
      }
    });
    
    return Object.entries(hourlyCounts)
      .map(([hour, count]) => {
        const date = new Date();
        date.setHours(parseInt(hour), 0, 0, 0);
        return {
          hour: parseInt(hour),
          count,
          label: format(date, "h a")
        };
      })
      .sort((a, b) => a.hour - b.hour);
  }, [historyData]);

  const maxCount = Math.max(...frequencyData.map(d => d.count), 1);

  return (
    <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold">
          {language === "hi" ? "घंटे के अनुसार आवृत्ति" : "Frequency by Hour"}
        </h3>
      </div>

      <div className="space-y-2">
        {frequencyData.map(({ hour, count, label }) => {
          const percentage = (count / maxCount) * 100;
          
          return (
            <div key={hour} className="flex items-center gap-2">
              <div className="w-12 xs:w-16 text-xs text-muted-foreground flex-shrink-0">
                {label}
              </div>
              <div className="flex-1 relative">
                <div className="h-6 bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${percentage}%` }}
                  >
                    {count > 0 && (
                      <span className="text-[10px] xs:text-xs font-bold text-primary-foreground">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {language === "hi" ? "सबसे अधिक सक्रिय" : "Most Active"}
            </span>
          </div>
          <span className="font-bold">
            {frequencyData.reduce((max, d) => d.count > max.count ? d : max, frequencyData[0])?.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MotionFrequency;

