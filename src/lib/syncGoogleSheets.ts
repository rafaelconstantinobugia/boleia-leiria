import { supabase } from '@/integrations/supabase/client';

type SyncType = 'offer' | 'request' | 'match';

/**
 * Strips edit tokens from a record before sending to Google Sheets.
 */
function stripTokens(record: Record<string, unknown>): Record<string, unknown> {
  const clean = { ...record };
  delete clean.edit_token;
  return clean;
}

export async function syncToGoogleSheets(type: SyncType, record: Record<string, unknown>) {
  try {
    const cleanRecord = stripTokens(record);
    const { data, error } = await supabase.functions.invoke('sync-google-sheets', {
      body: { type, record: cleanRecord },
    });

    if (error) {
      console.error('Google Sheets sync error:', error.message);
      return { success: false, error: error.message };
    }

    return data as { success: boolean; result?: unknown; error?: string };
  } catch (error) {
    console.error('Google Sheets sync failed (soft):', error);
    return { success: false, error: 'sync exception' };
  }
}

/**
 * Bulk sync: only sends records that haven't been synced yet.
 * Requires admin PIN for authorization.
 */
export async function bulkSyncToSheets(pin: string): Promise<{ success: boolean; synced?: { requests: number; offers: number; matches: number }; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('sync-google-sheets', {
      body: { type: 'bulk_sync', pin },
    });

    if (error) return { success: false, error: error.message };
    if (data?.success) return { success: true, synced: data.synced };
    return { success: false, error: data?.error || 'Unknown error' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
