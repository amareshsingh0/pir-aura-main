import { useState, useEffect, useRef } from "react";
import { Eye, Volume2, VolumeX, Download, Trash2, Activity, CalendarDays, TrendingUp, Clock, Radio, History, Brain } from "lucide-react";
import ParticleBackground from "./ParticleBackground";
import StatusCard from "./StatusCard";
import StatBox from "./StatBox";
import ControlButton from "./ControlButton";
import TabButton from "./TabButton";
import ThemeSwitcher from "./ThemeSwitcher";
import { useMotionData } from "@/hooks/useMotionData";
import { toast } from "sonner";

type TabType = "live" | "history" | "analytics";

const MotionDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("live");
  const { data, clearHistory, exportCSV } = useMotionData();
  const prevMotionRef = useRef(data.motionDetected);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-tone-1057.mp3");
    audioRef.current.volume = 0.3;
  }, []);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Motion detection effects
  useEffect(() => {
    if (data.motionDetected && !prevMotionRef.current && !data.isOffline) {
      // Play sound
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // Show toast
      toast.error("MOTION DETECTED!", {
        description: "PIR sensor triggered right now!",
        duration: 3000,
      });

      // Browser notification
      if (Notification.permission === "granted") {
        new Notification("Motion Detected!", {
          body: `PIR sensor triggered at ${new Date().toLocaleTimeString()}`,
          icon: "https://img.icons8.com/fluency/48/000000/motion-sensor.png",
        });
      }
    }
    prevMotionRef.current = data.motionDetected;
  }, [data.motionDetected, data.isOffline, soundEnabled]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const getMonthlyAnalytics = () => {
    const entries = Object.entries(data.monthlyData);
    if (entries.length === 0) {
      return <p className="text-muted-foreground">No analytics data yet.</p>;
    }

    return (
      <div className="space-y-2 xs:space-y-3 sm:space-y-4">
        {entries.map(([month, count]) => (
          <div key={month} className="flex flex-col xs:flex-row xs:items-center xs:justify-between p-2.5 xs:p-3 sm:p-4 glass rounded-lg sm:rounded-xl gap-2 xs:gap-3 sm:gap-4">
            <span className="text-foreground font-display text-xs xs:text-sm sm:text-base">{month}</span>
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 w-full xs:w-auto">
              <div className="flex-1 xs:flex-none xs:w-24 sm:w-32 md:w-48 h-1.5 xs:h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((count / 100) * 100, 100)}%` }}
                />
              </div>
              <span className="text-primary font-bold min-w-[35px] xs:min-w-[40px] sm:min-w-[60px] text-right text-xs xs:text-sm sm:text-base">{count}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative safe-area">
      <ParticleBackground />
      <ThemeSwitcher />

      <div className="relative z-10 max-w-6xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 pt-safe-top pb-safe-bottom py-3 xs:py-4 sm:py-5 md:py-6 lg:py-8">
        {/* Header */}
        <header className="text-center mb-4 xs:mb-5 sm:mb-6 md:mb-8 lg:mb-10">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold gradient-text flex flex-col xs:flex-row items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
            <Eye className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0" />
            <span className="leading-tight text-center">PIR Motion Live Dashboard</span>
          </h1>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base md:text-lg px-2">
            Real-time motion detection monitor • <span className="text-primary block xs:inline mt-1 xs:mt-0">{currentTime}</span>
          </p>
        </header>

        {/* Controls */}
        <div className="flex justify-center gap-2 xs:gap-2.5 sm:gap-3 flex-wrap mb-4 xs:mb-5 sm:mb-6 md:mb-8 px-2">
          <ControlButton
            icon={soundEnabled ? Volume2 : VolumeX}
            label={`Sound: ${soundEnabled ? "ON" : "OFF"}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            active={soundEnabled}
          />
          <ControlButton
            icon={Download}
            label="Export CSV"
            onClick={exportCSV}
          />
          <ControlButton
            icon={Trash2}
            label="Clear History"
            onClick={clearHistory}
          />
        </div>

        {/* Status Card */}
        <StatusCard
          motionDetected={data.motionDetected}
          isOffline={data.isOffline}
          lastDetection={data.lastDetection}
          streakCount={data.streakCount}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-5 mb-4 xs:mb-5 sm:mb-6 md:mb-8 lg:mb-10">
          <StatBox icon={Activity} title="Today's Detections" value={data.todayCount} />
          <StatBox icon={CalendarDays} title="This Month" value={data.monthCount} />
          <StatBox icon={TrendingUp} title="Average Daily" value={data.avgDaily} />
          <StatBox icon={Clock} title="System Uptime" value={data.uptime} />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1.5 xs:gap-2 sm:gap-3 flex-wrap mb-4 xs:mb-5 sm:mb-6 md:mb-8">
          <TabButton label="Live Feed" active={activeTab === "live"} onClick={() => setActiveTab("live")} />
          <TabButton label="History Log" active={activeTab === "history"} onClick={() => setActiveTab("history")} />
          <TabButton label="Analytics" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
        </div>

        {/* Tab Content */}
        <div className="glass rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 min-h-[200px] xs:min-h-[250px] sm:min-h-[300px] md:min-h-[350px] mb-4 xs:mb-6 sm:mb-8 md:mb-10 pb-safe-bottom">
          {activeTab === "live" && (
            <div>
              <div className="flex items-center gap-1.5 xs:gap-2 text-primary mb-2 xs:mb-3 sm:mb-4 font-display">
                <Radio className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm xs:text-base sm:text-lg">Real-Time JSON Stream</span>
              </div>
              <pre className="bg-background/50 rounded-lg sm:rounded-xl p-2 xs:p-3 sm:p-4 overflow-x-auto text-[10px] xs:text-xs sm:text-sm text-foreground font-mono leading-relaxed">
                {data.jsonData}
              </pre>
              <p className="text-muted-foreground text-[10px] xs:text-xs sm:text-sm mt-2 xs:mt-3 sm:mt-4">
                Last update: <span className="text-primary">{data.lastUpdate}</span>
              </p>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <div className="flex items-center gap-1.5 xs:gap-2 text-primary mb-2 xs:mb-3 sm:mb-4 font-display">
                <History className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm xs:text-base sm:text-lg">Event History</span>
              </div>
              <div className="max-h-[200px] xs:max-h-[250px] sm:max-h-[300px] md:max-h-[400px] overflow-y-auto space-y-1.5 xs:space-y-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                {data.historyData.length === 0 ? (
                  <p className="text-muted-foreground text-xs xs:text-sm">No events recorded yet.</p>
                ) : (
                  [...data.historyData].reverse().map((entry, i) => (
                    <div
                      key={i}
                      className={`p-2 xs:p-2.5 sm:p-3 rounded-lg flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-2 ${
                        entry.type === "motion"
                          ? "bg-destructive/20 border-l-2 xs:border-l-4 border-destructive"
                          : "bg-success/20 border-l-2 xs:border-l-4 border-success"
                      }`}
                    >
                      <span className="font-medium text-xs xs:text-sm sm:text-base">
                        {entry.type === "motion" ? "🔴 Motion Detected" : "🟢 Motion Cleared"}
                      </span>
                      <span className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">{entry.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <div className="flex items-center gap-1.5 xs:gap-2 text-primary mb-2 xs:mb-3 sm:mb-4 font-display">
                <Brain className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm xs:text-base sm:text-lg">Monthly Analytics</span>
              </div>
              {getMonthlyAnalytics()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotionDashboard;