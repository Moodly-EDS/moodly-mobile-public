# 🚀 Guide de Démarrage Rapide - Moodly

## Installation et Lancement

### 1. Installer les dépendances
```bash
npm install
```

### 2. Lancer l'application

#### Sur iOS (nécessite macOS + Xcode)
```bash
npm run ios
```

#### Sur Android (nécessite Android Studio)
```bash
npm run android
```

#### Mode Développement (Expo Go)
```bash
npm start
```
Puis scanner le QR code avec :
- **iOS**: Camera app
- **Android**: Expo Go app

#### Sur Web
```bash
npm run web
```

## 🎮 Utilisation

### Première Utilisation

1. **Onboarding** (3 slides)
   - Slide 1: Quick check-ins
   - Slide 2: Always anonymous
   - Slide 3: Team insights
   - Appuyer sur "Next" ou "Skip" ou "Get Started"

2. **Login**
   - Choisir Employee ou Manager
   - Entrer n'importe quel email/password (mode démo)
   - Appuyer sur "Sign in"

3. **Check-in**
   - Sélectionner une humeur (😞 à 😄)
   - Optionnellement choisir jusqu'à 2 tags
   - Appuyer sur "Submit check-in"

4. **Après le check-in**
   - Message de confirmation
   - Peut voir l'historique ou soumettre un autre check-in

### Navigation

**Bottom Bar** (3 onglets) :
- 🏠 **Check-in** : Écran principal
- 🕐 **History** : Historique et statistiques
- 🚪 **Sign out** : Déconnexion (retour au login)

### Raccourcis Clavier (Desktop/Web)

- `1-5` : Sélectionner une humeur
- `Enter` : Soumettre le check-in

## 📱 Écrans

### 1. Onboarding (`/onboarding`)
- ✨ Premier lancement uniquement
- 🔄 Carrousel horizontal
- ⏭️ Skip ou Next
- 🎯 Get Started → Login

### 2. Login (`/login`)
- 👤 Sélection de rôle
- ✉️ Email (mode démo)
- 🔒 Password (mode démo)
- 🔐 Sign in → Dashboard

### 3. Dashboard (`/dashboard`)
- 😊 Sélection d'humeur (1-5)
- 🏷️ Tags optionnels (max 2)
- ✅ Submit check-in
- 🔒 1 fois par jour maximum

### 4. History (`/history`)
- 📊 Moyenne 30 jours
- 📈 Tendance 7 jours
- 📅 Cette semaine
- 📆 Semaine dernière

### 5. Check-in Success (`/checkin-success`)
- ✅ Confirmation
- 🔁 Submit another
- 📊 View history

## 🎨 Personnalisation

### Changer les Couleurs

Modifier dans `tailwind.config.js` :
```javascript
theme: {
  extend: {
    colors: {
      primary: '#2563eb', // Bleu actuel
      // Ajouter d'autres couleurs
    }
  }
}
```

### Modifier les Emojis de Mood

Dans `app/dashboard.tsx` :
```typescript
const moodOptions = [
  { level: 1, emoji: '😞', label: 'Very bad' },
  { level: 2, emoji: '😟', label: 'Bad' },
  { level: 3, emoji: '😐', label: 'Okay' },
  { level: 4, emoji: '🙂', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Very good' },
];
```

### Modifier les Tags

Dans `context/moodcontext.tsx` :
```typescript
export type MoodTag = 
  | 'Workload' 
  | 'Collaboration' 
  | 'Recognition' 
  | 'Autonomy' 
  | 'Focus' 
  | 'Personal' 
  | 'Other';
```

## 🐛 Dépannage

### L'onboarding se relance à chaque fois
```bash
# Réinitialiser AsyncStorage
# Dans l'app, appuyer 'd' dans le terminal puis sélectionner "Delete AsyncStorage"
```

### Erreur de fonts
```bash
# Nettoyer et réinstaller
rm -rf node_modules
npm install
npm start -- --clear
```

### Erreur TypeScript
```bash
# Vérifier les types
npm run typecheck
```

### Erreur ESLint
```bash
# Linter
npm run lint

# Auto-fix
npm run format
```

## 📊 Données de Test

### Ajouter des Check-ins de Test

Modifier `context/moodcontext.tsx` pour ajouter des données initiales :

```typescript
const loadEntries = async () => {
  try {
    const storedEntries = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    } else {
      // Données de test
      const testData = [
        { id: '1', date: '2025-10-20', mood: 4, tags: ['Collaboration'], timestamp: Date.now() },
        { id: '2', date: '2025-10-19', mood: 2, tags: ['Workload', 'Personal'], timestamp: Date.now() - 86400000 },
        // ...
      ];
      setEntries(testData);
    }
  } catch (error) {
    console.error('Failed to load mood entries:', error);
  } finally {
    setLoading(false);
  }
};
```

### Réinitialiser les Données

Dans le code, ajouter un bouton pour clear :
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleClearData = async () => {
  await AsyncStorage.multiRemove([
    '@moodly_onboarding_completed',
    '@moodly_entries'
  ]);
  // Recharger l'app
};
```

## 🚢 Déploiement

### Build iOS
```bash
eas build --platform ios
```

### Build Android
```bash
eas build --platform android
```

### Web
```bash
npm run build:web
```

## 📚 Ressources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [React Native](https://reactnative.dev/)

## 💡 Conseils

1. **Développement**: Utilisez `npm start` et Expo Go pour des tests rapides
2. **Debug**: Utilisez React DevTools et les logs console
3. **Performance**: Testez sur de vrais appareils, pas seulement simulateurs
4. **UI**: Utilisez le hot reload pour voir les changements CSS en temps réel
5. **Storage**: Utilisez Reactotron pour inspecter AsyncStorage

## ✅ Checklist Avant Production

- [ ] Tester sur iOS
- [ ] Tester sur Android
- [ ] Vérifier les performances
- [ ] Tester avec de vraies données (30+ check-ins)
- [ ] Vérifier les calculs de statistiques
- [ ] Tester la limite 1 check-in/jour
- [ ] Vérifier l'accessibilité
- [ ] Optimiser les images (si ajoutées)
- [ ] Configurer les icônes et splash screens
- [ ] Tester le flow complet onboarding → check-in → history

---

**Besoin d'aide ?** Consultez MIGRATION.md et README_MOODLY.md
