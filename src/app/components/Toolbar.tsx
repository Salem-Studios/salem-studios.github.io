"use client";

type ToolbarProps = {
  muted: boolean;
  onToggleMute: () => void;
  onMenu: () => void;
  onSettings: () => void;
  // maybe? hide the menu button when already on menu
  showMenuButton?: boolean;
};

export default function Toolbar({
  muted,
  onToggleMute,
  onMenu,
  onSettings,
  showMenuButton = true,
}: ToolbarProps) {
  const btnClass =
    "flex items-center justify-center w-14 h-14 text-3xl bg-[#462a1f] border-4 border-[#bfa77a] shadow-[3px_3px_0_#000] hover:bg-[#654532] active:translate-y-px transition-all";

  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      {showMenuButton && (
        <button
          onClick={onMenu}
          aria-label="Return to menu"
          title="Menu"
          className={btnClass}
        >
          🏰
        </button>
      )}

      <button
        onClick={onSettings}
        aria-label="Open settings"
        title="Settings"
        className={btnClass}
      >
        ⚙️
      </button>

      <button
        onClick={onToggleMute}
        aria-label={muted ? "Unmute music" : "Mute music"}
        title={muted ? "Unmute" : "Mute"}
        className={btnClass}
      >
        {muted ? "🔇" : "🎶"}
      </button>
    </div>
  );
}
