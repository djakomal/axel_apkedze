const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnosePosterCreation() {
  console.log('🔍 Diagnostic de la création de posters...\n');
  
  try {
    // 1. Vérifier la connexion à Supabase
    console.log('1️⃣ Test de connexion Supabase...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('posters')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Erreur de connexion:', connectionError.message);
      return;
    }
    console.log('✅ Connexion Supabase OK');
    
    // 2. Vérifier la structure de la table posters
    console.log('\n2️⃣ Vérification de la structure de la table posters...');
    const { data: tableStructure, error: structureError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'posters' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });
    
    if (structureError) {
      console.warn('⚠️ Impossible de vérifier la structure:', structureError.message);
    } else {
      console.log('📋 Structure de la table posters:');
      tableStructure?.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    
    // 3. Vérifier l'existence du bucket de stockage
    console.log('\n3️⃣ Vérification du bucket de stockage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erreur récupération buckets:', bucketsError.message);
    } else {
      const postersBucket = buckets.find(bucket => bucket.name === 'posters');
      if (postersBucket) {
        console.log('✅ Bucket "posters" trouvé:', {
          id: postersBucket.id,
          public: postersBucket.public,
          file_size_limit: postersBucket.file_size_limit
        });
      } else {
        console.error('❌ Bucket "posters" non trouvé');
        console.log('📦 Buckets disponibles:', buckets.map(b => b.name));
      }
    }
    
    // 4. Tester les permissions sur la table posters
    console.log('\n4️⃣ Test des permissions sur la table posters...');
    try {
      const { data: permTest, error: permError } = await supabase
        .from('posters')
        .select('*')
        .limit(1);
      
      if (permError) {
        console.error('❌ Erreur permissions lecture:', permError.message);
      } else {
        console.log('✅ Permissions de lecture OK');
      }
    } catch (error) {
      console.error('❌ Erreur test permissions:', error.message);
    }
    
    // 5. Tester l'insertion d'un poster de test
    console.log('\n5️⃣ Test d\'insertion d\'un poster...');
    const testPoster = {
      title: 'Test Diagnostic',
      description: 'Poster de test pour diagnostic',
      image_url: 'https://via.placeholder.com/400x600',
      images: ['https://via.placeholder.com/400x600'],
      file_path: 'test/diagnostic.jpg',
      file_paths: ['test/diagnostic.jpg'],
      created_at: new Date().toISOString()
    };
    
    const { data: insertedPoster, error: insertError } = await supabase
      .from('posters')
      .insert(testPoster)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erreur insertion test:', insertError.message);
      console.error('📋 Détails erreur:', insertError);
    } else {
      console.log('✅ Insertion test réussie:', insertedPoster.id);
      
      // Nettoyer le poster de test
      const { error: deleteError } = await supabase
        .from('posters')
        .delete()
        .eq('id', insertedPoster.id);
      
      if (!deleteError) {
        console.log('🧹 Poster de test supprimé');
      }
    }
    
    // 6. Vérifier les politiques RLS
    console.log('\n6️⃣ Vérification des politiques RLS...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
        FROM pg_policies 
        WHERE tablename = 'posters';
      `
    });
    
    if (policiesError) {
      console.warn('⚠️ Impossible de vérifier les politiques RLS:', policiesError.message);
    } else {
      console.log('🔒 Politiques RLS sur la table posters:');
      if (policies && policies.length > 0) {
        policies.forEach(policy => {
          console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.permissive})`);
        });
      } else {
        console.log('   Aucune politique RLS trouvée');
      }
    }
    
    // 7. Compter les posters existants
    console.log('\n7️⃣ Comptage des posters existants...');
    const { count, error: countError } = await supabase
      .from('posters')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur comptage:', countError.message);
    } else {
      console.log(`📊 Nombre total de posters: ${count}`);
    }
    
    // Résumé
    console.log('\n📋 RÉSUMÉ DU DIAGNOSTIC:');
    console.log('✅ Connexion Supabase: OK');
    console.log(`${postersBucket ? '✅' : '❌'} Bucket de stockage: ${postersBucket ? 'OK' : 'MANQUANT'}`);
    console.log(`${insertError ? '❌' : '✅'} Insertion posters: ${insertError ? 'ERREUR' : 'OK'}`);
    console.log(`📊 Posters existants: ${count || 0}`);
    
    if (insertError) {
      console.log('\n💡 ACTIONS RECOMMANDÉES:');
      console.log('1. Vérifiez les politiques RLS sur la table posters');
      console.log('2. Assurez-vous que l\'utilisateur a les permissions d\'insertion');
      console.log('3. Vérifiez que toutes les colonnes requises existent');
      console.log('4. Exécutez la migration: node scripts/run_migration_7.js');
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Fonction helper pour exécuter du SQL brut
async function createExecSqlFunction() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS json
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result json;
        BEGIN
          EXECUTE sql;
          GET DIAGNOSTICS result = ROW_COUNT;
          RETURN result;
        EXCEPTION WHEN OTHERS THEN
          RETURN json_build_object('error', SQLERRM);
        END;
        $$;
      `
    });
    
    if (error && !error.message.includes('already exists')) {
      console.log('🔧 Création de la fonction exec_sql...');
    }
  } catch (error) {
    // Ignorer les erreurs de création de fonction
  }
}

// Exécuter le diagnostic
if (require.main === module) {
  createExecSqlFunction().then(() => {
    diagnosePosterCreation();
  });
}

module.exports = { diagnosePosterCreation };
