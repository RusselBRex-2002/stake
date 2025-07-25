"use client";

import { useFlipStore } from "@/app/_store/flipStore";
import { useCommonStore } from "@/app/_store/commonStore";
import { Coins } from "lucide-react";
import React from "react";

function FlipConfig() {
  const {
    selectedSide,
    setSelectedSide,
    betAmount,
    setBetAmount,
    flipCoin,
    isFlipping,
  } = useFlipStore();

  const { balance } = useCommonStore();
  const [inputValue, setInputValue] = React.useState(betAmount);
  const [error, setError] = React.useState("");

  const handleBetAmountChange = (val: string) => {
    const parsed = parseFloat(val);
    setInputValue(parsed);
    if (!isNaN(parsed)) {
      setBetAmount(parsed);
      if (parsed > balance) {
        setError("Bet amount exceeds balance");
      } else {
        setError("");
      }
    }
  };

  const handleHalf = () => {
    const newAmount = +(betAmount / 2).toFixed(2);
    setBetAmount(newAmount);
    setInputValue(newAmount);
  };

  const handleDouble = () => {
    const newAmount = +(betAmount * 2).toFixed(2);
    if (newAmount <= balance) {
      setBetAmount(newAmount);
      setInputValue(newAmount);
      setError("");
    } else {
      setError("Bet amount exceeds balance");
    }
  };

  return (
    <div className="w-[320px] bg-[#141e27] p-5 text-sm space-y-6 h-full">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[#a0b3c3] font-medium">
          <span>Bet Amount</span>
          <span>${balance.toFixed(2)}</span>
        </div>
        <div className="flex rounded-md overflow-hidden border border-[#2b3a4b] bg-[#1d2b38]">
          <input
            type="number"
            className="w-full bg-transparent px-3 py-2 text-white focus:outline-none"
            value={inputValue}
            onChange={(e) => handleBetAmountChange(e.target.value)}
          />
          <div className="px-3 flex items-center text-white border-l border-[#2b3a4b]">
            <Coins className="w-4 h-4 text-green-400" />
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <button
            onClick={handleHalf}
            disabled={betAmount <= 0}
            className="w-1/2 py-2 bg-[#1d2b38] hover:bg-[#2a3a49] text-white rounded-md"
          >
            ½
          </button>
          <button
            onClick={handleDouble}
            disabled={betAmount <= 0 || betAmount * 2 > balance}
            className="w-1/2 py-2 bg-[#1d2b38] hover:bg-[#2a3a49] text-white rounded-md"
          >
            2×
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[#a0b3c3] font-medium">Choose Side</div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedSide("heads")}
            className={`w-1/2 flex justify-between items-center py-2 px-3 rounded-md font-semibold text-white ${
              selectedSide === "heads" ? "bg-[#223548]" : "bg-[#1e2c3a]"
            }`}
          >
            Heads <span className="w-3 h-3 bg-yellow-500 rounded-full" />
          </button>
          <button
            onClick={() => setSelectedSide("tails")}
            className={`w-1/2 flex justify-between items-center py-2 px-3 rounded-md font-semibold text-white ${
              selectedSide === "tails" ? "bg-[#223548]" : "bg-[#1e2c3a]"
            }`}
          >
            Tails <span className="w-3 h-3 bg-blue-500 rounded-full" />
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={flipCoin}
        disabled={
          !betAmount || betAmount <= 0 || betAmount > balance || isFlipping
        }
        className="w-full py-2 bg-[#00ff40] text-black font-bold rounded-md hover:bg-[#00e63b] disabled:bg-gray-600 disabled:text-gray-400"
      >
        {isFlipping ? "Flipping..." : "Flip Coin"}
      </button>
    </div>
  );
}

export default FlipConfig;
