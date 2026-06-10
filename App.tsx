import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BudgetScreen } from './src/screens/BudgetScreen';
import { SavingsScreen } from './src/screens/SavingsScreen';
import { MortgageScreen } from './src/screens/MortgageScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { VaultTabBar } from './src/components/TabBar';
import { BudgetProvider } from './src/store/BudgetContext';
import { ProfileProvider, useProfile } from './src/store/ProfileContext';
import { ThemeProvider, useThemeColors, useResolvedTheme } from './src/store/ThemeContext';
import { ToastProvider } from './src/store/ToastContext';
import { ToastHost } from './src/components/toast/ToastHost';

const Tab = createBottomTabNavigator();

function ThemedNavigation() {
  const colors = useThemeColors();
  const resolved = useResolvedTheme();
  const navTheme = {
    ...DefaultTheme,
    dark: resolved === 'dark',
    colors: {
      ...DefaultTheme.colors,
      background: colors.bgBottom,
      card: colors.bgBottom,
      text: colors.text,
      border: 'transparent',
      primary: colors.blue,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        tabBar={(props) => <VaultTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.bgBottom },
        }}
      >
        <Tab.Screen name="Budget" component={BudgetScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Savings" component={SavingsScreen} />
        <Tab.Screen name="Mortgage" component={MortgageScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <ToastHost />
      <StatusBar style={resolved === 'light' ? 'dark' : 'light'} />
    </NavigationContainer>
  );
}

function ThemedApp() {
  const { preferences } = useProfile();
  return (
    <ThemeProvider mode={preferences.themeMode}>
      <ThemedNavigation />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <ProfileProvider>
          <BudgetProvider>
            <ThemedApp />
          </BudgetProvider>
        </ProfileProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
