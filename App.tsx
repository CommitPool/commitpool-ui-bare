import "react-native-gesture-handler";
import React from "react";

import { Provider } from "react-redux";
import store from "./redux/store";

import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import AppLoading from "expo-app-loading";
import { useFonts, OpenSans_400Regular } from "@expo-google-fonts/open-sans";
import { Rubik_700Bold } from "@expo-google-fonts/rubik";

import { Header } from "./components/";
import {
  TestPage,
  IntroPage,
  LoginPage,
  ActivityGoalPage,
  ActivitySourcePage,
  StakingPage,
  ConfirmationPage,
  TrackPage,
  CompletionPage,
  FaqPage,
} from "./pages";

let persistor = persistStore(store);

const App = () => {
  let [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    Rubik_700Bold,
  });

  //TODO Do we ever get to the loading screen?
  //TODO Refactor/aggregate screen loading away from app.tsx
  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Confirmation"
                screenOptions={{
                  headerTitle: () => <Header />,
                  headerLeft: () => null,
                  headerShown: true,
                  headerTransparent: true,
                }}
              >
                <Stack.Screen name="Login" component={LoginPage} />
                <Stack.Screen name="Intro" component={IntroPage} />
                <Stack.Screen
                  name="ActivityGoal"
                  component={ActivityGoalPage}
                />
                <Stack.Screen
                  name="ActivitySource"
                  component={ActivitySourcePage}
                />
                <Stack.Screen name="Staking" component={StakingPage} />
                <Stack.Screen
                  name="Confirmation"
                  component={ConfirmationPage}
                />
                <Stack.Screen name="Track" component={TrackPage} />
                <Stack.Screen name="Completion" component={CompletionPage} />
                <Stack.Screen name="Faq" component={FaqPage} />
                <Stack.Screen name="Test" component={TestPage} />
              </Stack.Navigator>
            </NavigationContainer>
          </PersistGate>
        </Provider>
    );
  }
};

const Stack = createStackNavigator();

export default App;
