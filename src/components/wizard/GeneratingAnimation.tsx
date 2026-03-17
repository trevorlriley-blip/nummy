import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { LOADING_MESSAGES } from '../../data/wizardOptions';
import { spacing } from '../../theme/spacing';

const FOOD_ICONS = [
  'silverware-fork-knife',
  'pot-steam',
  'carrot',
  'pizza',
  'fruit-cherries',
  'food-apple',
] as const;

export function GeneratingAnimation() {
  const theme = useAppTheme();
  const [messageIndex, setMessageIndex] = useState(0);

  // Bounce animation for chef hat
  const bounceY = useSharedValue(0);
  useEffect(() => {
    bounceY.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceY.value }],
  }));

  // Rotation for food icon ring
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 10000, easing: Easing.linear }),
      -1
    );
  }, []);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Counter-rotation so icons stay upright
  const counterRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `-${rotation.value}deg` }],
  }));

  // Shimmer bar pulse
  const shimmer = useSharedValue(0.3);
  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  // Message cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Message fade
  const messageFade = useSharedValue(1);
  useEffect(() => {
    messageFade.value = 0;
    messageFade.value = withTiming(1, { duration: 500 });
  }, [messageIndex]);

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageFade.value,
  }));

  const orbitRadius = 80;

  return (
    <View style={styles.container}>
      <View style={styles.animationArea}>
        {/* Orbiting food icons */}
        <Animated.View style={[styles.orbitRing, rotationStyle]}>
          {FOOD_ICONS.map((icon, i) => {
            const angle = (i / FOOD_ICONS.length) * 2 * Math.PI;
            const x = Math.cos(angle) * orbitRadius;
            const y = Math.sin(angle) * orbitRadius;
            return (
              <Animated.View
                key={icon}
                style={[
                  styles.orbitIcon,
                  counterRotationStyle,
                  { left: orbitRadius + x - 16, top: orbitRadius + y - 16 },
                ]}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={28}
                  color={theme.colors.secondary}
                />
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Center chef hat */}
        <Animated.View style={[styles.centerIcon, bounceStyle]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="chef-hat"
              size={52}
              color={theme.colors.primary}
            />
          </View>
        </Animated.View>
      </View>

      {/* Status message */}
      <Animated.View style={messageStyle}>
        <Text
          variant="bodyLarge"
          style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
        >
          {LOADING_MESSAGES[messageIndex]}
        </Text>
      </Animated.View>

      {/* Shimmer bar */}
      <Animated.View
        style={[
          styles.shimmerBar,
          { backgroundColor: theme.colors.primary },
          shimmerStyle,
        ]}
      />

      <Text variant="labelMedium" style={[styles.hint, { color: theme.colors.outline }]}>
        This usually takes 30-60 seconds
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  animationArea: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  orbitRing: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  orbitIcon: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    zIndex: 1,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
    minHeight: 48,
  },
  shimmerBar: {
    width: 180,
    height: 4,
    borderRadius: 2,
    marginTop: spacing.lg,
  },
  hint: {
    marginTop: spacing.md,
  },
});
