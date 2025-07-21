import { useEffect, useRef, useState } from 'react';

interface CharacterProps {
  name: string;
  charClass: string;
  spriteSrc: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps?: number;
}

export default function Character({
  name,
  charClass,
  spriteSrc,
  frameWidth,
  frameHeight,
  frameCount,
  fps = 8,
}: CharacterProps) {
  const [frame, setFrame] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFrame((prev) => (prev + 1) % frameCount);
    }, 1000 / fps);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [frameCount, fps]);

  return (
    <div className="flex flex-col items-center bg-[#3e2a1e] p-4 border-4 border-[#bfa77a] shadow-md min-w-[200px]">
      <div className="text-2xl">{name}</div>
      <div className="text-xl text-[#bfa77a]">{charClass}</div>
      <div
        style={{
          width: frameWidth * 2,
          height: frameHeight * 2,
          backgroundImage: `url(${spriteSrc})`,
          backgroundPosition: `-${frame * frameWidth * 2}px 0px`,
          backgroundSize: `${frameWidth * frameCount * 2}px ${frameHeight * 2}px`,
          imageRendering: 'pixelated',
          position: 'relative',
          left: '15%',
          margin: '0 auto',
        }}
        className="mb-2"
      />
    </div>
  );
}