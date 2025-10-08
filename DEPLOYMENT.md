# Guide de déploiement sécurisé

## Configuration des variables d'environnement pour Vercel

Pour sécuriser les identifiants de l'application et éviter qu'ils apparaissent dans les logs, suivez ces étapes lors du déploiement sur Vercel:

### 1. Suppression des identifiants du code source

Les identifiants ont été retirés du code source et sont maintenant uniquement accessibles via les variables d'environnement.

### 2. Configuration des variables d'environnement dans Vercel

1. Connectez-vous à votre tableau de bord Vercel
2. Sélectionnez votre projet
3. Allez dans l'onglet "Settings" puis "Environment Variables"
4. Ajoutez les variables suivantes:
   - `VITE_SUPABASE_URL`: URL de votre projet Supabase
   - `VITE_SUPABASE_ANON_KEY`: Clé anonyme de votre projet Supabase

### 3. Sécurité supplémentaire

- Activez l'option "Encrypt" pour les variables contenant des secrets
- Limitez la visibilité des variables aux environnements nécessaires (Production, Preview, Development)
- Ne jamais afficher les identifiants dans les logs ou les messages de débogage

### 4. Vérification du déploiement

Après le déploiement, vérifiez que:
- L'application fonctionne correctement
- Les identifiants ne sont pas exposés dans le code client
- Les requêtes vers Supabase s'effectuent normalement

## Bonnes pratiques de sécurité

- Utilisez toujours des variables d'environnement pour les secrets
- Ne stockez jamais d'identifiants en dur dans le code
- Limitez les permissions de la clé anonyme Supabase au strict nécessaire
- Effectuez une rotation régulière des clés d'API