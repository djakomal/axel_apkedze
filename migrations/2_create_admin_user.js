import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://grkuivwoquybkbzgoehz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdya3VpdndvcXV5YmtiemdvZWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkxMjUsImV4cCI6MjA3NDgzNTEyNX0.1IZMv_cb1xsAxO0oKp8fpETe1V8735G0E70rGI27NSc'
);

async function createAdminUser() {
  try {
    // 1. Vérifier si l'utilisateur existe déjà
    const { data: { user: existingUser }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'tchabikossi0@gmail.com',
      password: 'tchabikossi0@gmail.com'
    });

    if (!signInError && existingUser) {
      console.log('✓ L\'utilisateur existe déjà et peut se connecter');
      return;
    }

    // 2. Si l'utilisateur n'existe pas, le créer normalement
    const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
      email: 'tchabikossi0@gmail.com',
      password: 'tchabikossi0@gmail.com'
    });

    if (signUpError) {
      console.error('✗ Erreur lors de la création:', signUpError.message);
      return;
    }

    if (newUser) {
      console.log('✓ Utilisateur créé avec succès');
      console.log('⚠️ Important : Connectez-vous à l\'application avec :');
      console.log('   Email: tchabikossi0@gmail.com');
      console.log('   Mot de passe: tchabikossi0@gmail.com');
      console.log('   Le rôle admin sera attribué lors de votre première connexion');
    }

  } catch (error) {
    console.error('✗ Erreur inattendue:', error);
  }
}

createAdminUser();