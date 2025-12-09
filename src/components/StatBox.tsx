import { LucideIcon } from "lucide-react";

interface StatBoxProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
}

const StatBox = ({ icon: Icon, title, value }: StatBoxProps) => {
  return (
    <div className="glass rounded-lg xs:rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4 md:p-5 lg:p-6 text-center transition-all duration-400 hover:-translate-y-1 xs:hover:-translate-y-2 hover:scale-[1.02] xs:hover:scale-[1.03] hover:glow-primary hover:border-primary group active:scale-95">
      <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 gradient-icon transition-transform duration-300 group-hover:scale-110">
        <Icon className="mx-auto w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
      </div>
      <div className="text-muted-foreground text-[9px] xs:text-[10px] sm:text-xs md:text-sm uppercase tracking-wider mb-1 xs:mb-1.5 sm:mb-2 line-clamp-2 leading-tight">
        {title}
      </div>
      <div className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-foreground break-words">
        {value}
      </div>
    </div>
  );
};

export default StatBox;
