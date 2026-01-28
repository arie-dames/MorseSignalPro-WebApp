
export const MORSE_DICT: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '0': '-----', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  '!': '-.-.--', ' ': '/'
};

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map(char => MORSE_DICT[char] || '')
    .filter(code => code !== '')
    .join(' ');
}

export function getSignalTimings(morse: string, unit: number = 100) {
  const timeline: { active: boolean; duration: number }[] = [];

  for (let i = 0; i < morse.length; i++) {
    const char = morse[i];
    
    if (char === '.') {
      timeline.push({ active: true, duration: unit });
      timeline.push({ active: false, duration: unit }); // gap between elements
    } else if (char === '-') {
      timeline.push({ active: true, duration: unit * 3 });
      timeline.push({ active: false, duration: unit }); // gap between elements
    } else if (char === ' ') {
      // morse uses space between letters. 
      // Dictionary join already added a space. 
      // Standard gap between letters is 3 units. 
      // We already added 1 unit after the last dot/dash.
      timeline.push({ active: false, duration: unit * 2 });
    } else if (char === '/') {
      // gap between words is 7 units.
      // We already added some from previous spaces.
      timeline.push({ active: false, duration: unit * 4 });
    }
  }
  
  return timeline;
}
