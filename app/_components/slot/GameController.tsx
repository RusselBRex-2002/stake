'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { playSpinSound, playWinSound } from './sound';
import { useCommonStore } from '@/app/_store/commonStore';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

const SYMBOLS = ['🍒', '🍋', '🔔', '7️⃣', '🍊'] as const;
const REEL_COUNT = 3;

function getRandomReels(): string[] {
    return Array.from({ length: REEL_COUNT }, () =>
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    );
}

export default function GameController() {
    const balance = useCommonStore(s => s.balance);
    const setBalance = useCommonStore(s => s.setBalance);

    const [bet, setBet] = useState(5);
    const [reels, setReels] = useState<string[]>(Array(REEL_COUNT).fill(''));
    const [isSpinning, setIsSpinning] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const reelIntervals = useRef<number[]>([]);
    const reelTimeouts = useRef<number[]>([]);

    useEffect(() => {
        const ctor = window.AudioContext || window.webkitAudioContext!;
        audioCtxRef.current = new ctor();
        setReels(getRandomReels());
        return () => {
            reelIntervals.current.forEach(clearInterval);
            reelTimeouts.current.forEach(clearTimeout);
        };
    }, []);

    function handleSpin() {
        if (isSpinning || bet < 1 || bet > balance) return;
        setIsSpinning(true);
        const ctx = audioCtxRef.current!;
        playSpinSound(ctx);

        reelIntervals.current.forEach(clearInterval);
        reelTimeouts.current.forEach(clearTimeout);
        reelIntervals.current = [];
        reelTimeouts.current = [];

        const finalSymbols = getRandomReels();

        finalSymbols.forEach((_, i) => {
            const iv = window.setInterval(() => {
                setReels(prev =>
                    prev.map((s, idx) =>
                        idx === i
                            ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
                            : s
                    )
                );
            }, 80);
            reelIntervals.current[i] = iv;

            const to = window.setTimeout(() => {
                clearInterval(iv);
                setReels(prev =>
                    prev.map((s, idx) => (idx === i ? finalSymbols[i] : s))
                );
                if (i === REEL_COUNT - 1) {
                    const [a, b, c] = finalSymbols;
                    const mul =
                        a === b && b === c ? 10 : a === b || b === c || a === c ? 2 : 0;
                    const payout = bet * mul;
                    setBalance(balance - bet + payout);
                    if (payout > 0) playWinSound(ctx);
                    setIsSpinning(false);
                }
            }, 1000 + i * 400);
            reelTimeouts.current[i] = to;
        });
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
            {balance <= 0 ? (
                <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-900 text-white space-y-6">
                    <h1 className="text-4xl font-bold">Game Over</h1>
                    <span>You don't have sufficient balance</span>
                    <Link
                        href="/"
                        className="rounded-lg bg-success text-lg text-black hover:scale-110 transition duration-200 ease-in-out px-6 py-3"
                    >
                        Return to Home
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row w-full h-screen overflow-hidden rounded-2xl bg-gray-800">
                    <div className="w-full sm:w-1/3 flex flex-col gap-6 p-6 sm:p-8 bg-gray-900">
                        <h2 className="text-2xl font-bold text-white">
                            Balance: ₹{balance.toFixed(2)}/-
                        </h2>
                        <div className="flex h-12 items-center overflow-hidden">
                            <button
                                onClick={() => setBet(b => Math.max(b - 1, 1))}
                                disabled={isSpinning || bet <= 1}
                                className="w-12 flex items-center justify-center bg-success hover:bg-success/90 text-black text-2xl font-semibold rounded-l-xl disabled:opacity-50"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min={1}
                                max={balance}
                                value={bet}
                                disabled={isSpinning}
                                onChange={e => setBet(Number(e.target.value) || 1)}
                                className="flex-1 h-full px-4 text-center bg-transparent text-white outline-none"
                            />
                            <button
                                onClick={() => setBet(b => Math.min(b + 1, balance))}
                                disabled={isSpinning || bet >= balance}
                                className="w-12 flex items-center justify-center bg-success hover:bg-success/90 text-black text-2xl font-semibold rounded-r-xl disabled:opacity-50"
                            >
                                +
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {[25, 50, 75, 100].map(pct => (
                                <button
                                    key={pct}
                                    onClick={() =>
                                        setBet(
                                            pct === 100
                                                ? Number(balance.toFixed(2))
                                                : Number((balance * (pct / 100)).toFixed(2))
                                        )
                                    }
                                    disabled={isSpinning}
                                    className="flex-1 bg-success hover:bg-success/90 text-black text-sm font-semibold py-2 rounded-lg disabled:opacity-50"
                                >
                                    {pct}%
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleSpin}
                            disabled={isSpinning}
                            className="bg-success hover:bg-success/90 text-black text-lg font-semibold py-3 rounded-xl disabled:opacity-50"
                        >
                            {isSpinning ? 'Spinning…' : 'Spin'}
                        </button>
                    </div>

                    <div className="w-full sm:flex-1 flex justify-center items-center p-1 sm:p-2 bg-gray-800">
                        <div className="relative w-full max-w-xs aspect-[4/3] bg-success rounded-lg border-[14px] border-green-900 shadow-lg overflow-hidden">
                            <h2 className='text-2xl font-bold text-black text-center p-3'>Spin to win</h2>
                            <div className="absolute inset-x-0 top-1/3 flex justify-center">
                                <div className="w-[90%] h-24 bg-gradient-to-b from-gray-900 to-black border-[9px] border-gray-700 shadow-inner rounded-md flex justify-between px-2 py-1 overflow-hidden">
                                    {reels.map((sym, idx) => (
                                        <div
                                            key={idx}
                                            className="w-1/3 h-full flex items-center justify-center bg-white border-x border-gray-400 shadow-inner rounded-sm"
                                        >
                                            <span className="text-4xl font-extrabold">
                                                {sym}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}