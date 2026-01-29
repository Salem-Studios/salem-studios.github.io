"use client";

import { useMemo, useState } from "react";

export type ShopItem = {
    id: string;
    name: string;
    cost: number;
    description?: string;
};

export type ShopProps = {
    open: boolean;
    coins: number;
    onClose: () => void;
    onSpendCoins?: (amount: number) => void;
    items?: ShopItem[];
    title?: string;
};

export default function Shop({
    open,
    coins,
    onClose,
    onSpendCoins,
    items,
    title = "Shop",
}: ShopProps) {
    const [note, setNote] = useState<string | null>(null);

    const defaultItems = useMemo<ShopItem[]>(
        () => [
            { id: "potion", name: "Health Potion", cost: 10, description: "A small restorative." },
            { id: "sword", name: "Better Sword", cost: 50, description: "Sharper than your current blade." },
            { id: "cloak", name: "Traveler's Cloak", cost: 25, description: "Looks cool. Probably helps." },
        ],
        [],
    );

    const list = items?.length ? items : defaultItems;

    if (!open) return null;

    const buy = (item: ShopItem) => {
        if (coins < item.cost) {
            setNote("Not enough coins.");
            return;
        }
        onSpendCoins?.(item.cost);
        setNote(`Purchased: ${item.name}`);
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[90vw] max-w-lg bg-[#2c1a12] p-6 border-4 border-[#bfa77a] shadow-2xl"
                onClick={(e) => e.stopPropagation()} // ✅ add
            >
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-6xl">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-2 text-2xl bg-[#462a1f] border-4 border-[#bfa77a] hover:bg-[#654532] transition-all"
                        aria-label="Close shop"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-3 font-vt323 text-2xl text-[#f3d08a]">
                    Coins: {coins}
                </div>

                {note && (
                    <div className="mt-2 font-vt323 text-xl text-[#bfa77a]">{note}</div>
                )}

                <div className="mt-4 space-y-3">
                    {list.map((item) => {
                        const canBuy = coins >= item.cost;
                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between gap-4 bg-[#462a1f] p-3 border border-[#bfa77a]"
                            >
                                <div className="min-w-0">
                                    <div className="font-vt323 text-2xl truncate">{item.name}</div>
                                    {item.description && (
                                        <div className="font-vt323 text-lg text-[#bfa77a]/80 truncate">
                                            {item.description}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="font-vt323 text-2xl text-[#f3d08a]">
                                        {item.cost} 🪙
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => buy(item)}
                                        disabled={!canBuy}
                                        className={`px-3 py-2 text-2xl border-4 border-[#bfa77a] transition-all font-jacquard ${canBuy
                                            ? "bg-[#654532] hover:bg-[#7b5b43]"
                                            : "bg-[#3a1c14] opacity-60 cursor-not-allowed"
                                            }`}
                                    >
                                        Buy
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
