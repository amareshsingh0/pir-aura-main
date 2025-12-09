import { Satellite } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  motionDetected: boolean;
  isOffline: boolean;
  lastDetection: string;
  streakCount: number;
}

const StatusCard = ({ motionDetected, isOffline, lastDetection, streakCount }: StatusCardProps) => {
  const getStatusText = () => {
    if (isOffline) return "OFFLINE";
    return motionDetected ? "MOTION DETECTED" : "No Motion";
  };

  const getStatusClass = () => {
    if (isOffline) return "bg-muted";
    return motionDetected 
      ? "bg-gradient-to-r from-destructive to-red-300 animate-pulse-glow" 
      : "bg-gradient-to-r from-success to-emerald-300";
  };

  return (
    <div className="glass rounded-xl xs:rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-7 lg:p-10 text-center shadow-card mb-4 xs:mb-5 sm:mb-6 md:mb-8 relative overflow-hidden">
      {/* Rotating background effect */}
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,_hsl(var(--primary)/0.1)_0%,_transparent_70%)] animate-rotate-bg pointer-events-none" />
      
      <div className="relative z-10">
        <div className="text-sm xs:text-base sm:text-lg md:text-xl mb-3 xs:mb-4 sm:mb-5 md:mb-6 text-primary flex items-center justify-center gap-1.5 xs:gap-2">
          <Satellite className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="font-display tracking-wider text-xs xs:text-sm sm:text-base">CURRENT STATUS</span>
        </div>
        
        <div
          className={cn(
            "inline-block text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-display font-bold py-2.5 xs:py-3 sm:py-4 md:py-5 px-3 xs:px-4 sm:px-6 md:px-10 lg:px-12 rounded-full w-full max-w-[240px] xs:max-w-[280px] sm:max-w-sm md:max-w-md shadow-2xl transition-all duration-300",
            getStatusClass(),
            "text-white"
          )}
        >
          {getStatusText()}
        </div>
        
        <div className="mt-3 xs:mt-4 sm:mt-5 md:mt-6 text-[10px] xs:text-xs sm:text-sm text-muted-foreground font-body flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-0">
          <span>Last Detection: <span className="text-foreground">{lastDetection}</span></span>
          <span className="hidden xs:inline mx-1.5 xs:mx-2">|</span>
          <span>Current Streak: <span className="text-primary font-bold">{streakCount}</span></span>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;