# Configuration des variables d'environnement

## Étape 1 : Créer votre fichier .env

1. Copiez le fichier `.env.example` :
   ```bash
   cp .env.example .env
   ```

2. Ouvrez le fichier `.env` et remplacez les valeurs par vos vraies clés Supabase

## Étape 2 : Obtenir vos clés Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Sélectionnez votre projet (ou créez-en un nouveau)
3. Allez dans **Project Settings** (icône engrenage en bas à gauche)
4. Cliquez sur **API**
5. Copiez les valeurs suivantes :

### Project URL
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
```

### Anon/Public Key
```
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbWd...
```

## Étape 3 : Vérifier la configuration

Votre fichier `.env` devrait ressembler à ceci :

```env
EXPO_PUBLIC_SUPABASE_URL=https://qkmgvbpkpzxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

## Étape 4 : Redémarrer l'application

Si votre application est déjà lancée, redémarrez-la pour charger les nouvelles variables :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm start
```

## ⚠️ Important

- **NE JAMAIS** commiter le fichier `.env` sur Git
- Le fichier `.env` est déjà dans `.gitignore`
- Partagez uniquement `.env.example` sur le repository
- En production, configurez les variables d'environnement sur votre plateforme de déploiement

## Dépannage

### Erreur : "Missing Supabase configuration"
→ Le fichier `.env` n'existe pas ou les variables ne sont pas définies. Vérifiez que :
1. Le fichier `.env` existe à la racine du projet
2. Les variables commencent par `EXPO_PUBLIC_`
3. Vous avez redémarré l'application après avoir créé le fichier

### Les variables ne sont pas chargées
→ Avec Expo, les variables doivent commencer par `EXPO_PUBLIC_` pour être accessibles dans l'app
→ Redémarrez complètement le serveur Expo (`npm start`)

### Erreur de connexion à Supabase
→ Vérifiez que votre URL et votre clé sont correctes
→ Vérifiez que vous avez bien copié la clé **anon/public** (pas la clé service)
