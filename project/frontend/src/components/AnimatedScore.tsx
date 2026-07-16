"use client";

import { useEffect, useState } from "react";

interface AnimatedScoreProps {
  score: number;
  className?: string;
}

export function AnimatedScore({ score, className = "" }: AnimatedScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    const animationFrame = window.requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        setDisplayScore(score);
        return;
      }

      setDisplayScore(0);
      let frame = 0;
      const totalFrames = 24;
      timer = window.setInterval(() => {
        frame += 1;
        setDisplayScore(Math.round((score * frame) / totalFrames));
        if (frame >= totalFrames) {
          window.clearInterval(timer);
          setDisplayScore(score);
        }
      }, 30);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [score]);

  return <span className={className}>{displayScore}</span>;
}
