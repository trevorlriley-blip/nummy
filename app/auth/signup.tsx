import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useAuth } from '../../src/contexts/AuthContext';
import { spacing } from '../../src/theme/spacing';

export default function SignUpScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);

  const handleSignUp = async () => {
    setError('');

    if (!displayName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(email.trim(), password, displayName.trim());
    setLoading(false);
    if (signUpError) setError(signUpError);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons name="food-variant" size={48} color={theme.colors.primary} />
              </View>
              <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
                Create Account
              </Text>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                Join Nummy to get started
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                label="Display Name"
                mode="outlined"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
                left={<TextInput.Icon icon="account-outline" />}
                style={styles.input}
              />

              <TextInput
                label="Email"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
              />

              <TextInput
                label="Password"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureEntry}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock-outline" />}
                right={<TextInput.Icon icon={secureEntry ? 'eye-off' : 'eye'} onPress={() => setSecureEntry(!secureEntry)} />}
                style={styles.input}
              />

              <TextInput
                label="Confirm Password"
                mode="outlined"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={secureEntry}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock-check-outline" />}
                style={styles.input}
              />

              {error ? (
                <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: spacing.xs }}>
                  {error}
                </Text>
              ) : null}

              <Button
                mode="contained"
                onPress={handleSignUp}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Create Account
              </Button>
            </View>
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Already have an account?{' '}
            </Text>
            <Button
              mode="text"
              compact
              onPress={() => router.back()}
              labelStyle={{ marginHorizontal: 0 }}
            >
              Sign In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: spacing.md,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
});
