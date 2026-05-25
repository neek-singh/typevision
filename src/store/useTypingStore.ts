import { create } from 'zustand';

interface TypingStats {
  wpm: number;
  accuracy: number;
  mistakes: number;
  totalTyped: number;
  duration: number;
}

interface TypingState {
  text: string;
  typedText: string;
  startTime: number | null;
  endTime: number | null;
  duration: number; // in seconds
  isActive: boolean;
  isCompleted: boolean;
  mistakes: number;
  correctCharacters: number;
  incorrectCharacters: number;
  typedCharacters: number;
  wrongIndexes: Set<number>;
  
  // Actions
  initializeTest: (text: string) => void;
  startTest: () => void;
  typeChar: (char: string) => void;
  deleteChar: () => void;
  tick: () => void;
  resetTest: () => void;
  getStats: () => TypingStats;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  text: '',
  typedText: '',
  startTime: null,
  endTime: null,
  duration: 0,
  isActive: false,
  isCompleted: false,
  mistakes: 0,
  correctCharacters: 0,
  incorrectCharacters: 0,
  typedCharacters: 0,
  wrongIndexes: new Set<number>(),

  initializeTest: (text: string) => {
    set({
      text,
      typedText: '',
      startTime: null,
      endTime: null,
      duration: 0,
      isActive: false,
      isCompleted: false,
      mistakes: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      typedCharacters: 0,
      wrongIndexes: new Set<number>(),
    });
  },

  startTest: () => {
    set({
      startTime: Date.now(),
      isActive: true,
      duration: 0,
    });
  },

  typeChar: (char: string) => {
    const { text, typedText, isCompleted, isActive, wrongIndexes, mistakes, correctCharacters, incorrectCharacters } = get();
    if (isCompleted) return;

    let updatedIsActive = isActive;
    let updatedStartTime = get().startTime;

    // Start test automatically on first keystroke
    if (!isActive && typedText.length === 0) {
      updatedIsActive = true;
      updatedStartTime = Date.now();
    }

    const currentIndex = typedText.length;
    if (currentIndex >= text.length) return;

    const expectedChar = text[currentIndex];
    const isCorrect = char === expectedChar;
    const newTypedText = typedText + char;
    const isFinished = newTypedText.length === text.length;

    let newCorrect = correctCharacters;
    let newMistakes = mistakes;
    let newIncorrect = incorrectCharacters;
    const newWrongIndexes = new Set(wrongIndexes);

    if (isCorrect) {
      newCorrect += 1;
    } else {
      newWrongIndexes.add(currentIndex);
      newMistakes += 1;
      newIncorrect += 1;
    }

    set({
      typedText: newTypedText,
      typedCharacters: newTypedText.length,
      isActive: updatedIsActive && !isFinished,
      startTime: updatedStartTime,
      wrongIndexes: newWrongIndexes,
      mistakes: newMistakes,
      correctCharacters: newCorrect,
      incorrectCharacters: newIncorrect,
      isCompleted: isFinished,
      endTime: isFinished ? Date.now() : null,
    });
  },

  deleteChar: () => {
    const { typedText, isCompleted, wrongIndexes, correctCharacters, incorrectCharacters } = get();
    if (isCompleted || typedText.length === 0) return;

    const newTypedText = typedText.slice(0, -1);
    const deleteIndex = typedText.length - 1;
    const isWrong = wrongIndexes.has(deleteIndex);

    const newWrongIndexes = new Set(wrongIndexes);
    newWrongIndexes.delete(deleteIndex);

    const newCorrect = isWrong ? correctCharacters : Math.max(0, correctCharacters - 1);
    const newIncorrect = isWrong ? Math.max(0, incorrectCharacters - 1) : incorrectCharacters;

    set({
      typedText: newTypedText,
      typedCharacters: newTypedText.length,
      wrongIndexes: newWrongIndexes,
      correctCharacters: newCorrect,
      incorrectCharacters: newIncorrect,
    });
  },

  tick: () => {
    const { isActive, isCompleted, startTime } = get();
    if (!isActive || isCompleted) return;
    
    // Calculate precise duration based on start time
    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    set({ duration: elapsed || 1 });
  },

  resetTest: () => {
    set({
      typedText: '',
      startTime: null,
      endTime: null,
      duration: 0,
      isActive: false,
      isCompleted: false,
      mistakes: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      typedCharacters: 0,
      wrongIndexes: new Set<number>(),
    });
  },

  getStats: () => {
    const { typedCharacters, mistakes, duration, correctCharacters } = get();
    
    if (typedCharacters === 0) {
      return { wpm: 0, accuracy: 100, mistakes: 0, totalTyped: 0, duration: 0 };
    }

    // Minutes calculation (ensure at least 1 second to avoid division by zero)
    const minutes = Math.max(duration, 1) / 60;

    // WPM Formula: WPM = Total Typed Characters / 5 / Minutes
    const wpm = Math.round((typedCharacters / 5) / minutes);

    // Accuracy Formula: Accuracy = Correct Characters / Total Typed Characters * 100
    const accuracy = Math.round((correctCharacters / typedCharacters) * 100);

    return {
      wpm,
      accuracy,
      mistakes,
      totalTyped: typedCharacters,
      duration,
    };
  },
}));
