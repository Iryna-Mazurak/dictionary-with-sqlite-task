
import "react-native-gesture-handler";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import WordsNavigation from "./WordsNavigation";
import LearningNavigation from "./LearningNavigation";
import Settings from "../screens/Settings";
import { wordsLearningActions } from "../store/wordsLearningSlice";
import { themeActions } from "../store/themeSlice";
import { REFRESH_STATUSES_SPAN } from "../constants";
import { init, getWords, getTheme } from "../store/dbUtils";
import { disablePersistence, enablePersistence } from "../store/persistenceMiddleware";
import store from "../store";

const Tab = createBottomTabNavigator();

function MainNavigator() {
  const colors = useSelector((state) => state.theme.colors);
  const isDark = useSelector((state) => state.theme.isDark);
  const dispatch = useDispatch();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        disablePersistence();
        await init();

        const [words, savedIsDark] = await Promise.all([
          getWords(),
          getTheme(),
        ]);

        if (!mounted) return;

        dispatch(wordsLearningActions.setInitial(words));
        dispatch(themeActions.setInitial(savedIsDark));

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

  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(
      () => dispatch(wordsLearningActions.updateStatuses()),
      REFRESH_STATUSES_SPAN
    );

    return () => clearInterval(interval);
  }, [dispatch, isReady]);

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

  return (
    <>
      <StatusBar
        backgroundColor={colors.appBackground}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarHideOnKeyboard: true,
            headerTitleStyle: { fontWeight: "800" },
            tabBarActiveTintColor: colors.primary900,
            tabBarActiveBackgroundColor: colors.appBackground,
            tabBarInactiveBackgroundColor: colors.appBackground,
            headerStyle: {
              backgroundColor: colors.appBackground,
            },
            headerTintColor: colors.primary900,
            headerTitleAlign: "center",
          }}
        >
          <Tab.Screen
            name="Words"
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="list-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
            component={WordsNavigation}
          />

          <Tab.Screen
            name="Learning"
            component={LearningNavigation}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="book-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="settings-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default MainNavigator;
