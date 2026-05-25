/**
 * Calculates words per minute (WPM).
 * WPM = typedCharacters / 5 / minutes
 */
export function calculateWpm(typedCharacters: number, seconds: number): number {
  if (typedCharacters === 0 || seconds <= 0) return 0;
  const minutes = seconds / 60;
  return Math.round((typedCharacters / 5) / minutes);
}

/**
 * Calculates typing accuracy percentage.
 * Accuracy = correctCharacters / totalTypedCharacters * 100
 */
export function calculateAccuracy(correctCharacters: number, totalTypedCharacters: number): number {
  if (totalTypedCharacters === 0) return 100;
  return Math.round((correctCharacters / totalTypedCharacters) * 100);
}
