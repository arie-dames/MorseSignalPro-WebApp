
export type MorseSymbol = '.' | '-' | ' ' | '/';

export interface MorseSequence {
  text: string;
  morse: string;
  timestamp: number;
}

export interface SignalConfig {
  unitTime: number; // Duration of one dot in ms
  frequency: number; // Audio frequency in Hz
}
