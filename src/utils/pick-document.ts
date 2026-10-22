import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

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
export function pickDocumentImage(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert('Ajouter le document', 'Choisissez la source', [
      { text: 'Prendre une photo', onPress: () => fromCamera().then(resolve) },
      { text: 'Galerie', onPress: () => fromLibrary().then(resolve) },
      { text: 'Annuler', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}
