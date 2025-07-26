'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCommonStore } from '@/app/_store/commonStore'

export type SymbolType = 'rock' | 'paper' | 'scissors'

const SYMBOLS: SymbolType[] = ['rock', 'paper', 'scissors']
const WINS: Record<SymbolType, SymbolType> = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
}

const CARD_WIDTH = 128
const CARD_GAP = 8
const SLIDE_OFFSET = CARD_WIDTH + CARD_GAP

function shuffleDeck(): SymbolType[] {
    return Array.from({ length: 10 }, () =>
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ).sort(() => Math.random() - 0.5)
}

export function Game() {
    const [deck, setDeck] = useState<SymbolType[]>([])
    const [index, setIndex] = useState(0)
    const [bet, setBet] = useState(10)
    const [result, setResult] = useState('')

    const balance = useCommonStore(s => s.balance)
    const setBalance = useCommonStore(s => s.setBalance)

    useEffect(() => {
        setDeck(shuffleDeck())
    }, [])

    function handleChoice(choice: SymbolType) {
        if (index >= deck.length) {
            setResult('No more cards. Click Restart below.')
            return
        }
        if (bet < 1 || bet > balance) {
            alert(`Enter a valid bet between 1 and ${balance}`)
            return
        }

        const card = deck[index]
        let msg = ''

        if (choice === card) {
            msg = `Tie! You both chose ${choice}.`
        } else if (WINS[choice] === card) {
            setBalance(balance + bet)
            msg = `You win! ${choice} beats ${card}. +${bet}`
        } else {
            setBalance(balance - bet)
            msg = `You lose! ${card} beats ${choice}. -${bet}`
        }

        setResult(msg)
        setIndex(i => i + 1)
    }

    // compute translate offset so that the just-revealed card sits in the center
    const rawOffset = index * SLIDE_OFFSET

    if (balance <= 0) {
        return (
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
        )
    }

    return (
        <div className="w-screen h-screen flex bg-gray-900">
            {/* Sidebar Controls */}
            <aside className="w-full md:w-1/3 flex flex-col items-center md:items-start p-6 space-y-6 text-white">
                <h1 className="text-3xl font-bold text-center md:text-left">
                    Rock Paper Scissors
                </h1>

                <div className="flex items-center space-x-2">
                    <span>Bet:</span>
                    <input
                        type="number"
                        min={1}
                        max={balance}
                        value={bet}
                        onChange={e => setBet(+e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-600 rounded text-sm bg-gray-700 text-white focus:outline-none"
                    />
                </div>

                <div className="flex space-x-2">
                    {[25, 50, 75, 100].map(p => (
                        <button
                            key={p}
                            onClick={() => {
                                const calc = Math.floor((balance * p) / 100)
                                setBet(Math.max(1, calc))
                            }}
                            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
                        >
                            {p}%
                        </button>
                    ))}
                </div>

                <div className="flex space-x-4">
                    {SYMBOLS.map(s => (
                        <button
                            key={s}
                            onClick={() => handleChoice(s)}
                            className="group bg-success hover:bg-success/90 p-3 rounded-xl inline-flex items-center justify-center text-black hover:scale-110 transition duration-200 ease-in-out"
                        >
                            <span className="font-medium">{s}</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-2 text-left">
                    <p className="text-lg">
                        Balance: <span className="font-semibold">{balance}</span>
                    </p>
                    <p>{result}</p>
                </div>

                {index >= deck.length && (
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-success text-black hover:scale-110 transition duration-200 ease-in-out px-4 py-2"
                    >
                        Restart
                    </button>
                )}
            </aside>

            {/* Card Rail */}
            <main className="flex-1 flex items-center justify-center p-6 bg-gray-800">
                <div className="relative w-full h-56 overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 flex items-center space-x-6 transition-transform duration-500 ease-in-out"
                        style={{
                            // center 0th card, then shift by rawOffset
                            marginLeft: `calc(50% - ${CARD_WIDTH / 2}px)`,
                            transform: `translateX(-${rawOffset}px)`,
                        }}
                    >
                        {deck.map((symbol, i) => {
                            const revealed = i < index
                            return (
                                <div
                                    key={i}
                                    className="w-40 h-56 flex-shrink-0 perspective-[500px] p-2"
                                >
                                    <div
                                        className={
                                            `relative w-full h-full transform-style-[preserve-3d] ` +
                                            `transition-transform duration-500 ease-in-out ` +
                                            `${revealed ? '[transform:rotateY(180deg)]' : ''}`
                                        }
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-success text-black font-bold text-4xl backface-visibility-[hidden] p-2">
                                            ?
                                        </div>
                                        <div
                                            className={
                                                `absolute inset-0 flex items-center justify-center rounded-lg ` +
                                                `bg-success text-black text-2xl font-bold backface-visibility-[hidden] ` +
                                                `[transform:rotateY(180deg)] ${!revealed ? 'invisible' : ''}`
                                            }
                                            style={{ padding: '0.5rem' }}
                                        >
                                            {symbol}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}
