import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "./themeSlice";
import wordsLearningSlice from "./wordsLearningSlice";
import { persistenceMiddleware } from "./persistenceMiddleware";

const store = configureStore({
  reducer: {
    theme: themeSlice.reducer,
    wordsLearning: wordsLearningSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
});

export default store;
