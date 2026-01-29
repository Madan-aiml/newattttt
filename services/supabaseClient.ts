
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pgwulrcoukiqikgxrjuv.supabase.co';

/**
 * Retrieves the Supabase Anon Key.
 */
export const getSupabaseKey = (): string => {
  // Use a string literal for the environment variable to ensure it's replaced by Vite
  const envKey = process.env.SUPABASE_ANON_KEY;
  const localKey = localStorage.getItem('SANKARA_SUPABASE_KEY');
  const fallbackKey = 'sb_publishable_N9N8RAp0eHf3VFD_ma75lw_EQZARkGW';
  
  return envKey || localKey || fallbackKey;
};

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lazily initializes and returns the Supabase client.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  const key = getSupabaseKey();
  if (!supabaseUrl || !key || key.length < 10) {
    return null;
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, key);
    } catch (e) {
      console.error("Supabase Initialization Error:", e);
      return null;
    }
  }
  
  return supabaseInstance;
};

/**
 * Proxy object for the Supabase client.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return a dummy object with dummy methods to prevent crash before config
      return () => ({
        select: () => ({ maybeSingle: () => ({ data: null, error: null }), eq: () => ({ maybeSingle: () => ({ data: null, error: null }) }) }),
        from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => ({ data: null, error: null }) }), maybeSingle: () => ({ data: null, error: null }) }), insert: () => ({}), update: () => ({ eq: () => ({}) }), delete: () => ({ eq: () => ({}) }) })
      });
    }
    return (client as any)[prop];
  }
});
