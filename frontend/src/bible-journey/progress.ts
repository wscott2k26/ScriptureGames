import AsyncStorage from '@react-native-async-storage/async-storage';

import { createJourneyProgressStore } from './progress-store';

const journeyProgressStore = createJourneyProgressStore(AsyncStorage);

export const loadBibleJourneyProgress = journeyProgressStore.load;
export const saveBibleJourneyProgress = journeyProgressStore.save;
export const recordBibleJourneyTrial = journeyProgressStore.recordTrial;
export const completeBibleJourneyBook = journeyProgressStore.completeBook;
export const syncGenesisJourneyCompletion = journeyProgressStore.syncGenesis;
export const resetBibleJourneyProgress = journeyProgressStore.reset;

export type {
  BibleJourneyProgress,
  JourneyBookProgress,
  JourneyTrialResult,
} from './progress-core';
