import { File } from 'expo-file-system';

import { supabase } from '@/services/supabase';

const BUCKET = 'documents';

/**
 * Uploads a local image to the public documents bucket and returns its public URL.
 * Falls back to the local URI when no backend is configured.
 */
export async function uploadDocumentImage(localUri: string, carrierId: string, docKey: string): Promise<string> {
  if (!supabase) return localUri;
  const bytes = await new File(localUri).arrayBuffer();
  const ext = localUri.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
  const contentType = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
  const path = `${carrierId}/${docKey}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: true });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
