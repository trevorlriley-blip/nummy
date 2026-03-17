import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { UserProfile, UserPreferences } from '../types/user';
import { sampleUser } from '../data/userProfile';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { useAuth } from './AuthContext';
import { dbSelect, dbUpsert } from '../lib/supabase';

interface UserContextValue {
  user: UserProfile;
  isProfileLoaded: boolean;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  setOnboardingComplete: (complete: boolean) => void;
  resetProfile: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, session } = useAuth();
  const [user, setUser] = useState<UserProfile>(sampleUser);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authUser) {
      setUser(sampleUser);
      setIsProfileLoaded(true);
      return;
    }

    setIsProfileLoaded(false);

    const loadProfile = async () => {
      // Try Supabase REST API first
      const profile = await dbSelect<any>(
        'profiles',
        `id=eq.${authUser.id}`,
        session?.access_token,
      );

      if (profile && profile.onboarding_complete !== undefined) {
        const loaded: UserProfile = {
          id: authUser.id,
          displayName: profile.display_name || authUser.user_metadata?.display_name || '',
          email: authUser.email || '',
          avatarUri: profile.avatar_uri || undefined,
          preferences: (() => {
            const stored = (profile.preferences as Partial<UserPreferences> | null) || {};
            const merged = { ...sampleUser.preferences, ...stored };
            // Guard against null values that may have been saved from older app versions
            return {
              ...merged,
              mealsToInclude: Array.isArray(merged.mealsToInclude) ? merged.mealsToInclude : sampleUser.preferences.mealsToInclude,
              dietaryRestrictions: Array.isArray(merged.dietaryRestrictions) ? merged.dietaryRestrictions : [],
              allergies: Array.isArray(merged.allergies) ? merged.allergies : [],
              healthIssues: Array.isArray(merged.healthIssues) ? merged.healthIssues : [],
              dietaryGoals: Array.isArray(merged.dietaryGoals) ? merged.dietaryGoals : [],
              foodAversions: Array.isArray(merged.foodAversions) ? merged.foodAversions : [],
              cookingMethods: Array.isArray(merged.cookingMethods) ? merged.cookingMethods : [],
            };
          })(),
          favoriteRecipeIds: profile.favorite_recipe_ids || [],
          onboardingComplete: profile.onboarding_complete,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        };
        setUser(loaded);
        await saveToStorage(STORAGE_KEYS.USER_PROFILE, loaded);
        setIsProfileLoaded(true);
        return;
      }

      // Fallback to AsyncStorage
      const stored = await loadFromStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      if (stored && stored.id === authUser.id) {
        setUser({
          ...sampleUser,
          ...stored,
          preferences: { ...sampleUser.preferences, ...stored.preferences },
        });
        setIsProfileLoaded(true);
        return;
      }

      // New user — use defaults with auth info
      setUser({
        ...sampleUser,
        id: authUser.id,
        displayName: authUser.user_metadata?.display_name || '',
        email: authUser.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsProfileLoaded(true);
    };

    loadProfile();
  }, [authUser?.id]);

  // Save to AsyncStorage immediately + Supabase debounced
  useEffect(() => {
    if (!isProfileLoaded || !user.id) return;

    saveToStorage(STORAGE_KEYS.USER_PROFILE, user);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dbUpsert('profiles', {
        id: user.id,
        display_name: user.displayName,
        avatar_uri: user.avatarUri || null,
        preferences: user.preferences,
        favorite_recipe_ids: user.favoriteRecipeIds,
        onboarding_complete: user.onboardingComplete,
        updated_at: new Date().toISOString(),
      }, session?.access_token);
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, isProfileLoaded]);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setUser((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const toggleFavorite = useCallback((recipeId: string) => {
    setUser((prev) => {
      const isFav = prev.favoriteRecipeIds.includes(recipeId);
      return {
        ...prev,
        favoriteRecipeIds: isFav
          ? prev.favoriteRecipeIds.filter((id) => id !== recipeId)
          : [...prev.favoriteRecipeIds, recipeId],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const isFavorite = useCallback(
    (recipeId: string) => user.favoriteRecipeIds.includes(recipeId),
    [user.favoriteRecipeIds]
  );

  const setOnboardingComplete = useCallback((complete: boolean) => {
    setUser((prev) => ({
      ...prev,
      onboardingComplete: complete,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const resetProfile = useCallback(() => {
    if (authUser) {
      setUser({
        ...sampleUser,
        id: authUser.id,
        displayName: authUser.user_metadata?.display_name || '',
        email: authUser.email || '',
        onboardingComplete: false,
      });
    } else {
      setUser({ ...sampleUser, onboardingComplete: false });
    }
  }, [authUser]);

  return (
    <UserContext.Provider
      value={{ user, isProfileLoaded, updatePreferences, toggleFavorite, isFavorite, setOnboardingComplete, resetProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
