import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://grkuivwoquybkbzgoehz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdya3VpdndvcXV5YmtiemdvZWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkxMjUsImV4cCI6MjA3NDgzNTEyNX0.1IZMv_cb1xsAxO0oKp8fpETe1V8735G0E70rGI27NSc'
);

async function createAdminUser() {
  try {
    // 1. Tenter de créer l'utilisateur
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'Kossitegue0@gmail.com',
      password: 'Kossitegue0@gmail.com',
      options: {
        data: {
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        console.log('L\'utilisateur existe déjà');
        // Essayer de se connecter
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'Kossitegue0@gmail.com',
          password: 'Kossitegue0@gmail.com'
        });

        if (signInError) {
          console.error('Erreur de connexion:', signInError);
          return;
        }

        console.log('Connexion réussie:', signInData);
        return;
      }
      console.error('Erreur lors de la création:', signUpError);
      return;
    }

    console.log('Utilisateur créé avec succès:', signUpData);
    console.log('Veuillez vérifier votre email pour confirmer votre compte');

  } catch (error) {
    console.error('Erreur inattendue:', error);
  }
}

createAdminUser();