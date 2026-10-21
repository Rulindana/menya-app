import * as Speech from 'expo-speech';

export const speakKinyarwanda = (text: string) => {
  Speech.stop();
  Speech.speak(text, {
    language: 'rw-RW', // Kinyarwanda — falls back to closest available
    pitch: 1.0,
    rate: 0.85,
    onError: () => {
      // Fallback to English pronunciation if rw not available
      Speech.speak(text, { language: 'en-US', pitch: 1.0, rate: 0.8 });
    },
  });
};

export const stopSpeech = () => Speech.stop();
