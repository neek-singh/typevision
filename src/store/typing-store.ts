import { create } from 'zustand';
import { calculateWpm, calculateAccuracy } from '@/lib/calculations';

interface TypingStoreState {
  text: string;
  typedText: string;
  timeLeft: number;
  duration: number; // Initial time limit
  isActive: boolean;
  isCompleted: boolean;
  mistakes: number;
  correctCharacters: number;
  incorrectCharacters: number;
  typedCharacters: number;
  wrongIndexes: Set<number>;
  
  // Actions
  initialize: (text: string, timeLimit?: number) => void;
  start: () => void;
  typeChar: (char: string) => void;
  deleteChar: () => void;
  tick: () => void;
  reset: () => void;
  getWpm: () => number;
  getAccuracy: () => number;
}

export const useTypingStore = create<TypingStoreState>((set, get) => ({
  text: '',
  typedText: '',
  timeLeft: 60,
  duration: 60,
  isActive: false,
  isCompleted: false,
  mistakes: 0,
  correctCharacters: 0,
  incorrectCharacters: 0,
  typedCharacters: 0,
  wrongIndexes: new Set<number>(),

  initialize: (text: string, timeLimit = 60) => {
    set({
      text,
      typedText: '',
      timeLeft: timeLimit,
      duration: timeLimit,
      isActive: false,
      isCompleted: false,
      mistakes: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      typedCharacters: 0,
      wrongIndexes: new Set<number>(),
    });
  },

  start: () => {
    set({ isActive: true });
  },

  typeChar: (char: string) => {
    const { text, typedText, timeLeft, isCompleted, isActive, correctCharacters, incorrectCharacters, mistakes, wrongIndexes } = get();
    
    if (timeLeft <= 0 || isCompleted) return;

    // Start timer/test on first keypress
    let updatedIsActive = isActive;
    if (!isActive && typedText.length === 0) {
      updatedIsActive = true;
    }

    const currentIndex = typedText.length;
    if (currentIndex >= text.length) return;

    const expectedChar = text[currentIndex];
    const isCorrect = char === expectedChar;

    const newWrongIndexes = new Set(wrongIndexes);
    let newCorrect = correctCharacters;
    let newIncorrect = incorrectCharacters;
    let newMistakes = mistakes;

    if (isCorrect) {
      newCorrect += 1;
    } else {
      newWrongIndexes.add(currentIndex);
      newMistakes += 1;
      newIncorrect += 1;
    }

    const newTypedText = typedText + char;
    const isFinished = newTypedText.length === text.length;

    set({
      typedText: newTypedText,
      typedCharacters: newTypedText.length,
      isActive: updatedIsActive && !isFinished,
      correctCharacters: newCorrect,
      incorrectCharacters: newIncorrect,
      mistakes: newMistakes,
      wrongIndexes: newWrongIndexes,
      isCompleted: isFinished,
    });
  },

  deleteChar: () => {
    const { typedText, isCompleted, wrongIndexes, correctCharacters, incorrectCharacters } = get();
    
    if (isCompleted || typedText.length === 0) return;

    const deleteIndex = typedText.length - 1;
    const isWrong = wrongIndexes.has(deleteIndex);

    const newWrongIndexes = new Set(wrongIndexes);
    newWrongIndexes.delete(deleteIndex);

    const newTypedText = typedText.slice(0, -1);
    const newCorrect = isWrong ? correctCharacters : Math.max(0, correctCharacters - 1);
    const newIncorrect = isWrong ? Math.max(0, incorrectCharacters - 1) : incorrectCharacters;

    set({
      typedText: newTypedText,
      typedCharacters: newTypedText.length,
      correctCharacters: newCorrect,
      incorrectCharacters: newIncorrect,
      wrongIndexes: newWrongIndexes,
    });
  },

  tick: () => {
    const { timeLeft, isActive } = get();
    if (!isActive || timeLeft <= 0) return;

    const newTimeLeft = timeLeft - 1;
    const isOver = newTimeLeft <= 0;

    set({
      timeLeft: newTimeLeft,
      isActive: !isOver,
      isCompleted: isOver,
    });
  },

  reset: () => {
    const { text, duration } = get();
    get().initialize(text, duration);
  },

  getWpm: () => {
    const { typedCharacters, duration, timeLeft } = get();
    const secondsElapsed = duration - timeLeft;
    // Prevent division by zero, use at least 1 second
    const timeUsed = secondsElapsed > 0 ? secondsElapsed : 1;
    return calculateWpm(typedCharacters, timeUsed);
  },

  getAccuracy: () => {
    const { correctCharacters, typedCharacters } = get();
    return calculateAccuracy(correctCharacters, typedCharacters);
  },
}));
export type { TypingStoreState };
