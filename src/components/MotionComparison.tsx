import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

interface HistoryEntry {
  type: "motion" | "clear";
  time: string;
}

interface MotionComparisonProps {
  historyData: HistoryEntry[];
  language: "en" | "hi";
}

const MotionComparison = ({ historyData, language }: MotionComparisonProps) => {
  const [period, setPeriod] = useState<"7" | "30" | "90">("7");

  const comparisonData = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return { current: 0, previous: 0, change: 0, changePercent: "0" };
    }
    
    const now = new Date();
    const currentPeriodStart = subDays(now, parseInt(period));
    const previousPeriodStart = subDays(currentPeriodStart, parseInt(period));

    const currentPeriod = historyData.filter(
      (entry) => entry && entry.time && entry.type === "motion" && parseISO(entry.time) >= currentPeriodStart
    ).length;

    const previousPeriod = historyData.filter(
      (entry) => {
        if (!entry || !entry.time || entry.type !== "motion") return false;
        try {
          const entryDate = parseISO(entry.time);
          return entryDate >= previousPeriodStart && entryDate < currentPeriodStart;
        } catch (e) {
          return false;
        }
      }
    ).length;

    const change = currentPeriod - previousPeriod;
    const changePercent = previousPeriod > 0 ? ((change / previousPeriod) * 100).toFixed(1) : "0";

    return {
      current: currentPeriod,
      previous: previousPeriod,
      change,
      changePercent
    };
  }, [historyData, period]);

  const getTrendIcon = () => {
    if (comparisonData.change > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (comparisonData.change < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display font-bold">
            {language === "hi" ? "तुलना" : "Comparison"}
          </h3>
        </div>
        <div className="flex gap-1">
          {(["7", "30", "90"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 xs:px-3 py-1 text-xs rounded ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p}D
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-background/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">
            {language === "hi" ? "वर्तमान अवधि" : "Current Period"}
          </p>
          <p className="text-2xl font-display font-bold">{comparisonData.current}</p>
        </div>
        <div className="text-center p-3 bg-background/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">
            {language === "hi" ? "पिछली अवधि" : "Previous Period"}
          </p>
          <p className="text-2xl font-display font-bold">{comparisonData.previous}</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className="text-sm font-medium">
            {language === "hi" ? "परिवर्तन" : "Change"}
          </span>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${
            comparisonData.change > 0 ? "text-success" : 
            comparisonData.change < 0 ? "text-destructive" : 
            "text-muted-foreground"
          }`}>
            {comparisonData.change > 0 ? "+" : ""}{comparisonData.change}
          </p>
          <p className="text-xs text-muted-foreground">
            ({comparisonData.changePercent}%)
          </p>
        </div>
      </div>
    </div>
  );
};

export default MotionComparison;

