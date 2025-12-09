import { Trophy, Star, Award } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  unlockedAt: string | null;
  icon: string;
}

interface GamificationPanelProps {
  points: number;
  level: number;
  badges: Badge[];
}

export const GamificationPanel = ({ points, level, badges }: GamificationPanelProps) => {
  const unlockedBadges = badges.filter((b) => b.unlockedAt);
  const lockedBadges = badges.filter((b) => !b.unlockedAt);

  return (
    <div className="glass rounded-xl p-4 xs:p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-display font-bold gradient-text">Level {level}</div>
          <div className="text-sm text-muted-foreground">{points} points</div>
        </div>
        <Trophy className="w-12 h-12 text-primary" />
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
          style={{ width: `${(points % 100)}%` }}
        />
      </div>

      <div>
        <h3 className="font-display mb-3 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Badges ({unlockedBadges.length}/{badges.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {unlockedBadges.map((badge) => (
            <div key={badge.id} className="glass rounded-lg p-3 text-center">
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="text-xs font-display">{badge.name}</div>
            </div>
          ))}
          {lockedBadges.map((badge) => (
            <div key={badge.id} className="glass rounded-lg p-3 text-center opacity-50">
              <div className="text-3xl mb-2 grayscale">🔒</div>
              <div className="text-xs font-display">{badge.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};











