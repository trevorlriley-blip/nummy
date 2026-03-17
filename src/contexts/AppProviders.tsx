import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { lightTheme, darkTheme } from '../theme/paperTheme';
import { ThemeProvider, useThemeMode } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { OnboardingProvider } from './OnboardingContext';
import { RecipeProvider } from './RecipeContext';
import { MealPlanProvider } from './MealPlanContext';
import { CalendarProvider } from './CalendarContext';
import { GroceryListProvider } from './GroceryListContext';
import { FeedbackProvider } from './FeedbackContext';
import { AgentProvider } from './AgentContext';
import { MyRecipesProvider } from './MyRecipesContext';

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemeMode();
  return (
    <PaperProvider theme={isDark ? darkTheme : lightTheme}>
      <AuthProvider>
        <UserProvider>
          <OnboardingProvider>
            <RecipeProvider>
              <MyRecipesProvider>
              <MealPlanProvider>
                <CalendarProvider>
                  <GroceryListProvider>
                    <FeedbackProvider>
                      <AgentProvider>
                        {children}
                      </AgentProvider>
                    </FeedbackProvider>
                  </GroceryListProvider>
                </CalendarProvider>
              </MealPlanProvider>
              </MyRecipesProvider>
            </RecipeProvider>
          </OnboardingProvider>
        </UserProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp>{children}</ThemedApp>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
