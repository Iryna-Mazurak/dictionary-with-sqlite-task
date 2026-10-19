import "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider, useDispatch } from "react-redux";

import store from "./store";
import MainNavigator from "./navigators/MainNavigator";

import {
  init,
  getWords,
  getTheme,
} from "./store/dbUtils";

import { themeActions } from "./store/themeSlice";
import { wordsLearningActions } from "./store/wordsLearningSlice";
import { enablePersistence } from "./store/persistenceMiddleware";

function AppContent() {
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        await init();

        const [words, isDark] = await Promise.all([
          getWords(),
          getTheme(),
        ]);

        if (!mounted) return;

        dispatch(wordsLearningActions.setInitial(words));
        dispatch(themeActions.setInitial(isDark));

        enablePersistence(store.getState());
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize SQLite:", error);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <MainNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
