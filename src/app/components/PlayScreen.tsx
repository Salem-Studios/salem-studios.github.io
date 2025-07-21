import Image from 'next/image';

export default function PlayScreen() {
    return (
        <div className="relative w-[400px] h-[400px]">
            {/* Background image */}
            <Image
                src="/concept_art/backgrounds/flower_field_scaled.png"
                alt="Flower Field"
                fill
                className="object-cover"
                style={{ zIndex: 1 }}
            />
            {/* Character image */}
            <Image
                src="/concept_art/character/peasant1_scaled.png"
                alt="Character"
                width={250}
                height={250}
                className="absolute bottom-4 left-2/3 -translate-x-1/2 z-10"
                style={{ pointerEvents: 'none' }}
            />
        </div>
    );
}