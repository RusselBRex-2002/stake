import { create } from "zustand";
import { useCommonStore } from "./commonStore";

type FlipState = {
  selectedSide: "heads" | "tails";
  result: "heads" | "tails" | "";
  outcome: "win" | "lose" | "";
  betAmount: number;
  isFlipping: boolean;
  setSelectedSide: (side: "heads" | "tails") => void;
  setBetAmount: (amount: number) => void;
  flipCoin: () => void;
};

export const useFlipStore = create<FlipState>((set, get) => ({
  selectedSide: "heads",
  result: "",
  outcome: "",
  betAmount: 10,
  isFlipping: false,

  setSelectedSide: (side) => set({ selectedSide: side }),
  setBetAmount: (amount) => set({ betAmount: amount }),

  flipCoin: () => {
    const { selectedSide, betAmount } = get();
    const { balance } = useCommonStore.getState();

    if (betAmount > balance || betAmount <= 0) return;

    const flipResult: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    const win = flipResult === selectedSide;
    const newBalance = win ? balance + betAmount : balance - betAmount;

    set({
      isFlipping: true,
      result: flipResult, 
      outcome: "", 
    });

    
    setTimeout(() => {
      set({
        isFlipping: false,
        outcome: win ? "win" : "lose",
      });

      useCommonStore.setState({ balance: newBalance });
    }, 1500); 
  },
}));
