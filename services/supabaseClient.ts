import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pgwulrcoukiqikgxrjuv.supabase.co';

export const getSupabaseKey = (): string => {
  const envKey = process.env.SUPABASE_ANON_KEY;
  const localKey = localStorage.getItem('SANKARA_SUPABASE_KEY');
  const fallbackKey = 'sb_publishable_N9N8RAp0eHf3VFD_ma75lw_EQZARkGW';
  return (envKey && envKey.length > 5) ? envKey : (localKey || fallbackKey);
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    const key = getSupabaseKey();
    supabaseInstance = createClient(supabaseUrl, key);
  }
  return supabaseInstance;
};

// Simple proxy that just ensures the client is initialized before use
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});