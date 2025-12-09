import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { speak } from "./useVoiceCommands";

interface Badge {
  id: string;
  name: string;
  description: string;
  unlockedAt: string | null;
  icon: string;
}

interface GamificationData {
  points: number;
  level: number;
  streak: number;
  badges: Badge[];
  achievements: string[];
}

const STORAGE_KEY = "pirGamification";

const BADGES: Badge[] = [
  { id: "first", name: "First Motion", description: "Detected your first motion", icon: "🎯", unlockedAt: null },
  { id: "streak5", name: "Hot Streak", description: "5 motions in a row", icon: "🔥", unlockedAt: null },
  { id: "streak10", name: "On Fire", description: "10 motions in a row", icon: "⚡", unlockedAt: null },
  { id: "daily50", name: "Busy Day", description: "50 motions in one day", icon: "📊", unlockedAt: null },
  { id: "weekly100", name: "Motion Master", description: "100 motions in a week", icon: "👑", unlockedAt: null },
  { id: "nightowl", name: "Night Owl", description: "Motion detected at night", icon: "🦉", unlockedAt: null },
];

export const useGamification = (motionCount: number, streakCount: number) => {
  const [data, setData] = useState<GamificationData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to default
      }
    }
    return {
      points: 0,
      level: 1,
      streak: 0,
      badges: BADGES.map((b) => ({ ...b })),
      achievements: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addPoints = useCallback((amount: number) => {
    setData((prev) => {
      const newPoints = prev.points + amount;
      const newLevel = Math.floor(newPoints / 100) + 1;
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        speak(`Level up! You are now level ${newLevel}`);
      }

      return {
        ...prev,
        points: newPoints,
        level: newLevel,
      };
    });
  }, []);

  const checkBadges = useCallback((motionCount: number, streakCount: number) => {
    setData((prev) => {
      const newBadges = [...prev.badges];
      let unlocked = false;

      // First motion badge
      if (motionCount === 1 && !newBadges.find((b) => b.id === "first")?.unlockedAt) {
        const badge = newBadges.find((b) => b.id === "first");
        if (badge) {
          badge.unlockedAt = new Date().toISOString();
          unlocked = true;
        }
      }

      // Streak badges
      if (streakCount >= 5 && !newBadges.find((b) => b.id === "streak5")?.unlockedAt) {
        const badge = newBadges.find((b) => b.id === "streak5");
        if (badge) {
          badge.unlockedAt = new Date().toISOString();
          unlocked = true;
        }
      }

      if (streakCount >= 10 && !newBadges.find((b) => b.id === "streak10")?.unlockedAt) {
        const badge = newBadges.find((b) => b.id === "streak10");
        if (badge) {
          badge.unlockedAt = new Date().toISOString();
          unlocked = true;
        }
      }

      if (unlocked) {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }

      return {
        ...prev,
        badges: newBadges,
      };
    });
  }, []);

  useEffect(() => {
    if (motionCount > 0) {
      addPoints(10);
      checkBadges(motionCount, streakCount);
    }
  }, [motionCount, streakCount, addPoints, checkBadges]);

  return { data, addPoints };
};

