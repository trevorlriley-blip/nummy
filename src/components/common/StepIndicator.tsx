import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i <= currentStep ? theme.colors.primary : theme.colors.outlineVariant,
              width: i === currentStep ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
