import React, { useState, useEffect, useRef } from "react";
import { Eye, Volume2, VolumeX, Mic, MicOff, Settings, Home, Lightbulb, Zap, Wand2, FileText, Moon, Sun, Monitor, Globe, Radio, Download, Trash2, Search, Trophy, BarChart3, Brain, Battery, Activity, TrendingUp } from "lucide-react";
import Sidebar from "./Sidebar";
import StatusCard from "./StatusCard";
import { HourlyChart, DailyChart, WeeklyChart } from "./Charts";
import { GamificationPanel } from "./GamificationPanel";
import MotionHeatmap from "./MotionHeatmap";
import MotionTimeline from "./MotionTimeline";
import MotionComparison from "./MotionComparison";
import MotionFrequency from "./MotionFrequency";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMotionData } from "@/hooks/useMotionData";
import { useVoiceCommands, speak } from "@/hooks/useVoiceCommands";
import { useGamification } from "@/hooks/useGamification";
import { useWeather } from "@/hooks/useWeather";
import { useSoundDetection } from "@/hooks/useSoundDetection";
import { usePatternRecognition } from "@/hooks/usePatternRecognition";
import { useLanguage } from "@/hooks/useLanguage";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { useUptimeLogs } from "@/hooks/useUptimeLogs";
import { exportToCSV, exportToJSON, exportToPDF, exportToExcel } from "@/utils/exportUtils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { format, parseISO, differenceInMilliseconds } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

type Section = "dashboard" | "rooms" | "devices" | "energy" | "rules" | "scenes" | "logs" | "analytics";
type Theme = "light" | "dark" | "auto";

export const SmartDashboard = () => {
  // Add this with your other state variables at the top of SmartDashboard component
  const [chartType, setChartType] = useState<'hourly' | 'daily' | 'weekly'>('hourly');
  const analyticsContainerRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [currentTime, setCurrentTime] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme;
    return saved || "dark";
  });
  const { language, toggleLanguage, t } = useLanguage();
  const { data, clearHistory, exportCSV } = useMotionData();
  const { data: gamificationData, addPoints } = useGamification(data.todayCount, data.streakCount);
  const { weather, loading: weatherLoading } = useWeather();
  const { patterns, predictNextMotion } = usePatternRecognition(data.historyData);
  const [searchQuery, setSearchQuery] = useState("");
  const [sensorResponseTime, setSensorResponseTime] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const isSharedMode = searchParams.get("share") === "1";
  const systemHealth = useSystemHealth(data.isOffline, sensorResponseTime);
  const uptimeLogs = useUptimeLogs(data.isOffline);
  const prevMotionRef = useRef(data.motionDetected);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const motionStartTimeRef = useRef<number | null>(null);

  // Voice commands
  const handleVoiceCommand = (command: string) => {
    if (command === "hey motion") {
      toast.info(language === "hi" ? "आवाज़ कमांड प्राप्त हुई!" : "Voice command received!");
      speak(language === "hi" ? "मोशन सेंसर सक्रिय है" : "Motion sensor is active");
    } else if (command === "test") {
      toast.success(language === "hi" ? "टेस्ट कमांड निष्पादित" : "Test command executed");
      speak(language === "hi" ? "सिस्टम टेस्ट सफल" : "System test successful");
    } else if (command === "clear") {
      clearHistory();
      speak(language === "hi" ? "इतिहास साफ हो गया" : "History cleared");
    }
  };

  const { isListening: voiceListening, startListening: startVoice, stopListening: stopVoice } = useVoiceCommands(handleVoiceCommand);

  // Sound detection (clap to test)
  const handleClap = () => {
    toast.success(language === "hi" ? "ताली का पता चला! सिस्टम टेस्ट..." : "Clap detected! Testing system...");
    speak(language === "hi" ? "ताली का पता चला, सिस्टम काम कर रहा है" : "Clap detected, system is working");
    confetti({ particleCount: 30, spread: 60 });
  };

  const { isListening: soundListening, toggleListening: toggleSoundDetection } = useSoundDetection(handleClap);

  // Theme management
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t: Theme) => {
      if (t === "auto") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", t === "dark");
      }
    };
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "auto"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(format(new Date(), "h:mm:ss a"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-tone-1057.mp3");
    audioRef.current.volume = 0.3;
  }, []);

  // Motion detection effects with all features
  useEffect(() => {
    if (data.motionDetected && !prevMotionRef.current && !data.isOffline) {
      const detectionTime = Date.now();
      
      // Track sensor response time
      if (motionStartTimeRef.current) {
        const responseTime = detectionTime - motionStartTimeRef.current;
        setSensorResponseTime(responseTime);
      }
      motionStartTimeRef.current = detectionTime;

      // Play sound
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // Voice feedback
      speak(language === "hi" ? "गति का पता चला!" : "Motion detected!");

      // Vibration
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Confetti
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

      // Add gamification points
      addPoints(10);

      toast.error(language === "hi" ? "गति का पता चला!" : "MOTION DETECTED!", {
        description: language === "hi" ? "PIR सेंसर अभी ट्रिगर हुआ!" : "PIR sensor triggered right now!",
        duration: 3000,
      });

      // Push notification
      if (Notification.permission === "granted") {
        new Notification(language === "hi" ? "गति का पता चला!" : "Motion Detected!", {
          body: language === "hi" 
            ? `PIR सेंसर ${new Date().toLocaleTimeString()} पर ट्रिगर हुआ`
            : `PIR sensor triggered at ${new Date().toLocaleTimeString()}`,
          icon: "/pir_icon.png",
          badge: "/pir_icon.png",
        });
      }
    }
    prevMotionRef.current = data.motionDetected;
  }, [data.motionDetected, data.isOffline, soundEnabled, language, addPoints]);

  // Calculate Custom KPIs
  const motionsPerHour = data.todayCount > 0 ? Math.round((data.todayCount / 24) * 10) / 10 : 0;
  const quietHours = data.historyData.length > 0 
    ? data.historyData.filter(e => e.type === "clear").length 
    : 0;

  // Power consumption estimation (based on motion count)
  const dailyPowerConsumption = Math.round((data.todayCount * 0.05) * 100) / 100; // 0.05W per motion detection
  const monthlyPowerConsumption = Math.round((data.monthCount * 0.05) * 100) / 100; // Monthly estimate

  // Battery estimation
  const startTimeRef = useRef(Date.now());
  const batteryLevel = Math.max(0, 100 - ((Date.now() - startTimeRef.current) / (50 * 60 * 60 * 1000)) * 100);
  const isLowBattery = batteryLevel < 20;

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const Widget = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`glass rounded-xl p-4 xs:p-5 sm:p-6 ${className}`}>
      <h3 className="text-sm font-display font-bold text-muted-foreground mb-3 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );

  const renderDashboardContent = () => (
    <>
      {/* Status Card */}
      <div className="mb-6">
        <StatusCard
          motionDetected={data.motionDetected}
          isOffline={data.isOffline}
          lastDetection={data.lastDetection}
          streakCount={data.streakCount}
        />
      </div>

      {/* Top Row Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Widget title={t("widget.detection.count")}>
          <div className="text-3xl font-display font-bold mb-2">{data.todayCount}</div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "ऑटोमेशन नोड शुरू होने के बाद से कुल मोशन इवेंट्स।" : "Total motion events since the automation node started."}
          </p>
        </Widget>

        <Widget title={t("widget.last.motion")}>
          <div className="text-3xl font-display font-bold mb-2">{data.lastDetection === "Never" ? "--" : data.lastDetection}</div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "सबसे हाल की पता लगाई गई मोशन इवेंट की टाइमस्टैम्प।" : "Timestamp of the most recent detected motion event."}
          </p>
        </Widget>

        <Widget title={t("widget.system.health")}>
          <div className={`text-2xl font-display font-bold mb-1 ${data.isOffline ? "text-destructive" : "text-success"}`}>
            {data.isOffline ? "OFFLINE" : "ONLINE"}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === "hi" ? "CPU" : "CPU"}</span>
              <span>{systemHealth.cpuUsage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === "hi" ? "मेमोरी" : "Memory"}</span>
              <span>{systemHealth.memoryUsage}%</span>
            </div>
            {sensorResponseTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === "hi" ? "प्रतिक्रिया समय" : "Response"}</span>
                <span>{sensorResponseTime}ms</span>
              </div>
            )}
          </div>
        </Widget>

        <Widget title={language === "hi" ? "बैटरी" : "Battery"}>
          <div className={`text-3xl font-display font-bold mb-2 ${isLowBattery ? "text-destructive" : "text-success"}`}>
            {Math.round(batteryLevel)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "अनुमानित बैटरी स्तर" : "Estimated battery level"}
          </p>
        </Widget>
      </div>

      {/* Custom KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Widget title={language === "hi" ? "प्रति घंटे गति" : "Motions/Hour"}>
          <div className="text-2xl font-display font-bold mb-2">{motionsPerHour}</div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "औसत गति प्रति घंटे" : "Average motions per hour"}
          </p>
        </Widget>

        <Widget title={language === "hi" ? "शांत घंटे" : "Quiet Hours"}>
          <div className="text-2xl font-display font-bold mb-2">{quietHours}</div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "कोई गति नहीं" : "Hours with no motion"}
          </p>
        </Widget>

        <Widget title={language === "hi" ? "बिजली खपत" : "Power Usage"}>
          <div className="text-2xl font-display font-bold mb-2">{dailyPowerConsumption}W</div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? `दैनिक (मासिक: ${monthlyPowerConsumption}W)` : `Daily (Monthly: ${monthlyPowerConsumption}W)`}
          </p>
        </Widget>

        <Widget title={language === "hi" ? "सेंसर प्रतिक्रिया" : "Sensor Response"}>
          <div className="text-2xl font-display font-bold mb-2">
            {sensorResponseTime ? `${sensorResponseTime}ms` : "--"}
          </div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "PIR ट्रिगर से ब्राउज़र प्राप्त करने का समय" : "PIR trigger → browser receive time"}
          </p>
        </Widget>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Motion Activity Chart */}
        <div className="lg:col-span-2 glass rounded-xl p-4 xs:p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold">Motion Activity Chart</h3>
            {data.isOffline && <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-full">OFFLINE</span>}
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {language === "hi"
              ? "PIR सेंसर से मोशन इवेंट्स का लाइव टाइमलाइन (1 = पता चला, 0 = साफ)।"
              : "Live timeline of motion events from the PIR sensor (1 = detected, 0 = clear)."}
          </p>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {data.historyData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === "hi" ? "कोई डेटा नहीं" : "No data"}
              </div>
            ) : (
              [...data.historyData].reverse().slice(0, 20).map((entry, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${entry.type === "motion" ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-2 h-2 rounded-full ${entry.type === "motion" ? "bg-primary" : "bg-muted"}`} />
                  <span>{entry.type === "motion" ? "1" : "0"}</span>
                  <span className="ml-auto">{entry.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Zones */}
        <Widget title={t("widget.active.zones")}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm">Entry Corridor</span>
              </div>
              <span className="text-xs text-success">Auto-ON via PIR</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-warning/10 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-sm">Living Room</span>
              </div>
              <span className="text-xs text-warning">Scene: Evening Chill</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-sm">Bedroom</span>
              </div>
              <span className="text-xs text-muted-foreground">Idle</span>
            </div>
          </div>
        </Widget>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Rules */}
        <Widget title={t("widget.automation.rules")}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <p className="text-sm">
                  {language === "hi"
                    ? "यदि 7pm के बाद मोशन का पता चलता है, तो एंट्री लाइट्स को 2 मिनट के लिए ON करें।"
                    : "If motion detected after 7pm, turn entry lights ON for 2 minutes."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <p className="text-sm">
                  {language === "hi"
                    ? "यदि 10 मिनट तक कोई मोशन नहीं है, तो लिविंग रूम को 20% तक डिम करें।"
                    : "If no motion for 10 minutes, dim living room to 20%."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 opacity-50">
              <input type="checkbox" className="mt-1" />
              <div>
                <p className="text-sm">
                  {language === "hi"
                    ? "भविष्य के डिवाइस के साथ एकीकृत करें: AC, पर्दे, अलार्म।"
                    : "Integrate with future devices: AC, curtains, alarm."}
                </p>
              </div>
            </div>
          </div>
        </Widget>

        {/* Live Activity Log */}
        <Widget title={t("widget.activity.log")}>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {data.historyData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                {language === "hi" ? "कोई लॉग नहीं" : "No logs"}
              </p>
            ) : (
              [...data.historyData].reverse().slice(0, 10).map((entry, i) => (
                <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="text-primary">[{format(parseISO(entry.time), "h:mm:ss a")}]</span>
                  <span>
                    {entry.type === "motion"
                      ? language === "hi"
                        ? "मोशन का पता चला"
                        : "Motion detected"
                      : language === "hi"
                      ? "मोशन साफ"
                      : "Motion cleared"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Widget>
      </div>
    </>
  );

  const renderRoomsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">{language === "hi" ? "कमरे और जोन" : "Rooms & Zones"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Widget title="Entry Corridor">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <span className="text-xs text-success">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === "hi" ? "PIR सेंसर" : "PIR Sensor"}</span>
              <span className="text-xs text-primary">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === "hi" ? "अंतिम गति" : "Last Motion"}</span>
              <span className="text-xs">{data.lastDetection}</span>
            </div>
          </div>
        </Widget>
        <Widget title="Living Room">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <span className="text-xs text-warning">Scene Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === "hi" ? "सीन" : "Scene"}</span>
              <span className="text-xs">Evening Chill</span>
            </div>
          </div>
        </Widget>
        <Widget title="Bedroom">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <span className="text-xs text-muted-foreground">Idle</span>
            </div>
          </div>
        </Widget>
      </div>
    </div>
  );

  const renderDevicesContent = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold">{language === "hi" ? "लाइट्स और डिवाइस" : "Lights & Devices"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Widget title={language === "hi" ? "स्मार्ट लाइट्स" : "Smart Lights"}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                <span className="text-sm">Entry Lights</span>
                <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs">ON</button>
              </div>
              <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                <span className="text-sm">Living Room</span>
                <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-xs">20%</button>
              </div>
              <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                <span className="text-sm">Bedroom</span>
                <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-xs">OFF</button>
              </div>
            </div>
          </Widget>
          <Widget title={language === "hi" ? "PIR सेंसर" : "PIR Sensors"}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                <span className="text-sm">Main Sensor</span>
                <span className={`text-xs ${data.isOffline ? "text-destructive" : "text-success"}`}>
                  {data.isOffline ? "OFFLINE" : "ONLINE"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                <span className="text-sm">{language === "hi" ? "कुल डिटेक्शन" : "Total Detections"}</span>
                <span className="text-xs">{data.todayCount}</span>
              </div>
            </div>
          </Widget>
        </div>
      </div>
    );
  };

  const renderEnergyContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">{language === "hi" ? "ऊर्जा और उपयोग" : "Energy & Usage"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Widget title={language === "hi" ? "आज की खपत" : "Today's Usage"}>
          <div className="text-3xl font-display font-bold mb-2">{dailyPowerConsumption}W</div>
          <p className="text-xs text-muted-foreground">{language === "hi" ? "लाइट्स और सेंसर" : "Lights & Sensors"}</p>
        </Widget>
        <Widget title={language === "hi" ? "मासिक अनुमान" : "Monthly Estimate"}>
          <div className="text-3xl font-display font-bold mb-2">{monthlyPowerConsumption}W</div>
          <p className="text-xs text-muted-foreground">{language === "hi" ? "इस महीने" : "This Month"}</p>
        </Widget>
        <Widget title={language === "hi" ? "बैटरी स्तर" : "Battery Level"}>
          <div className={`text-3xl font-display font-bold mb-2 ${isLowBattery ? "text-destructive" : "text-success"}`}>
            {Math.round(batteryLevel)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "अनुमानित (9V बैटरी ~50 घंटे)" : "Estimated (9V battery ~50 hours)"}
          </p>
        </Widget>
      </div>
      <Widget title={language === "hi" ? "बिजली खपत आंकड़े" : "Power Consumption Stats"}>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
            <span className="text-sm">{language === "hi" ? "प्रति गति खपत" : "Per Motion Consumption"}</span>
            <span className="text-sm font-bold">0.05W</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
            <span className="text-sm">{language === "hi" ? "कुल गति" : "Total Motions"}</span>
            <span className="text-sm font-bold">{data.todayCount}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
            <span className="text-sm">{language === "hi" ? "कुल खपत" : "Total Consumption"}</span>
            <span className="text-sm font-bold">{dailyPowerConsumption}W</span>
          </div>
        </div>
      </Widget>
    </div>
  );

  const renderRulesContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">{language === "hi" ? "नियम और शेड्यूल" : "Rules & Schedules"}</h2>
      <Widget title={t("widget.automation.rules")}>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
            <input type="checkbox" defaultChecked className="mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">
                {language === "hi"
                  ? "यदि 7pm के बाद मोशन का पता चलता है, तो एंट्री लाइट्स को 2 मिनट के लिए ON करें।"
                  : "If motion is detected after 7pm, turn on entry lights for 2 minutes."}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "hi" ? "रोजाना 7:00 PM - 11:00 PM" : "Daily at 7:00 PM - 11:00 PM"}
              </p>
            </div>
          </div>
        </div>
      </Widget>
    </div>
  );

  const renderScenesContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">{language === "hi" ? "स्मार्ट सीन" : "Smart Scenes"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Widget title={language === "hi" ? "शाम का मोड" : "Evening Mode"}>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">{language === "hi" ? "शाम के लिए लाइट सेटिंग्स" : "Light settings for evening"}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === "hi" ? "स्थिति" : "Status"}</span>
              <span className="text-xs text-muted-foreground">Inactive</span>
            </div>
          </div>
        </Widget>
        <Widget title="Morning Wake">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">{language === "hi" ? "सुबह का दृश्य" : "Morning scene"}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === "hi" ? "स्थिति" : "Status"}</span>
              <span className="text-xs text-muted-foreground">Inactive</span>
            </div>
          </div>
        </Widget>
      </div>
    </div>
  );

  const renderLogsContent = () => {
    const filteredHistory = data.historyData.filter((entry) =>
      entry.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold">{language === "hi" ? "गतिविधि लॉग" : "Activity Logs"}</h2>
        
        {/* Uptime/Downtime Logs */}
        <Widget title={language === "hi" ? "अपटाइम/डाउनटाइम लॉग" : "Uptime/Downtime Logs"}>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {uptimeLogs.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                {language === "hi" ? "कोई लॉग नहीं" : "No logs yet"}
              </p>
            ) : (
              [...uptimeLogs].reverse().map((log, i) => (
                <div key={i} className={`p-2 rounded-lg text-xs ${log.type === "uptime" ? "bg-success/10 border-l-2 border-success" : "bg-destructive/10 border-l-2 border-destructive"}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {log.type === "uptime" 
                        ? (language === "hi" ? "🟢 अपटाइम" : "🟢 Uptime")
                        : (language === "hi" ? "🔴 डाउनटाइम" : "🔴 Downtime")}
                    </span>
                    <span className="text-muted-foreground">{log.duration}</span>
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {format(parseISO(log.startTime), "MMM dd, h:mm:ss a")}
                    {log.endTime && ` - ${format(parseISO(log.endTime), "h:mm:ss a")}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </Widget>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={language === "hi" ? "लॉग खोजें..." : "Search logs..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-background/50 rounded-lg text-sm border border-primary/20 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <Widget title={t("widget.activity.log")}>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                {language === "hi" ? "कोई लॉग नहीं मिला" : "No logs found"}
              </p>
            ) : (
              [...filteredHistory].reverse().map((entry, i) => (
                <div key={i} className="text-xs text-muted-foreground flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                  <span className="text-primary">[{format(parseISO(entry.time), "h:mm:ss a")}]</span>
                  <span>
                    {entry.type === "motion"
                      ? language === "hi"
                        ? "मोशन का पता चला"
                        : "Motion detected"
                      : language === "hi"
                      ? "मोशन साफ"
                      : "Motion cleared"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Widget>
      </div>
    );
  };

  const renderAnalyticsContent = () => {
    // DON'T call useState here - use the chartType from parent

    return (
      <div className="space-y-6">
        <h2 className="text-2xl xs:text-3xl font-display font-bold">
          {language === "hi" ? "उन्नत एनालिटिक्स" : "Advanced Analytics"}
        </h2>
        
        {/* Motion Heatmap */}
        <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
          <MotionHeatmap historyData={data.historyData} language={language} />
        </div>
        
        {/* Motion Timeline */}
        <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
          <MotionTimeline historyData={data.historyData} language={language} />
        </div>
        
        {/* Comparison and Frequency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
            <MotionComparison historyData={data.historyData} language={language} />
          </div>
          <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
            <MotionFrequency historyData={data.historyData} language={language} />
          </div>
        </div>
          
        {/* Charts Grid - All visible */}
        <div className="space-y-6">
          <h3 className="text-lg font-display font-bold">
            {language === "hi" ? "विज़ुअलाइज़ेशन चार्ट" : "Visualization Charts"}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hourly Chart */}
            <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                {language === "hi" ? "घंटेवार गति" : "Hourly Motion"}
              </h4>
              <div className="h-64">
                <HourlyChart historyData={data.historyData} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {language === "hi" 
                  ? "आखिरी 24 घंटों में प्रति घंटे गति डिटेक्शन"
                  : "Motion detections per hour in last 24h"}
              </p>
            </div>
            
            {/* Daily Chart */}
            <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                {language === "hi" ? "दैनिक गति" : "Daily Motion"}
              </h4>
              <div className="h-64">
                <DailyChart historyData={data.historyData} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {language === "hi" 
                  ? "आखिरी 7 दिनों में प्रति दिन गति डिटेक्शन"
                  : "Motion detections per day in last 7 days"}
              </p>
            </div>
            
            {/* Weekly Chart */}
            <div className="glass rounded-xl p-4 xs:p-5 sm:p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                {language === "hi" ? "साप्ताहिक वितरण" : "Weekly Distribution"}
              </h4>
              <div className="h-64">
                <WeeklyChart historyData={data.historyData} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {language === "hi" 
                  ? "सप्ताह के दिनों के अनुसार गति डिटेक्शन"
                  : "Motion distribution by day of week"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent();
      case "rooms":
        return renderRoomsContent();
      case "devices":
        return renderDevicesContent();
      case "energy":
        return renderEnergyContent();
      case "rules":
        return renderRulesContent();
      case "scenes":
        return renderScenesContent();
      case "logs":
        return renderLogsContent();
      case "analytics":
        return renderAnalyticsContent();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {!isSharedMode && (
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(section: Section) => setActiveSection(section as Section)}
          language={language}
          onLanguageChange={toggleLanguage}
          theme={theme}
          onThemeChange={cycleTheme}
        />
      )}

      {/* <div className={`flex-1 ${!isSharedMode && !isMobile ? "ml-64" : isMobile ? "mt-16" : ""} pt-safe-top pb-safe-bottom overflow-y-auto`}> */}
      <div className={`flex-1 ${!isSharedMode && !isMobile ? "ml-64" : isMobile ? "mt-16" : ""} pt-safe-top pb-safe-bottom ${activeSection === 'analytics' ? 'no-auto-scroll' : 'overflow-y-auto'}`}>
        <div className="max-w-7xl mx-auto p-4 xs:p-5 sm:p-6 md:p-8">
          {/* Header - REMOVED CLEAR HISTORY BUTTON */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl font-display font-bold gradient-text flex items-center gap-3">
                PIR Motion Dashboard
                <span className="text-xs xs:text-sm px-2 py-1 bg-primary/20 text-primary rounded-full">PIR Powered</span>
              </h1>
              <p className="text-muted-foreground text-sm xs:text-base mt-2">
                {language === "hi"
                  ? "रियल-टाइम मोशन डिटेक्शन, स्मार्ट लाइटिंग ऑटोमेशन, और गतिविधि एनालिटिक्स - सभी एक फ्यूचरिस्टिक कंट्रोल सेंटर में विज़ुअलाइज़ किए गए।"
                  : "Real-time motion detection, smart lighting automation, and activity analytics - all visualised in one futuristic control center."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-display font-bold">{currentTime}</div>
                <div className="text-xs text-muted-foreground">Local - Automation Node</div>
              </div>
              <button 
                onClick={() => setSettingsOpen(true)}
                className="p-2 glass rounded-lg hover:bg-white/20 transition-colors"
                title={language === "hi" ? "सेटिंग्स" : "Settings"}
              >
                <Settings className="w-5 h-5" />
              </button>
              {/* REMOVED CLEAR HISTORY BUTTON - IT'S ALREADY IN SETTINGS */}
            </div>
          </div>

          {/* Dynamic Content Based on Section */}
          {renderContent()}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {language === "hi" ? "सिस्टम सेटिंग्स" : "System Settings"}
            </DialogTitle>
            <DialogDescription>
              {language === "hi" ? "अपने PIR मोशन डैशबोर्ड को कस्टमाइज़ करें" : "Customize your PIR Motion Dashboard"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Sound Settings */}
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5" />}
                <div>
                  <div className="font-medium text-sm">{language === "hi" ? "ध्वनि अलर्ट" : "Sound Alerts"}</div>
                  <div className="text-xs text-muted-foreground">
                    {language === "hi" ? "मोशन डिटेक्शन पर ध्वनि चलाएं" : "Play sound on motion detection"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? "px-4 py-2 rounded-lg text-sm transition-colors bg-primary text-primary-foreground" : "px-4 py-2 rounded-lg text-sm transition-colors bg-muted text-muted-foreground"}
              >
                {soundEnabled ? (language === "hi" ? "चालू" : "ON") : (language === "hi" ? "बंद" : "OFF")}
              </button>
            </div>

            {/* Voice Commands */}
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center gap-3">
                {voiceListening ? <Mic className="w-5 h-5 text-primary" /> : <MicOff className="w-5 h-5" />}
                <div>
                  <div className="font-medium text-sm">{language === "hi" ? "आवाज़ कमांड" : "Voice Commands"}</div>
                  <div className="text-xs text-muted-foreground">
                    {language === "hi" ? "हे मोशन कहकर सक्रिय करें" : "Say 'Hey Motion' to activate"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => voiceListening ? stopVoice() : startVoice()}
                className={voiceListening ? "px-4 py-2 rounded-lg text-sm transition-colors bg-primary text-primary-foreground" : "px-4 py-2 rounded-lg text-sm transition-colors bg-muted text-muted-foreground"}
              >
                {voiceListening ? (language === "hi" ? "सुन रहे हैं" : "Listening") : (language === "hi" ? "शुरू करें" : "Start")}
              </button>
            </div>

            {/* Export Options */}
            <div className="space-y-2 p-3 glass rounded-lg">
              <div className="font-medium text-sm mb-3">{language === "hi" ? "डेटा निर्यात" : "Export Data"}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    exportCSV();
                    toast.success(language === "hi" ? "CSV निर्यात किया गया" : "CSV exported");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={() => {
                    const jsonFileName = "motion-data-" + new Date().toISOString().slice(0, 10);
                    exportToJSON(data, jsonFileName);
                    toast.success(language === "hi" ? "JSON निर्यात किया गया" : "JSON exported");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={() => {
                    const reportContent = "Total Detections: " + data.todayCount + "\nMonth Count: " + data.monthCount + "\nUptime: " + data.uptime;
                    const fileName = "motion-report-" + new Date().toISOString().slice(0, 10);
                    exportToPDF("PIR Motion Detection Report", reportContent, fileName);
                    toast.success(language === "hi" ? "PDF निर्यात किया गया" : "PDF exported");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>

            {/* Clear History */}
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-destructive" />
                <div>
                  <div className="font-medium text-sm">{language === "hi" ? "इतिहास साफ करें" : "Clear History"}</div>
                  <div className="text-xs text-muted-foreground">
                    {language === "hi" ? "सभी रिकॉर्ड हटाएं" : "Delete all records"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(language === "hi" ? "क्या आप सभी इतिहास हटाना चाहते हैं?" : "Are you sure you want to clear all history?")) {
                    clearHistory();
                    toast.success(language === "hi" ? "इतिहास साफ हो गया" : "History cleared");
                    setSettingsOpen(false);
                  }
                }}
                className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm transition-colors"
              >
                {language === "hi" ? "साफ करें" : "Clear"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartDashboard;