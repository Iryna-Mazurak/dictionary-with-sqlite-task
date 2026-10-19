
import {
  addWord,
  updateWord,
  deleteWord,
  setTheme,
} from "./dbUtils";

let persistenceReady = false;
let previousWords = [];
let previousIsDark = true;

export function enablePersistence(state) {
  previousWords = state.wordsLearning.words;
  previousIsDark = state.theme.isDark;
  persistenceReady = true;
}

export function disablePersistence() {
  persistenceReady = false;
}

export function persistenceMiddleware(store) {
  return (next) => (action) => {
    const result = next(action);

    if (!persistenceReady) {
      return result;
    }

    const state = store.getState();
    const words = state.wordsLearning.words;
    const isDark = state.theme.isDark;

    if (words !== previousWords) {
      const oldWordsMap = new Map(
        previousWords.map((word) => [word.word, word])
      );
      const newWordsMap = new Map(
        words.map((word) => [word.word, word])
      );

      for (const [wordText, word] of newWordsMap) {
        const oldWord = oldWordsMap.get(wordText);

        if (!oldWord) {
          addWord(word).catch(console.error);
        } else if (oldWord !== word) {
          updateWord(word).catch(console.error);
        }
      }

      for (const wordText of oldWordsMap.keys()) {
        if (!newWordsMap.has(wordText)) {
          deleteWord(wordText).catch(console.error);
        }
      }

      previousWords = words;
    }

    if (isDark !== previousIsDark) {
      setTheme(isDark).catch(console.error);
      previousIsDark = isDark;
    }

    return result;
  };
}
