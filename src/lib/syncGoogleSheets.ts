import { supabase } from '@/integrations/supabase/client';

export async function syncToGoogleSheets(type: 'offer' | 'request', record: Record<string, unknown>) {
  try {
    await supabase.functions.invoke('sync-google-sheets', {
      body: { type, record },
    });
  } catch (error) {
    // Don't block the main flow if sync fails
    console.error('Google Sheets sync failed:', error);
  }
}
