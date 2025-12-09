import { Home, Lightbulb, Zap, Settings, Wand2, FileText, Moon, Sun, Monitor, Globe, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  language: "en" | "hi";
  onLanguageChange: () => void;
  theme: "light" | "dark" | "auto";
  onThemeChange: () => void;
}

const Sidebar = ({ activeSection, onSectionChange, language, onLanguageChange, theme, onThemeChange }: SidebarProps) => {
  const sections = [
    { id: "dashboard", label: language === "hi" ? "लाइव मोशन डैशबोर्ड" : "Live Motion Dashboard", icon: Home },
    { id: "analytics", label: language === "hi" ? "एनालिटिक्स" : "Analytics", icon: BarChart3 },
    { id: "rooms", label: language === "hi" ? "कमरे और जोन" : "Rooms & Zones", icon: Home },
    { id: "devices", label: language === "hi" ? "लाइट्स और डिवाइस" : "Lights & Devices", icon: Lightbulb },
    { id: "energy", label: language === "hi" ? "ऊर्जा और उपयोग" : "Energy & Usage", icon: Zap },
  ];

  const automationSections = [
    { id: "rules", label: language === "hi" ? "नियम और शेड्यूल" : "Rules & Schedules", icon: Settings },
    { id: "scenes", label: language === "hi" ? "स्मार्ट सीन" : "Smart Scenes", icon: Wand2 },
    { id: "logs", label: language === "hi" ? "गतिविधि लॉग" : "Activity Logs", icon: FileText },
  ];

  const getThemeIcon = () => {
    if (theme === "light") return Sun;
    if (theme === "dark") return Moon;
    return Monitor;
  };

  const ThemeIcon = getThemeIcon();

  return (
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 flex flex-col pt-safe-top pb-safe-bottom">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <img src="/pir_icon.png" alt="PIR Logo" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="font-display font-bold text-sm">PIR MOTION</div>
            <div className="text-xs text-muted-foreground">Control Center</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        <div className="text-xs uppercase text-muted-foreground px-3 py-2 font-display">OVERVIEW</div>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-sm",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{section.label}</span>
              {activeSection === section.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}

        <div className="text-xs uppercase text-muted-foreground px-3 py-2 mt-4 font-display">AUTOMATION</div>
        {automationSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-sm",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{section.label}</span>
              {activeSection === section.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-shrink-0 border-t border-border p-2 pt-safe-bottom flex flex-row xs:flex-col gap-2 xs:gap-0">
        <button
          onClick={onLanguageChange}
          className="flex-1 xs:w-full flex items-center justify-center xs:justify-start gap-2 xs:gap-3 px-2 xs:px-3 py-2 xs:py-2.5 rounded-lg mb-0 xs:mb-2 text-xs xs:text-sm text-foreground hover:bg-muted transition-colors"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          <span className="truncate hidden sm:inline">{language === "hi" ? "English" : "हिंदी"}</span>
        </button>
        <button
          onClick={onThemeChange}
          className="flex-1 xs:w-full flex items-center justify-center xs:justify-start gap-2 xs:gap-3 px-2 xs:px-3 py-2 xs:py-2.5 rounded-lg text-xs xs:text-sm text-foreground hover:bg-muted transition-colors"
        >
          <ThemeIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate hidden sm:inline">
            {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Auto"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

