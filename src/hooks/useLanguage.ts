import { useState, useEffect } from "react";

type Language = "en" | "hi";

const translations: Record<Language, Record<string, string>> = {
  en: {
    "motion.detected": "Motion Detected",
    "motion.none": "No Motion",
    "status.current": "CURRENT STATUS",
    "stats.today": "Today's Detections",
    "stats.month": "This Month",
    "stats.avg": "Average Daily",
    "stats.uptime": "System Uptime",
    "tabs.live": "Live Feed",
    "tabs.history": "History Log",
    "tabs.analytics": "Analytics",
    "controls.sound": "Sound",
    "controls.export": "Export CSV",
    "controls.clear": "Clear History",
    "sidebar.dashboard": "Live Motion Dashboard",
    "sidebar.rooms": "Rooms & Zones",
    "sidebar.devices": "Lights & Devices",
    "sidebar.energy": "Energy & Usage",
    "sidebar.rules": "Rules & Schedules",
    "sidebar.scenes": "Smart Scenes",
    "sidebar.logs": "Activity Logs",
    "widget.motion.status": "MOTION STATUS",
    "widget.detection.count": "DETECTION COUNT",
    "widget.last.motion": "LAST MOTION",
    "widget.system.health": "SYSTEM HEALTH",
    "widget.active.zones": "ACTIVE ZONES",
    "widget.automation.rules": "AUTOMATION RULES",
    "widget.activity.log": "LIVE ACTIVITY LOG",
  },
  hi: {
    "motion.detected": "गति का पता चला",
    "motion.none": "कोई गति नहीं",
    "status.current": "वर्तमान स्थिति",
    "stats.today": "आज का पता लगाना",
    "stats.month": "इस महीने",
    "stats.avg": "औसत दैनिक",
    "stats.uptime": "सिस्टम अपटाइम",
    "tabs.live": "लाइव फीड",
    "tabs.history": "इतिहास लॉग",
    "tabs.analytics": "विश्लेषण",
    "controls.sound": "ध्वनि",
    "controls.export": "CSV निर्यात करें",
    "controls.clear": "इतिहास साफ करें",
    "sidebar.dashboard": "लाइव मोशन डैशबोर्ड",
    "sidebar.rooms": "कमरे और जोन",
    "sidebar.devices": "लाइट्स और डिवाइस",
    "sidebar.energy": "ऊर्जा और उपयोग",
    "sidebar.rules": "नियम और शेड्यूल",
    "sidebar.scenes": "स्मार्ट सीन",
    "sidebar.logs": "गतिविधि लॉग",
    "widget.motion.status": "गति स्थिति",
    "widget.detection.count": "पता लगाने की संख्या",
    "widget.last.motion": "अंतिम गति",
    "widget.system.health": "सिस्टम स्वास्थ्य",
    "widget.active.zones": "सक्रिय जोन",
    "widget.automation.rules": "ऑटोमेशन नियम",
    "widget.activity.log": "लाइव गतिविधि लॉग",
  },
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && ["en", "hi"].includes(saved)) {
      return saved;
    }
    // Auto-detect from browser
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "hi") return "hi";
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  return { language, setLanguage, toggleLanguage, t };
};
