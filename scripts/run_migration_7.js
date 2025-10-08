const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Exécution de la migration 7: Support des images multiples...');
    
    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '..', 'migrations', '7_add_multiple_images_support.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Exécuter la migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erreur lors de l\'exécution de la migration:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration 7 exécutée avec succès !');
    console.log('📊 Colonnes ajoutées:');
    console.log('   - images (TEXT[]): Array des URLs d\'images');
    console.log('   - file_paths (TEXT[]): Array des chemins de fichiers');
    console.log('🔄 Données existantes migrées automatiquement');
    
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

// Exécuter la migration
if (require.main === module) {
  createExecSqlFunction().then(() => {
    runMigration();
  });
}

module.exports = { runMigration };
