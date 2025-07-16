export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1f0f07] to-[#3e1f13] text-white font-jacquard px-4">
      <h1 className="font-jacquard text-8xl mb-12">Medieval Pomodoro</h1>

      <div className="flex flex-col space-y-6 items-center w-full max-w-xs">
        {['Start', 'Settings', 'Credits'].map((label, index) => (
          <button
            key={index}
            className="w-full text-5xl px-6 py-4 bg-[#462a1f] border-4 border-[#bfa77a] hover:bg-[#654532] transition-all duration-200 shadow-[4px_4px_0_#000]"
          >
            {label}
          </button>
        ))}
      </div>
    </main>

  );
}
