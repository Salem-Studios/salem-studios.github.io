'use client';
import { useState } from 'react';
import NumberInput from './components/NumberInput';
import TaskList from './components/TaskList';
import PlayScreen from './components/PlayScreen';
import Character from './components/Character';

const CHARACTERS = [
  {
    name: 'Karl',
    charClass: 'Peasant',
    spriteSrc: '/concept_art/character/Man/Man_idle.png',
    frameWidth: 48,
    frameHeight: 48,
    frameCount: 4,
    fps: 10,
  },
  {
    name: 'Susan',
    charClass: 'Peasant',
    spriteSrc: '/concept_art/character/Woman/Woman_idle.png',
    frameWidth: 48,
    frameHeight: 48,
    frameCount: 4,
    fps: 10,
  }
];


export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [started, setStarted] = useState(false);
  const [characterSelected, setCharacterSelected] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<typeof CHARACTERS[0] | null>(null);

  const handleButtonClick = (label: string) => {
    if (label === 'Settings') {
      setShowSettings(true);
    } else if (label === 'Start') {
      setStarted(true);
    }
  };

  if (started && !characterSelected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1f0f07] to-[#3e1f13] text-white font-jacquard px-4 relative overflow-hidden">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          <div className="w-full bg-[#2c1a12] p-10 border-4 border-[#bfa77a] shadow-2xl flex flex-col items-center mb-8">
            <h2 className="text-4xl mb-4 font-jacquard">Choose Your Character</h2>
            <div className="flex justify-center gap-8">
              {CHARACTERS.map((char) => (
                <button
                  key={char.name}
                  onClick={() => setSelectedCharacter(char)}
                  className={`focus:outline-none transition-all border-4 ${selectedCharacter?.name === char.name
                      ? 'border-yellow-400 scale-105'
                      : 'border-transparent hover:border-[#bfa77a]'
                    }`}
                  tabIndex={0}
                >
                  <Character
                    name={char.name}
                    charClass={char.charClass}
                    spriteSrc={char.spriteSrc}
                    frameWidth={char.frameWidth}
                    frameHeight={char.frameHeight}
                    frameCount={char.frameCount}
                    fps={char.fps}
                  />
                </button>
              ))}
            </div>
            {selectedCharacter && (
              <button
                className="mt-8 px-8 py-4 text-3xl bg-[#654532] border-4 border-[#bfa77a] hover:bg-[#7b5b43] transition-all font-jacquard"
                onClick={() => setCharacterSelected(true)}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1f0f07] to-[#3e1f13] text-white font-jacquard px-4 relative overflow-hidden">
      {/* Show task list if started */}
      {started && characterSelected ? (
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="w-100 bg-[#2c1a12] shadow-2xl flex flex-col items-center">
            <PlayScreen character={selectedCharacter ?? undefined} />
          </div>
          <div className="w-100 bg-[#2c1a12] p-8 border-4 border-[#bfa77a] shadow-2xl flex flex-col items-center">
            <TaskList />
          </div>
        </div>
      ) : (
        <>
          {/* Background blur and scale when settings are open */}
          <div
            className={`flex flex-col items-center w-full transition-all duration-300 ${showSettings ? 'blur-md scale-[0.97]' : ''
              }`}
          >
            <h1 className="font-jacquard text-8xl mb-12">Medieval Pomodoro</h1>

            <div className="flex flex-col space-y-6 items-center w-full max-w-xs">
              {['Start', 'Settings', 'Credits'].map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(label)}
                  className="w-full text-5xl px-6 py-4 bg-[#462a1f] border-4 border-[#bfa77a] hover:bg-[#654532] transition-all duration-200 shadow-[4px_4px_0_#000]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <>
              {/* Backdrop */}
              <div className="absolute inset-0 bg-brown bg-opacity-40 backdrop-blur-sm z-10" />

              {/* Modal panel */}
              <div className="absolute top-1/2 left-1/2 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-[#2c1a12] p-8 border-4 border-[#bfa77a] shadow-2xl z-20">
                <h2 className="text-6xl mb-6 text-center">Settings</h2>

                <div className="flex flex-col space-y-4">
                  <NumberInput label="Focus Duration (min):" defaultValue={25} />
                  <NumberInput label="Break Duration (min):" defaultValue={5} />
                  <NumberInput label="Long Break Duration (min):" defaultValue={15} />
                </div>


                <button
                  onClick={() => setShowSettings(false)}
                  className="mt-8 w-full text-3xl px-4 py-3 bg-[#462a1f] border-4 border-[#bfa77a] hover:bg-[#654532] transition-all"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
