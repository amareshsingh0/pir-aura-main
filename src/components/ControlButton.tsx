import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ControlButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}

const ControlButton = ({ icon: Icon, label, onClick, active = false }: ControlButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 xs:px-3.5 sm:px-4 md:px-5 py-2 xs:py-2.5 sm:py-2.5 rounded-full backdrop-blur-lg transition-all duration-300 text-[11px] xs:text-xs sm:text-sm font-medium flex items-center gap-1.5 xs:gap-1.5 sm:gap-2",
        "border border-transparent hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 active:scale-95 min-h-[36px] xs:min-h-[40px] touch-manipulation",
        active 
          ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" 
          : "bg-white/10 text-foreground hover:bg-white/20"
      )}
    >
      <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
};

export default ControlButton;