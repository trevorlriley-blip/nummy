import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, IconButton, TextInput } from 'react-native-paper';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useOrdering } from '../../contexts/OrderingContext';
import { spacing } from '../../theme/spacing';

/** Family members can quickly ask for something to be added to the order. */
export function RequestsCard() {
  const theme = useAppTheme();
  const { requests, addRequest, removeRequest } = useOrdering();
  const [requester, setRequester] = useState('');
  const [item, setItem] = useState('');

  const canAdd = requester.trim().length > 0 && item.trim().length > 0;

  const add = () => {
    if (!canAdd) return;
    addRequest(requester, item);
    setItem(''); // keep the name so several items can be added in a row
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
        Requests {requests.length > 0 ? `(${requests.length})` : ''}
      </Text>

      {requests.map((r) => (
        <View key={r.id} style={styles.requestRow}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
            {r.item}
            <Text style={{ color: theme.colors.onSurfaceVariant }}>  · {r.requester}</Text>
          </Text>
          <IconButton size={18} icon="close" accessibilityLabel={`Remove ${r.item}`} onPress={() => removeRequest(r.id)} />
        </View>
      ))}

      <View style={styles.form}>
        <TextInput
          mode="outlined"
          dense
          placeholder="Who's asking?"
          value={requester}
          onChangeText={setRequester}
          style={styles.who}
        />
        <TextInput
          mode="outlined"
          dense
          placeholder="Item"
          value={item}
          onChangeText={setItem}
          onSubmitEditing={add}
          returnKeyType="done"
          autoCapitalize="none"
          style={styles.what}
        />
        <Button mode="contained-tonal" compact onPress={add} disabled={!canAdd}>
          Add
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs },
  requestRow: { flexDirection: 'row', alignItems: 'center' },
  form: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  who: { flex: 2 },
  what: { flex: 3 },
});
