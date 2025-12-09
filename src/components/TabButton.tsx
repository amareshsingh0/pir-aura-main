import { cn } from "@/lib/utils";

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const TabButton = ({ label, active, onClick }: TabButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-2.5 sm:py-3 md:py-3.5 rounded-full transition-all duration-300 font-display tracking-wider text-[10px] xs:text-xs sm:text-sm min-h-[36px] xs:min-h-[40px] touch-manipulation active:scale-95",
        active
          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/50"
          : "bg-white/5 border border-primary/30 text-muted-foreground hover:text-foreground hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
};

export default TabButton;