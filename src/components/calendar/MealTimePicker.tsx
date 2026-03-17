import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, IconButton, Modal, Portal } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { TimeOfDay } from '../../types/calendar';
import { spacing, borderRadius } from '../../theme/spacing';

interface MealTimePickerProps {
  visible: boolean;
  label: string;
  value: TimeOfDay;
  onConfirm: (time: TimeOfDay) => void;
  onDismiss: () => void;
}

function to12Hour(hour24: number): { hour: number; period: 'AM' | 'PM' } {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  let hour = hour24 % 12;
  if (hour === 0) hour = 12;
  return { hour, period };
}

function to24Hour(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

const MINUTE_OPTIONS = [0, 15, 30, 45];

export function MealTimePicker({ visible, label, value, onConfirm, onDismiss }: MealTimePickerProps) {
  const theme = useAppTheme();
  const initial12 = to12Hour(value.hour);

  const [hour, setHour] = useState(initial12.hour);
  const [minuteIndex, setMinuteIndex] = useState(
    MINUTE_OPTIONS.indexOf(value.minute) >= 0 ? MINUTE_OPTIONS.indexOf(value.minute) : 0
  );
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial12.period);

  // Reset state when modal opens with new value
  React.useEffect(() => {
    if (visible) {
      const h12 = to12Hour(value.hour);
      setHour(h12.hour);
      setMinuteIndex(
        MINUTE_OPTIONS.indexOf(value.minute) >= 0 ? MINUTE_OPTIONS.indexOf(value.minute) : 0
      );
      setPeriod(h12.period);
    }
  }, [visible, value.hour, value.minute]);

  const handleConfirm = () => {
    onConfirm({
      hour: to24Hour(hour, period),
      minute: MINUTE_OPTIONS[minuteIndex],
    });
  };

  const incrementHour = () => setHour((prev) => (prev >= 12 ? 1 : prev + 1));
  const decrementHour = () => setHour((prev) => (prev <= 1 ? 12 : prev - 1));
  const incrementMinute = () => setMinuteIndex((prev) => (prev + 1) % MINUTE_OPTIONS.length);
  const decrementMinute = () => setMinuteIndex((prev) => (prev - 1 + MINUTE_OPTIONS.length) % MINUTE_OPTIONS.length);
  const togglePeriod = () => setPeriod((prev) => (prev === 'AM' ? 'PM' : 'AM'));

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          {label}
        </Text>

        <View style={styles.pickerRow}>
          {/* Hour */}
          <View style={styles.column}>
            <IconButton
              icon="chevron-up"
              size={28}
              iconColor={theme.colors.primary}
              onPress={incrementHour}
            />
            <View style={[styles.valueBox, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text variant="headlineMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}>
                {hour}
              </Text>
            </View>
            <IconButton
              icon="chevron-down"
              size={28}
              iconColor={theme.colors.primary}
              onPress={decrementHour}
            />
          </View>

          <Text variant="headlineMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: -4 }}>
            :
          </Text>

          {/* Minute */}
          <View style={styles.column}>
            <IconButton
              icon="chevron-up"
              size={28}
              iconColor={theme.colors.primary}
              onPress={incrementMinute}
            />
            <View style={[styles.valueBox, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text variant="headlineMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}>
                {String(MINUTE_OPTIONS[minuteIndex]).padStart(2, '0')}
              </Text>
            </View>
            <IconButton
              icon="chevron-down"
              size={28}
              iconColor={theme.colors.primary}
              onPress={decrementMinute}
            />
          </View>

          {/* AM/PM */}
          <View style={styles.column}>
            <IconButton
              icon="chevron-up"
              size={28}
              iconColor={theme.colors.primary}
              onPress={togglePeriod}
            />
            <View style={[styles.valueBox, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Text variant="headlineMedium" style={{ color: theme.colors.onSecondaryContainer, fontWeight: '700' }}>
                {period}
              </Text>
            </View>
            <IconButton
              icon="chevron-down"
              size={28}
              iconColor={theme.colors.primary}
              onPress={togglePeriod}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button mode="outlined" onPress={onDismiss} style={styles.actionButton}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleConfirm} style={styles.actionButton}>
            Confirm
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  column: {
    alignItems: 'center',
  },
  valueBox: {
    width: 72,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
});
