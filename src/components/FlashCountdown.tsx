import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface FlashCountdownProps {
  endsAt: string;
  label?: string;
}

export const FlashCountdown = ({ endsAt, label }: FlashCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return { h, m, s, expired: false };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.expired) return null;

  return (
    <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wide">
      <Zap className="w-3.5 h-3.5" />
      {label && <span>{label}</span>}
      <span className="font-mono">
        {String(timeLeft.h).padStart(2, "0")}:{String(timeLeft.m).padStart(2, "0")}:{String(timeLeft.s).padStart(2, "0")}
      </span>
    </div>
  );
};
