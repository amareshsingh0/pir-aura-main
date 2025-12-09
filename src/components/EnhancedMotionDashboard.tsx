import { useState, useEffect, useRef } from "react";
import { Eye, Volume2, VolumeX, Download, Trash2, Activity, CalendarDays, TrendingUp, Clock, Radio, History, Brain, Mic, MicOff, Globe, Trophy, BarChart3, FileText, Zap, Battery, Search } from "lucide-react";
import ParticleBackground from "./ParticleBackground";
import StatusCard from "./StatusCard";
import StatBox from "./StatBox";
import ControlButton from "./ControlButton";
import TabButton from "./TabButton";
import ThemeSwitcher from "./ThemeSwitcher";
import { HourlyChart, DailyChart, WeeklyChart } from "./Charts";
import { GamificationPanel } from "./GamificationPanel";
import { useMotionData } from "@/hooks/useMotionData";
import { useVoiceCommands, speak } from "@/hooks/useVoiceCommands";
import { useGamification } from "@/hooks/useGamification";
import { useWeather } from "@/hooks/useWeather";
import { useSoundDetection } from "@/hooks/useSoundDetection";
import { usePatternRecognition } from "@/hooks/usePatternRecognition";
import { useLanguage } from "@/hooks/useLanguage";
import { exportToCSV, exportToJSON, exportToPDF } from "@/utils/exportUtils";
import { toast } from "sonner";
import confetti from "canvas-confetti";

type TabType = "live" | "history" | "analytics" | "charts" | "gamification" | "patterns";

const EnhancedMotionDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("live");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, clearHistory, exportCSV } = useMotionData();
  const { language, setLanguage, t } = useLanguage();
  const { data: gamificationData, addPoints } = useGamification(data.todayCount, data.streakCount);
  const { weather, loading: weatherLoading } = useWeather();
  const { patterns, predictNextMotion } = usePatternRecognition(data.historyData);
  const prevMotionRef = useRef(data.motionDetected);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice commands
  const handleVoiceCommand = (command: string) => {
    if (command === "hey motion") {
      toast.info("Voice command received!");
      speak("Motion sensor is active");
    } else if (command === "test") {
      toast.success("Test command executed");
      speak("System test successful");
    } else if (command === "clear") {
      clearHistory();
      speak("History cleared");
    }
  };

  const { isListening: voiceListening, startListening: startVoice, stopListening: stopVoice } = useVoiceCommands(handleVoiceCommand);

  // Sound detection (clap to test)
  const handleClap = () => {
    toast.success("Clap detected! Testing system...");
    speak("Clap detected, system is working");
    confetti({ particleCount: 30, spread: 60 });
  };

  const { isListening: soundListening, toggleListening: toggleSoundDetection } = useSoundDetection(handleClap);

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

  // Motion detection effects with enhanced features
  useEffect(() => {
    if (data.motionDetected && !prevMotionRef.current && !data.isOffline) {
      // Play sound
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // Voice feedback
      speak("Motion detected!");

      // Vibration
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Add points
      addPoints(10);

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
          badge: "/pir_icon.png",
        });
      }
    }
    prevMotionRef.current = data.motionDetected;
  }, [data.motionDetected, data.isOffline, soundEnabled, addPoints]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Battery estimation (based on uptime - 9V battery ~50 hours)
  const startTimeRef = useRef(Date.now());
  const batteryLevel = Math.max(0, 100 - ((Date.now() - startTimeRef.current) / (50 * 60 * 60 * 1000)) * 100);
  const isLowBattery = batteryLevel < 20;

  useEffect(() => {
    if (isLowBattery) {
      toast.warning("Low Battery Warning", {
        description: "Estimated battery level is below 20%",
      });
    }
  }, [isLowBattery]);

  const filteredHistory = data.historyData.filter((entry) =>
    entry.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = (format: "csv" | "json" | "pdf") => {
    if (format === "csv") {
      exportCSV();
    } else if (format === "json") {
      exportToJSON(data, `motion-data-${new Date().toISOString().slice(0, 10)}`);
    } else if (format === "pdf") {
      exportToPDF(
        "PIR Motion Detection Report",
        `Total Detections: ${data.todayCount}\nMonth Count: ${data.monthCount}\nUptime: ${data.uptime}`,
        `motion-report-${new Date().toISOString().slice(0, 10)}`
      );
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative safe-area" dir={language === "ar" || language === "ur" ? "rtl" : "ltr"}>
      <ParticleBackground />
      <ThemeSwitcher />

      <div className="relative z-10 max-w-6xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 pt-safe-top pb-safe-bottom py-3 xs:py-4 sm:py-5 md:py-6 lg:py-8">
        {/* Header */}
        <header className="text-center mb-4 xs:mb-5 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage(language === "en" ? "hi" : language === "hi" ? "ar" : language === "ar" ? "ur" : "en")}
                className="p-2 glass rounded-lg hover:bg-white/20 transition"
                title="Change Language"
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              {voiceListening ? (
                <button onClick={stopVoice} className="p-2 glass rounded-lg bg-destructive/20">
                  <Mic className="w-4 h-4 text-destructive" />
                </button>
              ) : (
                <button onClick={startVoice} className="p-2 glass rounded-lg hover:bg-white/20">
                  <MicOff className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={toggleSoundDetection}
                className={`p-2 glass rounded-lg ${soundListening ? "bg-primary/20" : ""}`}
                title="Clap Detection"
              >
                <Zap className={`w-4 h-4 ${soundListening ? "text-primary" : ""}`} />
              </button>
            </div>
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold gradient-text flex flex-col xs:flex-row items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
            <Eye className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0" />
            <span className="leading-tight text-center">{t("motion.detected")}</span>
          </h1>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base md:text-lg px-2">
            {t("status.current")} • <span className="text-primary block xs:inline mt-1 xs:mt-0">{currentTime}</span>
            {weather && !weatherLoading && (
              <span className="block xs:inline mt-1 xs:mt-0 xs:ml-2">
                • {weather.temp}°C {weather.condition}
              </span>
            )}
          </p>
        </header>

        {/* Controls */}
        <div className="flex justify-center gap-2 xs:gap-2.5 sm:gap-3 flex-wrap mb-4 xs:mb-5 sm:mb-6 md:mb-8 px-2">
          <ControlButton
            icon={soundEnabled ? Volume2 : VolumeX}
            label={`${t("controls.sound")}: ${soundEnabled ? "ON" : "OFF"}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            active={soundEnabled}
          />
          <ControlButton
            icon={Download}
            label={t("controls.export")}
            onClick={() => handleExport("csv")}
          />
          <ControlButton
            icon={FileText}
            label="Export PDF"
            onClick={() => handleExport("pdf")}
          />
          <ControlButton
            icon={Trash2}
            label={t("controls.clear")}
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
          <StatBox icon={Activity} title={t("stats.today")} value={data.todayCount} />
          <StatBox icon={CalendarDays} title={t("stats.month")} value={data.monthCount} />
          <StatBox icon={TrendingUp} title={t("stats.avg")} value={data.avgDaily} />
          <StatBox icon={Clock} title={t("stats.uptime")} value={data.uptime} />
        </div>

        {/* Gamification Quick View */}
        <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-8">
          <GamificationPanel
            points={gamificationData.points}
            level={gamificationData.level}
            badges={gamificationData.badges}
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1.5 xs:gap-2 sm:gap-3 flex-wrap mb-4 xs:mb-5 sm:mb-6 md:mb-8">
          <TabButton label={t("tabs.live")} active={activeTab === "live"} onClick={() => setActiveTab("live")} />
          <TabButton label={t("tabs.history")} active={activeTab === "history"} onClick={() => setActiveTab("history")} />
          <TabButton label={t("tabs.analytics")} active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
          <TabButton label="Charts" active={activeTab === "charts"} onClick={() => setActiveTab("charts")} />
          <TabButton label="Patterns" active={activeTab === "patterns"} onClick={() => setActiveTab("patterns")} />
          <TabButton label="🏆" active={activeTab === "gamification"} onClick={() => setActiveTab("gamification")} />
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
              <div className="mb-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-background/50 rounded-lg text-sm border border-primary/20 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="max-h-[200px] xs:max-h-[250px] sm:max-h-[300px] md:max-h-[400px] overflow-y-auto space-y-1.5 xs:space-y-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                {filteredHistory.length === 0 ? (
                  <p className="text-muted-foreground text-xs xs:text-sm">No events found.</p>
                ) : (
                  [...filteredHistory].reverse().map((entry, i) => (
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
              {/* Analytics content */}
            </div>
          )}

          {activeTab === "charts" && (
            <div className="space-y-4">
              <HourlyChart historyData={data.historyData} />
              <DailyChart historyData={data.historyData} />
              <WeeklyChart historyData={data.historyData} />
            </div>
          )}

          {activeTab === "patterns" && (
            <div className="space-y-4">
              <div className="glass rounded-lg p-4">
                <h3 className="font-display mb-3">Detected Patterns</h3>
                {patterns.length > 0 ? (
                  <div className="space-y-2">
                    {patterns.map((pattern, i) => (
                      <div key={i} className="p-3 bg-background/50 rounded-lg">
                        <div className="font-medium">{pattern.description}</div>
                        <div className="text-sm text-muted-foreground">Confidence: {pattern.confidence.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No patterns detected yet. Need more data.</p>
                )}
              </div>
              {predictNextMotion && (
                <div className="glass rounded-lg p-4">
                  <h3 className="font-display mb-3">Predictive Analytics</h3>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="font-medium">{predictNextMotion.message}</div>
                    <div className="text-sm text-muted-foreground">
                      Predicted time: {predictNextMotion.predictedTime.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Confidence: {predictNextMotion.confidence.toFixed(0)}%</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "gamification" && (
            <div>
              <GamificationPanel
                points={gamificationData.points}
                level={gamificationData.level}
                badges={gamificationData.badges}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMotionDashboard;

