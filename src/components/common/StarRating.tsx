import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({
  rating,
  size = 20,
  interactive = false,
  onRate,
}: StarRatingProps) {
  const theme = useAppTheme();

  const stars = [1, 2, 3, 4, 5];

  const handlePress = (starValue: number) => {
    if (interactive && onRate) {
      onRate(starValue);
    }
  };

  return (
    <View style={styles.container}>
      {stars.map((starValue) => {
        const filled = rating >= starValue;
        const halfFilled = !filled && rating >= starValue - 0.5;

        const iconName = filled
          ? 'star'
          : halfFilled
            ? 'star-half-full'
            : 'star-outline';

        const starColor = filled || halfFilled
          ? '#D4A017'
          : theme.colors.outlineVariant;

        const StarIcon = (
          <MaterialCommunityIcons
            name={iconName}
            size={size}
            color={starColor}
          />
        );

        if (interactive) {
          return (
            <Pressable
              key={starValue}
              onPress={() => handlePress(starValue)}
              hitSlop={4}
            >
              {StarIcon}
            </Pressable>
          );
        }

        return (
          <View key={starValue}>
            {StarIcon}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
