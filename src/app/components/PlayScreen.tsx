import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type Character = {
    spriteSrc: string;
    name: string;
    charClass?: string;
    frameWidth: number;
    frameHeight: number;
    frameCount: number;
    fps?: number;
};

interface PlayScreenProps {
    character?: Character;
}

export default function PlayScreen({ character }: PlayScreenProps) {
    // Sprite animation state
    const [frame, setFrame] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!character) return;
        intervalRef.current = setInterval(() => {
            setFrame((prev) => (prev + 1) % character.frameCount);
        }, 1000 / (character.fps || 8));
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [character]);

    return (
        <div className="relative w-[400px] h-[400px] overflow-hidden">
            {/* Background image */}
            <Image
                src="/concept_art/backgrounds/flower_field_scaled.png"
                alt="Flower Field"
                fill
                className="object-cover border-r-4 border-l-4 border-t-4 border-[#bfa77a]"
                style={{ zIndex: 1 }}
            />
            {character && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[90%] flex items-center justify-center gap-2 text-center">
                    <span className="text-3xl text-[#2c1a12] drop-shadow-lg">{character.name}</span>
                    {character.charClass && (
                        <span className="text-3xl text-[#bfa77a] drop-shadow-lg">({character.charClass})</span>
                    )}
                </div>
            )}
            {/* Character sprite animation */}
            {character && (
                <div
                    className="absolute z-10"
                    style={{
                        width: character.frameWidth * 3,
                        height: character.frameHeight * 3,
                        backgroundImage: `url(${character.spriteSrc})`,
                        backgroundPosition: `-${frame * character.frameWidth * 3}px 0px`,
                        backgroundSize: `${character.frameWidth * character.frameCount * 3}px ${character.frameHeight * 3}px`,
                        imageRendering: 'pixelated',
                        position: 'relative',
                        margin: '0 auto',
                        bottom: '-50%',
                        left: '20%',
                    }}
                />
            )}
        </div>
    );
}