import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';

interface ChipOption {
  value: string;
  label: string;
  icon?: string;
}

interface ChipSelectorProps {
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function ChipSelector({ options, selected, onToggle }: ChipSelectorProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <Chip
            key={opt.value}
            selected={isSelected}
            onPress={() => onToggle(opt.value)}
            icon={opt.icon as any}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? theme.colors.primaryContainer
                  : theme.colors.surfaceVariant,
              },
            ]}
            textStyle={{
              color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
            }}
            showSelectedOverlay={false}
          >
            {opt.label}
          </Chip>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
});
