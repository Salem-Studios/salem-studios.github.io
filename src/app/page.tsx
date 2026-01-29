"use client";
import { useEffect, useRef, useState } from "react";
import NumberInput from "./components/NumberInput";
import TaskList from "./components/TaskList";
import PlayScreen from "./components/PlayScreen";
import Character from "./components/Character";
import PomodoroTimer from './components/PomodoroTimer';

const CHARACTERS = [
  {
    name: "Karl",
    charClass: "Peasant",
    spriteSrc: "/concept_art/character/Man/Man_idle.png",
    frameWidth: 48,
    frameHeight: 48,
    frameCount: 4,
    fps: 10,
    sound: "/audio/k_peasant.wav",
  },
  {
    name: "Susan",
    charClass: "Peasant",
    spriteSrc: "/concept_art/character/Woman/Woman_idle.png",
    frameWidth: 48,
    frameHeight: 48,
    frameCount: 4,
    fps: 10,
    sound: "/audio/s_peasant.wav",
  },
];

const EXP_PER_TASK = 10;
const COINS_PER_TASK = 5;

function getLevelInfo(totalExp: number) {
  let level = 1;
  let expLeft = Math.max(0, Math.floor(totalExp));
  let expToNext = 50; // base requirement
  while (expLeft >= expToNext) {
    expLeft -= expToNext;
    level += 1;
    expToNext = 50 + (level - 1) * 25; // grows each level
  }
  return { level, expInLevel: expLeft, expToNext };
}

export default function Home() {
  const [muted, setMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [started, setStarted] = useState(false);
  const [characterSelected, setCharacterSelected] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<
    (typeof CHARACTERS)[0] | null
  >(null);

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);

  const [totalExp, setTotalExp] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem("playerExp");
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  });

  const [totalCoins, setTotalCoins] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem("playerCoins");
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("playerExp", String(totalExp));
      localStorage.setItem("playerCoins", String(totalCoins));
    }
  }, [totalExp, totalCoins]);

  const { level, expInLevel, expToNext } = getLevelInfo(totalExp);
  const expPct = Math.max(0, Math.min(100, (expInLevel / expToNext) * 100));

  // Background music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio("/audio/theme.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.4;
    audioRef.current = audio;

    const savedMuted =
      typeof window !== "undefined"
        ? localStorage.getItem("bgmMuted") === "1"
        : false;
    setMuted(savedMuted);
    audio.muted = savedMuted;

    // Start after first user interaction
    const resume = () => {
      audioRef.current?.play().catch(() => { });
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);

    return () => {
      // audio.pause();
      audioRef.current = null;
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  // Mute bg music
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("bgmMuted", muted ? "1" : "0");
    }
  }, [muted]);

  const toggleMute = () => {
    setMuted((m) => !m);
    audioRef.current?.play().catch(() => { });
  };

  const ensureMusic = () => {
    audioRef.current?.play().catch(() => { });
  };

  const handleButtonClick = (label: string) => {
    ensureMusic();

    if (label === "Settings") {
      setShowSettings(true);
    } else if (label === "Start") {
      const startSound = new Audio("/audio/start.wav");
      startSound.volume = 0.6;
      startSound.play().catch(() => { });

      setStarted(true);
    }
  };

  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const playContentRef = useRef<HTMLDivElement | null>(null);
  const [playWidth, setPlayWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = playContentRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const update = () => setPlayWidth(el.getBoundingClientRect().width);
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, [started, characterSelected, selectedCharacter]);

  const coinIdRef = useRef(0);
  const [coinPops, setCoinPops] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const spawnCoinPopNearCharacter = () => {
    // award EXP + coins on completion
    setTotalExp((e) => e + EXP_PER_TASK);
    setTotalCoins((c) => c + COINS_PER_TASK);

    const rect = playAreaRef.current?.getBoundingClientRect();
    const id = ++coinIdRef.current;

    // Position near the character area (tweak multipliers if you want)
    const x = rect ? rect.left + rect.width * 0.75 : window.innerWidth * 0.7;
    const y = rect ? rect.top + rect.height * 0.25 : window.innerHeight * 0.3;

    setCoinPops((p) => [...p, { id, x, y }]);
    window.setTimeout(() => {
      setCoinPops((p) => p.filter((c) => c.id !== id));
    }, 900);
  };

  if (started && !characterSelected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1f0f07] to-[#3e1f13] text-white font-jacquard px-4 relative overflow-hidden">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          <div className="w-full bg-[#2c1a12] p-10 border-4 border-[#bfa77a] shadow-2xl flex flex-col items-center mb-8">
            <h2 className="text-6xl mb-6 font-jacquard">
              Choose Your Character
            </h2>
            <div className="flex justify-center gap-8">
              {CHARACTERS.map((char) => (
                <button
                  key={char.name}
                  onClick={() => {
                    setSelectedCharacter(char);
                    if (char.sound) {
                      const voice = new Audio(char.sound);
                      voice.volume = 0.7;
                      voice.play().catch(() => { });
                    }
                    ensureMusic();
                  }}
                  className={`focus:outline-none transition-all border-4 ${selectedCharacter?.name === char.name
                    ? "border-yellow-400 scale-105"
                    : "border-transparent hover:border-[#bfa77a]"
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
                className="mt-8 px-8 py-4 text-4xl bg-[#654532] border-4 border-[#bfa77a] hover:bg-[#7b5b43] transition-all font-jacquard"
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
      {/* Music toggle button */}
      <button
        onClick={toggleMute}
        aria-label={muted ? "Unmute music" : "Mute music"}
        className="fixed top-4 left-4 z-50 flex items-center justify-center px-1 py-1 text-2xl bg-[#462a1f] border-4 border-[#bfa77a] shadow-[3px_3px_0_#000] hover:bg-[#654532] active:translate-y-px transition-all"
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : "🎶"}
      </button>

      {/* Show task list if started */}
      {started && characterSelected ? (
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="w-100 bg-[#2c1a12] shadow-2xl flex flex-col items-center">
            {/* below is the strip above the playscreen that shows the settings -oyku */}
            {/* <div className="text-2xl text-[#bfa77a] mb-2 mt-3">
              Focus {focusMinutes}m • Break {breakMinutes}m • Long{" "}
              {longBreakMinutes}m
            </div> */}

            {/* Level HUD (above PlayScreen) */}
            <div className="w-full px-4 pt-3 pb-2">
              <div className="mx-auto">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-lg font-vt323 text-[#f3d08a] drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                    Lvl {level} • {expInLevel}/{expToNext} EXP
                  </div>
                  <div className="text-lg font-vt323 text-[#f3d08a] drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                    Coins: {totalCoins}
                  </div>
                </div>

                <div className="mt-1 h-2 w-full bg-black/40">
                  <div
                    className="h-2 bg-[#f3d08a]"
                    style={{ width: `${expPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div ref={playAreaRef} className="relative w-full flex justify-center">
              <div ref={playContentRef} className="inline-block">
                <PlayScreen character={selectedCharacter ?? undefined} />
              </div>
            </div>
          </div>

          <div className="w-100 bg-[#2c1a12] p-8 border-4 border-[#bfa77a] shadow-2xl flex flex-col items-center">
            <TaskList onTaskCompleted={spawnCoinPopNearCharacter} />
          </div>
        </div>
      ) : (
        <>
          {/* Background blur and scale when settings are open */}
          <div
            className={`flex flex-col items-center w-full transition-all duration-300 ${showSettings ? "blur-md scale-[0.97]" : ""
              }`}
          >
            <h1 className="font-jacquard text-8xl mb-12">Medieval Pomodoro</h1>
            <div className="flex flex-col space-y-6 items-center w-full max-w-xs">
              {["Start", "Settings", "Credits"].map((label, index) => (
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

          {/* Settings */}
          {showSettings && (
            <>
              {/* Backdrop */}
              <div className="absolute inset-0 bg-brown bg-opacity-40 backdrop-blur-sm z-10" />

              {/* Modal panel */}
              <div className="absolute top-1/2 left-1/2 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-[#2c1a12] p-8 border-4 border-[#bfa77a] shadow-2xl z-20">
                <h2 className="text-7xl mb-5 text-center">Settings</h2>
                <div className="flex flex-col space-y-4">
                  <NumberInput
                    label="Focus Duration (min):"
                    value={focusMinutes}
                    onChange={setFocusMinutes}
                    min={1}
                    max={180}
                  />

                  <NumberInput
                    label="Break Duration (min):"
                    value={breakMinutes}
                    onChange={setBreakMinutes}
                    min={1}
                    max={60}
                  />

                  <NumberInput
                    label="Long Break Duration (min):"
                    value={longBreakMinutes}
                    onChange={setLongBreakMinutes}
                    min={1}
                    max={120}
                  />
                </div>

                <button
                  onClick={() => setShowSettings(false)}
                  className="mt-8 w-full text-4xl px-4 py-3 bg-[#462a1f] border-4 border-[#bfa77a] hover:bg-[#654532] transition-all"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </>
      )}
      {/* Floating PomodoroTimer on the right side */}
      {started && characterSelected && (
        <div
          className="fixed top-8 right-8 z-40 bg-transparent shadow-none border-none"
          style={{ minWidth: 220 }}
        >
          <PomodoroTimer
            focusMinutes={focusMinutes}
            shortBreakMinutes={breakMinutes}
            longBreakMinutes={longBreakMinutes}
            longBreakEvery={3}
          />
        </div>
      )}
      {/* Coin/EXP pops overlay (near character) */}
      {coinPops.map((c) => (
        <span
          key={c.id}
          className="coin-pop pointer-events-none select-none font-bold"
          style={{ position: "fixed", left: c.x, top: c.y, zIndex: 60 }}
        >
          <span className="block text-yellow-300">
            +{COINS_PER_TASK} <span role="img" aria-label="coin">🪙</span>
          </span>
          <span className="block text-[#f3d08a]">+{EXP_PER_TASK} EXP</span>
        </span>
      ))}

      <style jsx global>{`
        .coin-pop {
          animation: coin-pop 0.9s cubic-bezier(.23,1.12,.62,.99);
          text-shadow: 0 2px 0 rgba(0,0,0,0.6);
          font-size: 22px;
          line-height: 1.05;
          white-space: nowrap;
        }
        @keyframes coin-pop {
          0% { opacity: 0; transform: translateY(0) scale(0.7); }
          20% { opacity: 1; transform: translateY(-10px) scale(1.2); }
          60% { opacity: 1; transform: translateY(-30px) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(0.7); }
        }
      `}</style>
    </main>
  );
}
