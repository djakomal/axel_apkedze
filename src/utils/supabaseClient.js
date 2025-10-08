import { createClient } from '@supabase/supabase-js';

// Valeurs par défaut pour éviter l'écran de configuration
let supabaseUrl = 'https://grkuivwoquybkbzgoehz.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdya3VpdndvcXV5YmtiemdvZWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkxMjUsImV4cCI6MjA3NDgzNTEyNX0.1IZMv_cb1xsAxO0oKp8fpETe1V8735G0E70rGI27NSc';
const isSupabaseEnvConfigured = true; // Forcer la configuration

// Secondary sources: window.__APP_CONFIG__ and localStorage (dev-only helpers)
try {
  if ((!supabaseUrl || !supabaseKey) && typeof window !== 'undefined') {
    const winCfg = window.__APP_CONFIG__ || {};
    supabaseUrl = supabaseUrl || winCfg.VITE_SUPABASE_URL || '';
    supabaseKey = supabaseKey || winCfg.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      const lsUrl = window.localStorage?.getItem('VITE_SUPABASE_URL') || window.localStorage?.getItem('SUPABASE_URL') || '';
      const lsKey = window.localStorage?.getItem('VITE_SUPABASE_ANON_KEY') || window.localStorage?.getItem('SUPABASE_ANON_KEY') || '';
      supabaseUrl = supabaseUrl || lsUrl;
      supabaseKey = supabaseKey || lsKey;
    }
  }
} catch (_) {
  // ignore
}

// Diagnostic (ne logge pas les secrets)
try {
  const hasUrl = Boolean(supabaseUrl);
  const hasKey = Boolean(supabaseKey);
  // eslint-disable-next-line no-console
  console.debug('[Supabase] Config loaded:', { url: hasUrl ? 'present' : 'missing', key: hasKey ? 'present' : 'missing' });
} catch (_) {
  // ignore
}

// Provide a safe no-op client to prevent crashes when env vars are missing
function createNoopClient() {
  const error = new Error('Supabase not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  const asyncErr = async () => ({ data: null, error });
  const table = () => ({
    select: asyncErr,
    insert: asyncErr,
    update: asyncErr,
    delete: asyncErr,
    order: () => ({ select: asyncErr }),
    eq: () => ({ select: asyncErr, update: asyncErr, delete: asyncErr }),
    gte: () => ({ select: asyncErr, delete: asyncErr, order: () => ({ select: asyncErr }) }),
    lte: () => ({ select: asyncErr, delete: asyncErr }),
    range: () => ({ select: asyncErr }),
    limit: () => ({ select: asyncErr })
  });

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: asyncErr,
      signInWithPassword: asyncErr,
    },
    from: table,
    storage: {
      from: () => ({
        upload: asyncErr,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: asyncErr,
      })
    },
    channel: () => ({ on: () => ({}), subscribe: () => 'NOOP' }),
    removeChannel: () => {},
    rpc: asyncErr,
  };
}

let supabase;
// Augmenter le timeout par défaut pour les uploads de fichiers volumineux
const DEFAULT_TIMEOUT_MS = 30000; // 30 secondes au lieu de 12 secondes
const UPLOAD_TIMEOUT_MS = 120000; // 2 minutes pour les uploads

function timeoutFetch(resource, options = {}) {
  // Gestion améliorée des signaux d'abandon
  const controller = new AbortController();
  const originalSignal = options.signal;
  
  // Déterminer si c'est une requête d'upload (pour ajuster le timeout)
  const isUploadRequest = 
    resource.toString().includes('/storage/v1/object/') && 
    (options.method === 'POST' || options.method === 'PUT');
  
  // Utiliser un timeout plus long pour les uploads
  const timeoutDuration = isUploadRequest 
    ? (options.timeout || UPLOAD_TIMEOUT_MS) // 2 minutes pour les uploads
    : (options.timeout || DEFAULT_TIMEOUT_MS);
  
  // Créer un nouveau signal qui combine le timeout et le signal original
  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException("Request timed out", "TimeoutError"));
  }, timeoutDuration);
  
  // Si un signal original existe, l'écouter pour propager l'abandon
  if (originalSignal) {
    if (originalSignal.aborted) {
      clearTimeout(timeoutId);
      controller.abort(originalSignal.reason || "Request aborted");
    } else {
      originalSignal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        controller.abort(originalSignal.reason || "Request aborted");
      });
    }
  }
  
  // Fusionner les options en préservant le signal original mais en utilisant notre controller
  const merged = { ...options, signal: controller.signal };
  
  // Ajouter une gestion d'erreur réseau améliorée
  return fetch(resource, merged)
    .catch(error => {
      // Intercepter les erreurs réseau et les transformer en erreurs plus explicites
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.');
      }
      throw error;
    })
    .finally(() => clearTimeout(timeoutId));
}
const isSupabaseConfigured = true; // Forcer la configuration à true
// Toujours créer le client Supabase avec les valeurs disponibles
supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: timeoutFetch },
});

export { supabase, isSupabaseConfigured, isSupabaseEnvConfigured };