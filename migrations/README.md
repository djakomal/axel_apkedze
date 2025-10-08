# Configuration de l'administrateur

Ce dossier contient les scripts nécessaires pour configurer l'administrateur de l'application.

## Structure des fichiers

- `1_create_table.sql` : Crée la table user_profiles et ses triggers
- `2_create_admin_user.js` : Crée l'utilisateur administrateur dans auth.users
- `3_confirm_admin.sql` : Confirme l'email de l'administrateur
- `4_setup_policies_and_admin_profile.sql` : Configure les politiques RLS et crée le profil administrateur

## Procédure d'installation

1. Ouvrir l'éditeur SQL de Supabase et exécuter `1_create_table.sql`
2. Dans le terminal, exécuter : `node migrations/2_create_admin_user.js`
3. Dans l'éditeur SQL de Supabase, exécuter `3_confirm_admin.sql`
4. Dans l'éditeur SQL de Supabase, exécuter `4_setup_policies_and_admin_profile.sql`

## Informations de connexion admin

- Email : Kossitegue0@gmail.com
- Mot de passe : Kossitegue0@gmail.com

## Vérification

Pour vérifier que tout fonctionne :
1. Connectez-vous à l'application avec les identifiants ci-dessus
2. Vous devriez avoir accès au panneau d'administration
3. Vous devriez pouvoir gérer les autres utilisateurs