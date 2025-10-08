const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableRealtime() {
  try {
    console.log('🔄 Activation de Realtime pour la table posters...');
    
    // Activer Realtime sur la table posters
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Activer Realtime sur la table posters
        ALTER PUBLICATION supabase_realtime ADD TABLE public.posters;
        
        -- Vérifier que la publication existe et contient notre table
        SELECT schemaname, tablename 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'posters';
      `
    });
    
    if (error) {
      console.error('❌ Erreur lors de l\'activation de Realtime:', error);
      
      // Essayer une approche alternative
      console.log('🔄 Tentative d\'approche alternative...');
      
      const { error: altError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Créer la publication si elle n'existe pas
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
              CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
            END IF;
          END
          $$;
          
          -- Ajouter la table à la publication
          ALTER PUBLICATION supabase_realtime ADD TABLE public.posters;
        `
      });
      
      if (altError) {
        console.error('❌ Erreur avec l\'approche alternative:', altError);
        process.exit(1);
      }
    }
    
    console.log('✅ Realtime activé avec succès pour la table posters !');
    console.log('📡 Les changements sur les posters seront maintenant diffusés en temps réel');
    console.log('🔧 Fonctionnalités activées:');
    console.log('   - Ajout de nouveaux posters');
    console.log('   - Modification de posters existants');
    console.log('   - Suppression de posters');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    process.exit(1);
  }
}

// Fonction helper pour exécuter du SQL brut
async function createExecSqlFunction() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `
  });
  
  if (error && !error.message.includes('already exists')) {
    console.log('Création de la fonction exec_sql...');
  }
}

// Exécuter l'activation
if (require.main === module) {
  createExecSqlFunction().then(() => {
    enableRealtime();
  });
}

module.exports = { enableRealtime };
