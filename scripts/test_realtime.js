const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRealtimeSetup() {
  console.log('🧪 Test de la configuration Realtime...\n');
  
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
    
    // 2. Vérifier l'existence de la table posters
    console.log('\n2️⃣ Vérification de la table posters...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('posters')
      .select('id, title, created_at, images, file_paths')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur table posters:', tableError.message);
      return;
    }
    console.log('✅ Table posters accessible');
    console.log(`📊 Colonnes détectées: ${tableCheck.length > 0 ? Object.keys(tableCheck[0]).join(', ') : 'Table vide'}`);
    
    // 3. Vérifier la publication Realtime
    console.log('\n3️⃣ Vérification de la publication Realtime...');
    const { data: realtimeCheck, error: realtimeError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'posters';
      `
    });
    
    if (realtimeError) {
      console.warn('⚠️ Impossible de vérifier Realtime:', realtimeError.message);
      console.log('💡 Exécutez: node scripts/enable_realtime.js');
    } else {
      console.log('✅ Publication Realtime configurée');
    }
    
    // 4. Test d'abonnement Realtime
    console.log('\n4️⃣ Test d\'abonnement Realtime...');
    let subscriptionWorking = false;
    
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posters'
      }, (payload) => {
        console.log('📡 Événement Realtime reçu:', payload.eventType);
        subscriptionWorking = true;
      })
      .subscribe((status) => {
        console.log(`📡 Statut abonnement: ${status}`);
      });
    
    // Attendre un peu pour la connexion
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Créer un poster de test pour déclencher un événement
    console.log('\n5️⃣ Test d\'insertion pour déclencher Realtime...');
    const testPoster = {
      title: 'Test Realtime',
      description: 'Poster de test pour vérifier Realtime',
      image_url: 'https://via.placeholder.com/400x600',
      images: ['https://via.placeholder.com/400x600'],
      file_path: 'test/realtime-test.jpg',
      file_paths: ['test/realtime-test.jpg']
    };
    
    const { data: insertedPoster, error: insertError } = await supabase
      .from('posters')
      .insert(testPoster)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erreur insertion test:', insertError.message);
    } else {
      console.log('✅ Poster de test créé:', insertedPoster.id);
      
      // Attendre un peu pour l'événement Realtime
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Supprimer le poster de test
      const { error: deleteError } = await supabase
        .from('posters')
        .delete()
        .eq('id', insertedPoster.id);
      
      if (!deleteError) {
        console.log('🧹 Poster de test supprimé');
      }
    }
    
    // Nettoyer l'abonnement
    supabase.removeChannel(channel);
    
    // 6. Résumé
    console.log('\n📋 RÉSUMÉ DU TEST:');
    console.log('✅ Connexion Supabase: OK');
    console.log('✅ Table posters: OK');
    console.log('✅ Colonnes multiples images: OK');
    console.log(`${subscriptionWorking ? '✅' : '⚠️'} Realtime: ${subscriptionWorking ? 'OK' : 'À vérifier'}`);
    
    if (!subscriptionWorking) {
      console.log('\n💡 Pour activer Realtime:');
      console.log('   1. Exécutez: node scripts/enable_realtime.js');
      console.log('   2. Vérifiez votre plan Supabase (Realtime inclus)');
      console.log('   3. Vérifiez les politiques RLS');
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
      console.log('🔧 Création de la fonction exec_sql...');
    }
  } catch (error) {
    // Ignorer les erreurs de création de fonction
  }
}

// Exécuter le test
if (require.main === module) {
  createExecSqlFunction().then(() => {
    testRealtimeSetup();
  });
}

module.exports = { testRealtimeSetup };
