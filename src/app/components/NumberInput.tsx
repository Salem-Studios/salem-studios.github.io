'use client';
import { useState } from 'react';

export default function NumberInput({
    label,
    defaultValue,
}: {
    label: string;
    defaultValue: number;
}) {
    const [value, setValue] = useState(defaultValue);

    const handleChange = (newVal: number) => {
        if (newVal >= 0) setValue(newVal);
    };

    return (
        <label className="flex justify-between items-center text-3xl gap-4">
            {label}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
                        className="w-16 h-16 text-2xl text-center bg-[#3e2a1e] text-white border border-[#bfa77a] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                </div>

                <div className="flex flex-col space-y-1">
                    <button
                        onClick={() => handleChange(value + 1)}
                        className="w-8 h-8 bg-[#654532] border border-[#bfa77a] hover:bg-[#7b5b43] shadow-md flex items-center justify-center"
                        title="Increase"
                    >
                        <img
                            src="/concept_art/weapons/sword_button.png"
                            alt="Increase"
                            className="w-6 h-6 object-contain rotate-180"
                        />
                    </button>
                    <button
                        onClick={() => handleChange(value - 1)}
                        className="w-8 h-8 bg-[#654532] border border-[#bfa77a] hover:bg-[#7b5b43] shadow-md flex items-center justify-center"
                        title="Decrease"
                    >
                        <img
                            src="/concept_art/weapons/sword_button.png"
                            alt="Decrease"
                            className="w-6 h-6 object-contain"
                        />
                    </button>
                </div>
            </div>
        </label>
    );
}
