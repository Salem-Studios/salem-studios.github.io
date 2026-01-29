import { useEffect, useRef, useState } from "react";

export function useSpriteAnimation(frameCount: number, fps: number = 8) {
  const [frame, setFrame] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const accMsRef = useRef<number>(0);

  useEffect(() => {
    // guard
    const safeFrameCount = Math.max(1, frameCount);
    const safeFps = Math.max(1, fps);
    const frameMs = 1000 / safeFps;

    // reset
    setFrame(0);
    lastTsRef.current = 0;
    accMsRef.current = 0;

    const loop = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      accMsRef.current += dt;

      if (accMsRef.current >= frameMs) {
        const steps = Math.floor(accMsRef.current / frameMs);
        accMsRef.current -= steps * frameMs;
        setFrame((prev) => (prev + steps) % safeFrameCount);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [frameCount, fps]);

  return frame;
}
