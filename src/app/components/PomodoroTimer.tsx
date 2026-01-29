"use client";

import { useMemo, useState } from "react";
import Timer from "./Timer";

type Phase = "focus" | "shortBreak" | "longBreak";

export type PomodoroTimerProps = {
	focusMinutes?: number;
	shortBreakMinutes?: number;
	longBreakMinutes?: number;
	/** Every Nth break becomes a long break (e.g. 3 => every 3rd break). */
	longBreakEvery?: number;
};

export default function PomodoroTimer({
	focusMinutes = 25,
	shortBreakMinutes = 5,
	longBreakMinutes = 15,
	longBreakEvery = 3,
}: PomodoroTimerProps) {
	const [phase, setPhase] = useState<Phase>("focus");
	const [breakCount, setBreakCount] = useState(0);

	const durations = useMemo(() => {
		const toSeconds = (minutes: number) => Math.max(0, Math.floor(minutes)) * 60;
		return {
			focus: toSeconds(focusMinutes),
			shortBreak: toSeconds(shortBreakMinutes),
			longBreak: toSeconds(longBreakMinutes),
		};
	}, [focusMinutes, shortBreakMinutes, longBreakMinutes]);

	const title =
		phase === "focus" ? "Focus" : phase === "shortBreak" ? "Break" : "Long Break";

	const handleComplete = () => {
		if (phase === "focus") {
			setBreakCount((prev) => {
				const next = prev + 1;
				const every = Math.max(1, Math.floor(longBreakEvery));
				const isLong = next % every === 0;
				setPhase(isLong ? "longBreak" : "shortBreak");
				return next;
			});
			return;
		}

		// Finished a break -> back to focus
		setPhase("focus");
	};

	const resetCycle = () => {
		setBreakCount(0);
		setPhase("focus");
	};


	return (
		<div className="w-full flex flex-col items-center gap-3">
			<Timer
				title={title}
				initialSeconds={durations[phase]}
				autoStart
				onComplete={handleComplete}
			/>
			<button
				type="button"
				onClick={resetCycle}
				className="px-3 py-1 text-xl bg-[#462a1f] border-4 font-vt323 border-[#bfa77a] hover:bg-[#654532] transition-all shadow-[3px_3px_0_#000]"
				aria-label="Reset pomodoro cycle"
			>
				Reset Cycle
			</button>

		</div>
	);
}
