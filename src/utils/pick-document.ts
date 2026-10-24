import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import type { Translate } from '@/i18n';

async function fromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.4 });
  if (res.canceled) return null;
  return res.assets[0]?.uri ?? null;
}

async function fromCamera(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchCameraAsync({ quality: 0.4 });
  if (res.canceled) return null;
  return res.assets[0]?.uri ?? null;
}

/** Lets the user photograph or pick a document image. Resolves to a local URI or null when cancelled. */
export function pickDocumentImage(t: Translate): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert(t('addDocument'), t('chooseSource'), [
      { text: t('takePhoto'), onPress: () => fromCamera().then(resolve) },
      { text: t('gallery'), onPress: () => fromLibrary().then(resolve) },
      { text: t('cancel'), style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}
