import "react-native-gesture-handler";
import React from "react";

import { InjectedProvider } from "./contexts/injectedProviderContext";
import { ContractContextProvider } from "./contexts/contractContext";
import { CommitPoolContextProvider } from "./contexts/commitPoolContext";
import { StravaContextProvider } from "./contexts/stravaContext";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import AppLoading from "expo-app-loading";
import { useFonts, OpenSans_400Regular } from "@expo-google-fonts/open-sans";
import { Rubik_700Bold } from "@expo-google-fonts/rubik";

import { Header } from "./components/";
import {
  TestPage,
  LandingPage,
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
import { CurrentUserContextProvider } from "./contexts/currentUserContext";

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
      <InjectedProvider>
        <ContractContextProvider>
          <CurrentUserContextProvider>
            <StravaContextProvider>
              <CommitPoolContextProvider>
                    <NavigationContainer>
                      <Stack.Navigator
                        initialRouteName="Test"
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
                        <Stack.Screen
                          name="Completion"
                          component={CompletionPage}
                        />
                        <Stack.Screen name="Faq" component={FaqPage} />
                        <Stack.Screen name="Test" component={TestPage} />
                      </Stack.Navigator>
                    </NavigationContainer>
              </CommitPoolContextProvider>
            </StravaContextProvider>
          </CurrentUserContextProvider>
        </ContractContextProvider>
      </InjectedProvider>
    );
  }
};

const Stack = createStackNavigator();

export default App;
