import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

/** Load the one bundled icon font the app uses. No network request required. */
export const useIconFonts = (): readonly [boolean, Error | null] => useFonts(Ionicons.font);
