import Image from "next/image";
import { useSpriteAnimation } from "../hooks/useSpriteAnimation";

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
  const frame = useSpriteAnimation(
    character?.frameCount ?? 1,
    character?.fps ?? 8,
  );

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
      <Image
        src= "/concept_art/backgrounds/tavern_scaled.png"
        alt="Overlay"
        fill
        className="object-cover border-r-4 border-l-4 border-t-4 border-[#bfa77a]"
        style={{ zIndex: 15 }}
      />

      {character && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[90%] flex items-center justify-center gap-2 text-center">
          <span className="text-3xl text-[#2c1a12] drop-shadow-lg">
            {character.name}
          </span>
          {character.charClass && (
            <span className="text-3xl text-[#bfa77a] drop-shadow-lg">
              ({character.charClass})
            </span>
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
            backgroundSize: `${character.frameWidth * character.frameCount * 3}px ${
              character.frameHeight * 3
            }px`,
            imageRendering: "pixelated",
            position: "relative",
            margin: "0 auto",
            bottom: "-50%",
            left: "20%",
          }}
        />
      )}
    </div>
  );
}
