"use client";

import { useFlipStore } from "@/app/_store/flipStore";
import { useEffect, useRef, useState } from "react";

export default function FlipComponent() {
  const { flipCoin, result, selectedSide, outcome, isFlipping } = useFlipStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [showResult, setShowResult] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [finalRotation, setFinalRotation] = useState(0);

  const [resetting, setResetting] = useState(false);

useEffect(() => {
  if (isFlipping) {
    setShowResult(false);
    setResetting(true);
    setRotation(0);

    setTimeout(() => {
      setResetting(false);
      const fullSpins = 5;
      const final = result === "tails" ? 180 : 0;
      const newRotation = 360 * fullSpins + final;
      setRotation(newRotation);
      setFinalRotation(newRotation); 
      audioRef.current?.play();
    }, 20);
  }
}, [isFlipping, result]);


  useEffect(() => {
    if (!isFlipping && result) {
      setTimeout(() => setShowResult(true), 100);
    }
  }, [isFlipping, result]);

  const idleRotation = selectedSide === "tails" ? 180 : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 gap-6">
      <audio ref={audioRef} src="/assets/audio/coinflip.mp3" preload="auto" />

      <div className="w-40 h-40 relative perspective">
        <div
          className="coin3d"
          style={{
transform: `rotateY(${isFlipping ? rotation : (finalRotation || (selectedSide === "tails" ? 180 : 0))}deg)`
,
            transition: resetting ? "none" : "transform 1s ease-in-out",
          }}
        >
          <div className="coin-face heads" />
          <div className="coin-face tails" />
          {isFlipping && (
            <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <div className="shine-effect" />
            </div>
          )}
        </div>
      </div>

      {showResult && (
        <div className="text-center">
          <p className="text-xl font-bold">Result: {result.toUpperCase()}</p>
          <p className="text-sm text-gray-400">
            You chose: {selectedSide.toUpperCase()}
          </p>
          <p
            className={`font-bold ${
              outcome === "win" ? "text-green-500" : "text-red-500"
            }`}
          >
            You {outcome === "win" ? "Won!" : "Lost!"}
          </p>
        </div>
      )}
    </div>
  );
}
