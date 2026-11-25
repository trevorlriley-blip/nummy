import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Bar } from '../../utils/recap';

interface Props {
  bars: Bar[];
  color: string;
  mutedColor: string;
  textColor: string;
}

const MAX_HEIGHT = 140;

/** Plain-View bar chart of items tossed per week; the baseline is the first bar. */
export function TossedBars({ bars, color, mutedColor, textColor }: Props) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <View style={styles.row}>
      {bars.map((b, i) => (
        <View key={`${b.label}-${i}`} style={styles.col}>
          <Text variant="labelLarge" style={{ color: textColor }}>{b.value}</Text>
          <View
            style={{
              width: '70%',
              height: Math.max(4, (b.value / max) * MAX_HEIGHT),
              borderRadius: 6,
              backgroundColor: b.isBaseline ? mutedColor : color,
              opacity: b.isBaseline || b.isCurrent ? 1 : 0.6,
            }}
          />
          <Text variant="labelSmall" style={{ color: textColor, opacity: b.isBaseline ? 1 : 0.8 }} numberOfLines={1}>
            {b.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: MAX_HEIGHT + 56, gap: 4 },
  col: { flex: 1, maxWidth: 64, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
});
