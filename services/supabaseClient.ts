
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pgwulrcoukiqikgxrjuv.supabase.co';

/**
 * Retrieves the Supabase Anon Key.
 * Priority: Environment Variable > Local Storage > Hardcoded Default
 */
export const getSupabaseKey = (): string => {
  return (
    process.env.SUPABASE_ANON_KEY || 
    localStorage.getItem('SANKARA_SUPABASE_KEY') || 
    'sb_publishable_N9N8RAp0eHf3VFD_ma75lw_EQZARkGW'
  );
};

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lazily initializes and returns the Supabase client.
 * Returns null if the key is missing instead of crashing.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  const key = getSupabaseKey();
  if (!supabaseUrl || !key) {
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
 * Methods will throw a specific error if called before the client is ready.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("SUPABASE_CLIENT_NOT_INITIALIZED");
    }
    return (client as any)[prop];
  }
});
