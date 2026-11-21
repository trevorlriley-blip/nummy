import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { usePantry } from '../contexts/PantryContext';
import { PantryItem } from '../types/pantry';
import { logEvent } from '../utils/testLog';

const MAX_PHOTOS = 4;

interface Photo {
  imageBase64: string;
  mimeType: string;
}

function ask(title: string, message: string, buttons: string[]): Promise<string> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      buttons.map((label) => ({
        text: label,
        style: label === 'Cancel' ? 'cancel' : 'default',
        onPress: () => resolve(label),
      })),
      { cancelable: true, onDismiss: () => resolve('Cancel') }
    );
  });
}

function toPhotos(assets: ImagePicker.ImagePickerAsset[]): Photo[] {
  return assets
    .filter((a) => a.base64)
    .map((a) => ({ imageBase64: a.base64 as string, mimeType: a.mimeType ?? 'image/jpeg' }));
}

/**
 * Picks up to 4 photos, sends them for analysis, and opens the review screen.
 * Photos live only in memory for the duration of the call — they are never
 * persisted or kept in state; only the resulting item list is.
 */
export function usePantryCapture() {
  const router = useRouter();
  const { session } = useAuth();
  const { startDraft } = usePantry();
  const [isScanning, setIsScanning] = useState(false);

  const takePhotos = async (): Promise<Photo[]> => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Allow camera access in Settings to snap your fridge.');
      return [];
    }
    const photos: Photo[] = [];
    while (photos.length < MAX_PHOTOS) {
      const result = await ImagePicker.launchCameraAsync({ quality: 0.4, base64: true });
      if (result.canceled) break;
      photos.push(...toPhotos(result.assets));
      if (photos.length >= MAX_PHOTOS) break;
      const next = await ask('Add another photo?', `${photos.length} of ${MAX_PHOTOS} taken`, [
        'Add another',
        'Done',
      ]);
      if (next !== 'Add another') break;
    }
    return photos;
  };

  const chooseFromLibrary = async (): Promise<Photo[]> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Allow photo access in Settings to choose pictures.');
      return [];
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.4,
      base64: true,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS,
    });
    return result.canceled ? [] : toPhotos(result.assets).slice(0, MAX_PHOTOS);
  };

  const start = useCallback(async () => {
    if (isScanning) return;
    const source = await ask('Snap fridge & pantry', `Add up to ${MAX_PHOTOS} photos.`, [
      'Take photo',
      'Choose from library',
      'Cancel',
    ]);
    if (source === 'Cancel') return;

    setIsScanning(true);
    try {
      const photos = source === 'Take photo' ? await takePhotos() : await chooseFromLibrary();
      if (photos.length === 0) return;

      const token = session?.access_token;
      if (!token) {
        Alert.alert('Please sign in again', 'Your session has expired. Sign out and back in, then try again.');
        return;
      }

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL ?? ''}/api/scan-pantry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ images: photos }),
      });

      if (res.status === 401) {
        Alert.alert('Please sign in again', 'Your session has expired. Sign out and back in, then try again.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert("Couldn't scan photos", data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      const stamp = Date.now();
      const items: PantryItem[] = (data.items ?? []).map((it: Omit<PantryItem, 'id'>, i: number) => ({
        ...it,
        id: `pantry-item-${stamp}-${i}`,
      }));
      logEvent('snapshot_taken', { photoCount: photos.length, itemsFound: items.length });

      if (items.length === 0) {
        Alert.alert('No food spotted', 'Try again with the shelves clearly in view.');
        return;
      }
      startDraft(items, data.useFirst ?? []);
      router.push('/(tabs)/grocery/pantry-review' as any);
    } catch {
      Alert.alert("Couldn't scan photos", 'Check your connection and try again.');
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, session?.access_token, startDraft, router]);

  return { start, isScanning };
}
