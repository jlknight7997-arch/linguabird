
import { Language } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'Inglês', flag: '🇺🇸' },
  { code: 'es', name: 'Espanhol', flag: '🇪🇸' },
  { code: 'fr', name: 'Francês', flag: '🇫🇷' },
  { code: 'de', name: 'Alemão', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japonês', flag: '🇯🇵' }
];

export const INITIAL_STATS = {
  xp: 0,
  streak: 0,
  hearts: 5,
  coins: 50,
  currentLevel: 1
};
