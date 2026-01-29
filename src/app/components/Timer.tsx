"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type TimerProps = {
	/** Starting duration in seconds. Defaults to 25 minutes. */
	initialSeconds?: number;
	/** Start immediately on mount (and when initialSeconds changes). */
	autoStart?: boolean;
	/** Optional label shown above the time readout. */
	title?: string;
	/** Called once when the timer reaches 0. */
	onComplete?: () => void;
};

function pad2(value: number) {
	return String(value).padStart(2, "0");
}

function formatDuration(totalSeconds: number) {
	const clamped = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(clamped / 3600);
	const minutes = Math.floor((clamped % 3600) / 60);
	const seconds = clamped % 60;

	if (hours > 0) return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
	return `${pad2(minutes)}:${pad2(seconds)}`;
}

export default function Timer({
	initialSeconds = 25 * 60,
	autoStart = true,
	title = "Timer",
	onComplete,
}: TimerProps) {
	const initial = useMemo(() => Math.max(0, Math.floor(initialSeconds)), [initialSeconds]);

	const [secondsLeft, setSecondsLeft] = useState(initial);
	const [isRunning, setIsRunning] = useState(autoStart);

	const onCompleteRef = useRef(onComplete);
	const completedRef = useRef(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	useEffect(() => {
		setSecondsLeft(initial);
		setIsRunning(autoStart);
		completedRef.current = false;
	}, [initial, autoStart]);

	useEffect(() => {
		if (!isRunning) return;

		intervalRef.current = setInterval(() => {
			setSecondsLeft((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isRunning]);

	useEffect(() => {
		if (secondsLeft !== 0) return;
		if (completedRef.current) return;

		completedRef.current = true;
		setIsRunning(false);
		onCompleteRef.current?.();
	}, [secondsLeft]);

	const start = () => {
		if (secondsLeft === 0) {
			completedRef.current = false;
			setSecondsLeft(initial);
		}
		setIsRunning(true);
	};

	const pause = () => setIsRunning(false);

	const reset = () => {
		completedRef.current = false;
		setIsRunning(false);
		setSecondsLeft(initial);
	};

	return (
		<section className="w-full flex flex-col items-center gap-4">
			<h2 className="text-5xl">{title}</h2>

			<div
				className="w-full max-w-md bg-[#3e2a1e] border-4 border-[#bfa77a] shadow-[4px_4px_0_#000] px-6 py-6 text-center"
				role="timer"
				aria-live="polite"
			>
				<div className="font-vt323 text-7xl tracking-wider tabular-nums">
					{formatDuration(secondsLeft)}
				</div>
				<div className="mt-1 text-[#bfa77a] text-xl font-vt323">
					{isRunning ? "Running" : secondsLeft === 0 ? "Complete" : "Paused"}
				</div>
			</div>

			<div className="flex gap-3">
				{isRunning ? (
					<button
						type="button"
						onClick={pause}
						className="px-3 py-1 text-xl bg-[#462a1f] border-4 border-[#bfa77a] font-vt323 hover:bg-[#654532] transition-all shadow-[3px_3px_0_#000]"
						aria-label="Pause timer"
					>
						Pause
					</button>
				) : (
					<button
						type="button"
						onClick={start}
						className="px-3 py-1 text-xl bg-[#654532] border-4 border-[#bfa77a] font-vt323 hover:bg-[#7b5b43] transition-all shadow-[3px_3px_0_#000]"
						aria-label="Start timer"
					>
						Start
					</button>
				)}

				<button
					type="button"
					onClick={reset}
					className="px-3 py-1 text-xl bg-[#462a1f] border-4 border-[#bfa77a] font-vt323 hover:bg-[#654532] transition-all shadow-[3px_3px_0_#000]"
					aria-label="Reset timer"
				>
					Reset
				</button>
			</div>
		</section>
	);
}
