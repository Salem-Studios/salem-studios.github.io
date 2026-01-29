"use client";

import Image from "next/image";

type NumberInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export default function NumberInput({
  label,
  value,
  onChange,
  min = 1,
  max = 120,
  step = 1,
}: NumberInputProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const handleInputChange = (raw: string) => {
    if (raw.trim() === "") return;
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) onChange(clamp(Math.trunc(parsed)));
  };

  const inc = () => onChange(clamp(value + step));
  const dec = () => onChange(clamp(value - step));

  return (
    <label className="flex justify-between items-center text-4xl gap-4">
      <span>{label}</span>

      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-16 h-16 text-4xl text-center bg-[#3e2a1e] text-white border border-[#bfa77a] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label={label}
          />
        </div>

        <div className="flex flex-col space-y-1">
          <button
            type="button"
            onClick={inc}
            className="w-8 h-8 bg-[#654532] border border-[#bfa77a] hover:bg-[#7b5b43] shadow-md flex items-center justify-center"
            title="Increase"
            aria-label={`Increase ${label}`}
          >
            <Image
              src="/concept_art/weapons/sword_button_scaled.png"
              alt=""
              width={24}
              height={24}
              className="w-6 h-6 object-contain rotate-180"
            />
          </button>

          <button
            type="button"
            onClick={dec}
            className="w-8 h-8 bg-[#654532] border border-[#bfa77a] hover:bg-[#7b5b43] shadow-md flex items-center justify-center"
            title="Decrease"
            aria-label={`Decrease ${label}`}
          >
            <Image
              src="/concept_art/weapons/sword_button_scaled.png"
              alt=""
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
          </button>
        </div>
      </div>
    </label>
  );
}
