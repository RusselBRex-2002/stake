'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { playSpinSound, playWinSound } from './sound';
import { useCommonStore } from '@/app/_store/commonStore';
import { Container } from 'postcss';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

const SYMBOLS = ['🍒', '🍋', '🔔', '7️⃣', '🍊'] as const;
const REEL_COUNT = 3;
const INITIAL_BALANCE = 100;

function getRandomReels(): string[] {
    return Array.from({ length: REEL_COUNT }, () =>
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    );
}

export default function GameController() {
    const balance = useCommonStore((s) => s.balance);
    const setBalance = useCommonStore((s) => s.setBalance);

    const [bet, setBet] = useState(5);
    const [reels, setReels] = useState<string[]>(Array(REEL_COUNT).fill(''));
    const [isSpinning, setIsSpinning] = useState(false);

    const audioCtxRef = useRef<AudioContext | null>(null);
    useEffect(() => {
        const ctor = window.AudioContext || window.webkitAudioContext!;
        audioCtxRef.current = new ctor();
        setReels(getRandomReels());
    }, []);

    function handleSpin() {
        if (isSpinning || bet < 1 || bet > balance) return;

        setIsSpinning(true);
        const ctx = audioCtxRef.current!;
        playSpinSound(ctx);

        const iv = setInterval(() => setReels(getRandomReels()), 100);
        setTimeout(() => {
            clearInterval(iv);
            const final = getRandomReels();
            setReels(final);

            const [a, b, c] = final;
            const multiplier =
                a === b && b === c
                    ? 10
                    : a === b || b === c || a === c
                        ? 2
                        : 0;
            const payout = bet * multiplier;

            setBalance(balance - bet + payout);
            if (payout > 0) playWinSound(ctx);
            setIsSpinning(false);
        }, 2000);
    }


    return (
        <div className="flex flex-col items-center justify-center">
            {balance <= 0 ? (
                <div className='flex flex-col overflow-hidden rounded-2xl bg-gray-800 gap-2 p-12 m-14'>
                    <h2 className="text-2xl font-bold text-white">Game Over</h2>
                    <p className="text-white mb-6">Your balance is 0</p>
                    <Link
                        href="/"
                        className="
              group bg-success hover:bg-success/90 transition-colors
              p-2.5 sm:p-3 rounded-xl inline-flex items-center justify-center
              text-black
            "
                    >
                        Go Home
                    </Link>
                </div>
            ) : (
                <div className="flex w-full h-screen overflow-hidden rounded-2xl bg-gray-800">
                    {/* ── Left panel: controls ── */}
                    <div className="flex flex-col w-1/3 gap-6 p-8 bg-gray-900">
                        <h2 className="text-2xl font-bold text-white">
                            Balance: ₹{balance.toFixed(2)}/-
                        </h2>

                        {/* Stepper */}
                        <div className="flex h-12 items-center overflow-hidden">
                            <button
                                onClick={() => setBet((b) => Math.max(b - 1, 1))}
                                disabled={isSpinning || bet <= 1}
                                className="
                  w-12 h-full flex items-center justify-center
                  bg-success hover:bg-success/90 transition-colors
                  text-black text-2xl font-semibold rounded-l-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                            >
                                -
                            </button>
                            <input
                                id="bet"
                                type="number"
                                min={1}
                                max={balance}
                                value={bet}
                                disabled={isSpinning}
                                onChange={(e) => setBet(Number(e.target.value) || 1)}
                                className="
                  flex-1 h-full px-4 text-center bg-transparent text-white
                  appearance-none outline-none
                "
                            />
                            <button
                                onClick={() => setBet((b) => Math.min(b + 1, balance))}
                                disabled={isSpinning || bet >= balance}
                                className="
                  w-12 h-full flex items-center justify-center
                  bg-success hover:bg-success/90 transition-colors
                  text-black text-2xl font-semibold rounded-r-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                            >
                                +
                            </button>
                        </div>

                        {/* Percentage shortcuts */}
                        <div className="flex gap-2">
                            {[25, 50, 75, 100].map((pct) => (
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
                                    className="
                    flex-1
                    bg-success hover:bg-success/90 transition-colors
                    text-black text-sm font-semibold
                    py-2 rounded-lg
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                                >
                                    {pct}%
                                </button>
                            ))}
                        </div>

                        {/* Spin */}
                        <button
                            onClick={handleSpin}
                            disabled={isSpinning}
                            className="
                group bg-success hover:bg-success/90 transition-colors
                text-black text-lg font-semibold
                py-3 px-14 rounded-xl
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            {isSpinning ? 'Spinning…' : 'Spin'}
                        </button>

                    </div>

                    {/* ── Right panel: reels ── */}
                    <div className="flex-1 flex flex-col justify-center items-center gap-2 bg-gray-700 p-8">
                        <div className="flex gap-2">
                            {reels.map((sym, i) => (
                                <div
                                    key={i}
                                    className={`w-20 h-20 flex items-center justify-center text-5xl 
            border-4 border-secondary rounded ${isSpinning ? 'animate-reelSpin' : ''}`}
                                >
                                    {sym}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
