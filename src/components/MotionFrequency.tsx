// import { useMemo } from "react";
// import { BarChart3, Clock } from "lucide-react";
// import { format, parseISO } from "date-fns";

// interface HistoryEntry {
//   type: "motion" | "clear";
//   time: string;
// }

// interface MotionFrequencyProps {
//   historyData: HistoryEntry[];
//   language: "en" | "hi";
// }

// const MotionFrequency = ({ historyData, language }: MotionFrequencyProps) => {
//   const frequencyData = useMemo(() => {
//     const hourlyCounts: { [key: number]: number } = {};
    
//     // Initialize all hours to 0
//     for (let i = 0; i < 24; i++) {
//       hourlyCounts[i] = 0;
//     }
    
//     if (!historyData || historyData.length === 0) {
//       return Object.entries(hourlyCounts)
//         .map(([hour]) => {
//           const date = new Date();
//           date.setHours(parseInt(hour), 0, 0, 0);
//           return {
//             hour: parseInt(hour),
//             count: 0,
//             label: format(date, "h a")
//           };
//         })
//         .sort((a, b) => a.hour - b.hour);
//     }
    
//     historyData.forEach((entry) => {
//       if (entry && entry.type === "motion" && entry.time) {
//         try {
//           const hour = new Date(entry.time).getHours();
//           if (!isNaN(hour)) {
//             hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
//           }
//         } catch (e) {
//           console.warn("Invalid date in historyData:", entry.time);
//         }
//       }
//     });
    
//     return Object.entries(hourlyCounts)
//       .map(([hour, count]) => {
//         const date = new Date();
//         date.setHours(parseInt(hour), 0, 0, 0);
//         return {
//           hour: parseInt(hour),
//           count,
//           label: format(date, "h a")
//         };
//       })
//       .sort((a, b) => a.hour - b.hour);
//   }, [historyData]);

//   const maxCount = Math.max(...frequencyData.map(d => d.count), 1);

//   return (
//     <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
//       <div className="flex items-center gap-2 mb-4">
//         <BarChart3 className="w-5 h-5 text-primary" />
//         <h3 className="text-lg font-display font-bold">
//           {language === "hi" ? "घंटे के अनुसार आवृत्ति" : "Frequency by Hour"}
//         </h3>
//       </div>

//       <div className="space-y-2">
//         {frequencyData.map(({ hour, count, label }) => {
//           const percentage = (count / maxCount) * 100;
          
//           return (
//             <div key={hour} className="flex items-center gap-2">
//               <div className="w-12 xs:w-16 text-xs text-muted-foreground flex-shrink-0">
//                 {label}
//               </div>
//               <div className="flex-1 relative">
//                 <div className="h-6 bg-muted/20 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
//                     style={{ width: `${percentage}%` }}
//                   >
//                     {count > 0 && (
//                       <span className="text-[10px] xs:text-xs font-bold text-primary-foreground">
//                         {count}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="mt-4 pt-4 border-t border-border">
//         <div className="flex items-center justify-between text-sm">
//           <div className="flex items-center gap-2">
//             <Clock className="w-4 h-4 text-muted-foreground" />
//             <span className="text-muted-foreground">
//               {language === "hi" ? "सबसे अधिक सक्रिय" : "Most Active"}
//             </span>
//           </div>
//           <span className="font-bold">
//             {frequencyData.reduce((max, d) => d.count > max.count ? d : max, frequencyData[0])?.label}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MotionFrequency;

import { useMemo } from "react";
import { Activity, BarChart3, TrendingUp } from "lucide-react";

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
    const hours = Array(24).fill(0);
    const days = Array(7).fill(0);
    
    if (!historyData || historyData.length === 0) {
      return { hours, days };
    }
    
    historyData.forEach((entry) => {
      if (entry && entry.type === "motion" && entry.time) {
        try {
          const date = new Date(entry.time);
          const hour = date.getHours();
          const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          
          if (hour >= 0 && hour < 24) {
            hours[hour]++;
          }
          if (day >= 0 && day < 7) {
            days[day]++;
          }
        } catch (e) {
          console.warn("Invalid date in historyData:", entry.time);
        }
      }
    });
    
    return { hours, days };
  }, [historyData]);

  const getDayName = (dayIndex: number) => {
    const days = language === "hi" 
      ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayIndex];
  };

  const maxHourCount = Math.max(...frequencyData.hours, 1);
  const maxDayCount = Math.max(...frequencyData.days, 1);

  return (
    <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold">
          {language === "hi" ? "मोशन आवृत्ति" : "Motion Frequency"}
        </h3>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">
            {language === "hi" ? "घंटेवार वितरण" : "Hourly Distribution"}
          </h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BarChart3 className="w-3 h-3" />
            <span>{frequencyData.hours.reduce((a, b) => a + b, 0)} {language === "hi" ? "मोशन" : "motions"}</span>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-1">
          {frequencyData.hours.map((count, hour) => (
            <div key={hour} className="flex flex-col items-center">
              <div 
                className="w-full bg-primary/30 rounded-t-sm transition-all hover:bg-primary/50 cursor-pointer"
                style={{ 
                  height: `${Math.max(10, (count / maxHourCount) * 40)}px`,
                  backgroundColor: count > 0 
                    ? `rgba(0, 212, 255, ${0.3 + (count / maxHourCount) * 0.7})`
                    : "hsl(var(--muted)/0.3)"
                }}
                title={`${hour}:00 - ${count} ${language === "hi" ? "मोशन" : "motions"}`}
              />
              <span className="text-[8px] text-muted-foreground mt-1">
                {hour % 6 === 0 ? hour : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">
            {language === "hi" ? "साप्ताहिक वितरण" : "Weekly Distribution"}
          </h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>{frequencyData.days.reduce((a, b) => a + b, 0)} {language === "hi" ? "मोशन" : "motions"}</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {frequencyData.days.map((count, dayIndex) => (
            <div key={dayIndex} className="flex flex-col items-center">
              <div 
                className="w-full bg-secondary/30 rounded-lg transition-all hover:bg-secondary/50 cursor-pointer flex items-end justify-center"
                style={{ 
                  height: `${Math.max(10, (count / maxDayCount) * 60)}px`,
                  backgroundColor: count > 0 
                    ? `rgba(138, 43, 226, ${0.3 + (count / maxDayCount) * 0.7})`
                    : "hsl(var(--muted)/0.3)"
                }}
                title={`${getDayName(dayIndex)} - ${count} ${language === "hi" ? "मोशन" : "motions"}`}
              >
                {count > 0 && (
                  <span className="text-[8px] text-white font-bold mb-1">{count}</span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-2">
                {getDayName(dayIndex).slice(0, 1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MotionFrequency;