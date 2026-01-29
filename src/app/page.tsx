"use client";
import { useEffect, useRef, useState } from "react";
import { loadState, saveState, clearState } from "./lib/persist";

import NumberInput from "./components/NumberInput";
import TaskList from "./components/TaskList";
import PlayScreen from "./components/PlayScreen";
import Character from "./components/Character";
import PomodoroTimer from "./components/PomodoroTimer";
import Toolbar from "./components/Toolbar";
import Shop from "./components/Shop";

type Screen = "menu" | "characterSelect" | "play";

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
  const [screen, setScreen] = useState<Screen>("menu");
  const [hasSession, setHasSession] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
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

  const [shopOpen, setShopOpen] = useState(false); // ✅ add
  const openShop = () => setShopOpen(true);        // ✅ add
  const closeShop = () => setShopOpen(false);      // ✅ add

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("playerExp", String(totalExp));
      localStorage.setItem("playerCoins", String(totalCoins));
    }
  }, [totalExp, totalCoins]);

  const { level, expInLevel, expToNext } = getLevelInfo(totalExp);
  const expPct = Math.max(0, Math.min(100, (expInLevel / expToNext) * 100));

  const [muted, setMuted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [selectedCharacter, setSelectedCharacter] = useState<
    (typeof CHARACTERS)[0] | null
  >(null);

  // --------------------------
  // Background music
  // --------------------------
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/theme.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.4;
    audioRef.current = audio;

    // Start after first user interaction
    const resume = () => {
      audioRef.current?.play().catch(() => {});
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);

    return () => {
      audio.pause();
      audioRef.current = null;
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  // Mute bg music
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const toggleMute = () => {
    setMuted((m) => !m);
    audioRef.current?.play().catch(() => {});
  };

  const ensureMusic = () => {
    audioRef.current?.play().catch(() => {});
  };

  // --------------------------
  // Persistance + save system
  // --------------------------
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setMuted(saved.muted);
      setFocusMinutes(saved.durations.focus);
      setBreakMinutes(saved.durations.brk);
      setLongBreakMinutes(saved.durations.long);

      setHasSession(saved.hasSession);
      setScreen(saved.screen);

      if (saved.characterName) {
        const found =
          CHARACTERS.find((c) => c.name === saved.characterName) ?? null;
        setSelectedCharacter(found);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    saveState({
      version: 1,
      screen,
      muted,
      durations: {
        focus: focusMinutes,
        brk: breakMinutes,
        long: longBreakMinutes,
      },
      characterName: selectedCharacter?.name ?? null,
      hasSession,
    });
  }, [
    hydrated,
    screen,
    muted,
    focusMinutes,
    breakMinutes,
    longBreakMinutes,
    selectedCharacter,
    hasSession,
  ]);

  // --------------------------
  // Menu
  // --------------------------
  const startNew = () => {
    ensureMusic();
    setSelectedCharacter(null);
    setHasSession(false);
    setScreen("characterSelect");
  };

  const continueSession = () => {
    ensureMusic();
    if (selectedCharacter) setScreen("play");
    else setScreen("characterSelect");
  };

  const enterPlay = () => {
    ensureMusic();
    setHasSession(true);
    setScreen("play");
  };

  const handleMenuClick = (label: string) => {
    ensureMusic();

    if (label === "Settings") setShowSettings(true);
    else if (label === "New") startNew();
    else if (label === "Continue") continueSession();
    // implement credits later
  };

  // --------------------------
  // COINSSSS WHOAAAA
  // --------------------------
  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const playContentRef = useRef<HTMLDivElement | null>(null);

  const coinIdRef = useRef(0);
  const [coinPops, setCoinPops] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  // Track which task indices have been rewarded to prevent double rewards
  const rewardedTaskIndicesRef = useRef<Set<number>>(new Set());

  const spawnCoinPopNearCharacter = (taskIndex?: number) => {
    // Prevent double rewards for the same task
    if (typeof taskIndex === "number") {
      if (rewardedTaskIndicesRef.current.has(taskIndex)) return;
      rewardedTaskIndicesRef.current.add(taskIndex);
    }

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

  // --------------------------
  // Character Select Screen
  // --------------------------
  if (screen === "characterSelect") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1f0f07] to-[#3e1f13] text-white font-jacquard px-4 relative overflow-hidden">
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          {/* Toolbar */}
          <Toolbar
            muted={muted}
            onToggleMute={toggleMute}
            onMenu={() => setScreen("menu")}
            onSettings={() => setShowSettings(true)}
            showMenuButton={true}
          />

          <div className="w-full bg-[#2c1a12] p-10 border-4 border-[#bfa77a] shadow-2xl flex flex-col items-center">
            <h2 className="text-6xl mb-6 font-jacquard">
              Choose Your Character
            </h2>

            <div className="flex justify-center gap-8 flex-wrap">
              {CHARACTERS.map((char) => (
                <button
                  key={char.name}
                  onClick={() => {
                    setSelectedCharacter(char);
                    if (char.sound) {
                      const voice = new Audio(char.sound);
                      voice.volume = 0.7;
                      voice.play().catch(() => {});
                    }
                    ensureMusic();
                  }}
                  className={`focus:outline-none transition-all border-4 ${
                    selectedCharacter?.name === char.name
                      ? "border-yellow-400 scale-105"
                      : "border-transparent hover:border-[#bfa77a]"
                  }`}
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
                onClick={enterPlay}
              >
                Continue
              </button>
            )}
          </div>
        </div>

        {/* Settings are accessible here too */}
        {showSettings && (
          <>
            <div
              className="absolute inset-0 bg-brown bg-opacity-40 backdrop-blur-sm z-10"
              onClick={() => setShowSettings(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Settings"
              className="absolute top-1/2 left-1/2 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-[#2c1a12] p-8 border-4 border-[#bfa77a] shadow-2xl z-20"
            >
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
      </main>
    );
  }

  // --------------------------
  // Menu / Play
  // --------------------------
  const menuButtons = hasSession
    ? ["Continue", "New", "Settings", "Credits"]
    : ["New", "Settings", "Credits"];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1f0f07] to-[#3e1f13] text-white font-jacquard px-4 relative overflow-hidden">
      {/* Toolbar */}
      <Toolbar
        muted={muted}
        onToggleMute={toggleMute}
        onMenu={() => setScreen("menu")}
        onSettings={() => setShowSettings(true)}
        showMenuButton={true}
      />

      {screen === "play" ? (
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="w-100 bg-[#2c1a12] shadow-2xl flex flex-col items-center">
            {/* below is the strip above the playscreen that shows the settings -oyku */}
            {/* <div className="text-2xl text-[#bfa77a] mb-2 mt-3">
              Focus {focusMinutes}m • Break {breakMinutes}m • Long{" "}
              {longBreakMinutes}m
            </div> */}

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

            <div
              ref={playAreaRef}
              className="relative w-full flex justify-center"
            >
              <div ref={playContentRef} className="relative inline-block">
                <PlayScreen character={selectedCharacter ?? undefined} />
                <button
                  type="button"
                  onClick={openShop}
                  aria-label="Open shop"
                  className="absolute bg-transparent border-0 p-0"
                  style={{
                    left: "74%",
                    top: "44%",
                    width: "25%",
                    height: "23%",
                    zIndex: 50,
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>
          </div>
          { shopOpen && (
            <Shop
              title="Shop"
              coins={totalCoins}
              onClose={closeShop}
              items={[
                {
                  id: "char_karl_hat",
                  name: "Karl's Hat",
                  description: "A sturdy straw hat worn by Karl.",
                  cost: 100,
                },
                {
                  id: "char_susan_necklace",
                  name: "Susan's Necklace",
                  description: "A beautiful necklace worn by Susan.",
                  cost: 150,
                },
                {
                  id: "bg_forest",
                  name: "Forest Background",
                  description: "A serene forest backdrop for your character.",
                  cost: 200,
                },
              ]} 
              open={true}              
              />
            )}


          <div className="w-100 bg-[#2c1a12] p-8 border-4 border-[#bfa77a] shadow-2xl flex flex-col items-center">
            <TaskList onTaskCompleted={spawnCoinPopNearCharacter} />
          </div>

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
        </div>
      ) : (
        <>
          {/* Menu */}
          <div
            className={`flex flex-col items-center w-full transition-all duration-300 ${
              showSettings ? "blur-md scale-[0.97]" : ""
            }`}
          >
            <h1 className="font-jacquard text-8xl mb-12">Medieval Pomodoro</h1>
            <div className="flex flex-col space-y-6 items-center w-full max-w-xs">
              {menuButtons.map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuClick(label)}
                  className="w-full text-5xl px-6 py-4 bg-[#462a1f] border-4 border-[#bfa77a] hover:bg-[#654532] transition-all duration-200 shadow-[4px_4px_0_#000]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Settings modal (available on menu + play) */}
      {showSettings && (
        <>
          <div
            className="absolute inset-0 bg-brown bg-opacity-40 backdrop-blur-sm z-10"
            onClick={() => setShowSettings(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            className="absolute top-1/2 left-1/2 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-[#2c1a12] p-8 border-4 border-[#bfa77a] shadow-2xl z-20"
          >
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

      {/* Coin pops overlay (near character) */}
      {coinPops.map((c) => (
        <span
          key={c.id}
          className="coin-pop pointer-events-none select-none font-bold"
          style={{ position: "fixed", left: c.x, top: c.y, zIndex: 60 }}
        >
          <span className="block text-yellow-300">
            +{COINS_PER_TASK}{" "}
            <span role="img" aria-label="coin">
              🪙
            </span>
          </span>
          <span className="block text-yellow-300 font-vt323">+{EXP_PER_TASK} EXP</span>
        </span>
      ))}

      <style jsx global>{`
        .coin-pop {
          animation: coin-pop 0.9s cubic-bezier(0.23, 1.12, 0.62, 0.99);
          text-shadow: 0 2px 0 rgba(0, 0, 0, 0.6);
          font-size: 22px;
          line-height: 1.05;
          white-space: nowrap;
        }
        @keyframes coin-pop {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.7);
          }
          20% {
            opacity: 1;
            transform: translateY(-10px) scale(1.2);
          }
          60% {
            opacity: 1;
            transform: translateY(-30px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(0.7);
          }
        }
      `}</style>
    </main>
  );
}
