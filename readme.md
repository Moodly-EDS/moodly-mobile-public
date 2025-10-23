# Moodly - Application de Suivi d'Humeur

Une application mobile de suivi d'humeur (mood tracking) développée avec React Native et Expo Router, permettant aux équipes de suivre leur bien-être de manière anonyme.

## 🎯 Fonctionnalités

### ✅ Onboarding

- Carrousel de 3 slides expliquant l'application
- Quick check-ins (< 30 secondes)
- Anonymat garanti
- Insights pour les managers

### 📝 Check-in Quotidien

- Sélection d'humeur via 5 emojis (😞 à 😄)
- Tags optionnels pour identifier les influences :
  - Workload
  - Collaboration
  - Recognition
  - Autonomy
  - Focus
  - Personal
  - Other
- Limitation : 1 check-in par jour
- Raccourcis clavier (1-5, Enter)

### 📊 Historique et Statistiques

- Moyenne sur 30 jours
- Tendance sur 7 jours (Rising/Falling/Stable)
- Liste des check-ins par semaine (Cette semaine / Semaine dernière)
- Visualisation des tags associés

### 🔐 Authentification

- Connexion simple (mode démo)
- Sélection du rôle (Employee/Manager)
- Gestion de session avec AuthContext

## 🏗️ Architecture

### Structure des Fichiers

```
app/
├── _layout.tsx          # Layout principal avec providers
├── index.tsx            # Point d'entrée et routing
├── onboarding.tsx       # Écran d'onboarding (3 slides)
├── login.tsx            # Écran de connexion
├── dashboard.tsx        # Écran de check-in principal
├── history.tsx          # Historique des humeurs
└── checkin-success.tsx  # Confirmation de soumission

context/
├── authcontext.tsx      # Gestion de l'authentification
├── themecontext.tsx     # Gestion du thème
└── moodcontext.tsx      # Gestion des check-ins et statistiques
```

### Contexts

#### MoodContext

Gère toutes les données de mood tracking :

- `entries[]` : Liste des check-ins
- `addEntry()` : Ajouter un check-in
- `hasCheckedInToday()` : Vérifier si déjà checké aujourd'hui
- `get30DayAverage()` : Moyenne sur 30 jours
- `get7DayTrend()` : Tendance sur 7 jours
- `getEntriesByWeek()` : Entrées par semaine

#### AuthContext

Gère l'authentification utilisateur

#### ThemeContext

Gère le thème de l'application

### Flux de Navigation

```
index.tsx
  ├─> onboarding.tsx (première visite)
  │     └─> login.tsx
  │           └─> dashboard.tsx
  │
  └─> login.tsx (onboarding fait, pas connecté)
        └─> dashboard.tsx
              ├─> history.tsx
              └─> checkin-success.tsx (après soumission)
```

### Structure d'une Entry

```typescript
interface MoodEntry {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  mood: 1 | 2 | 3 | 4 | 5;
  tags: MoodTag[];
  timestamp: number;
}
```

## 🎨 Design System

### Couleurs

- Primary: Blue-600 (#2563eb)
- Background: White
- Text: Slate-900, Slate-600, Slate-500
- Borders: Slate-200, Slate-300

### Typographie

- Font Family: Inter (9 poids : 100 à 900)
- Sizes: xs, sm, base, lg, xl, 2xl, 3xl

### Composants

- Cartes arrondies (rounded-2xl, rounded-3xl)
- Boutons rounded-full
- Borders subtiles
- Ombres légères (shadow-sm)

## 🚀 Commandes

```bash
# Démarrer l'app
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web

# Lint & Format
npm run lint
npm run format
```

## 📦 Dépendances Principales

- `expo` : Framework React Native
- `expo-router` : Navigation basée sur fichiers
- `@react-native-async-storage/async-storage` : Stockage local
- `@expo/vector-icons` : Icônes
- `@expo-google-fonts/inter` : Police Inter
- `nativewind` : Tailwind CSS pour React Native

## 📄 Licence

Projet éducatif - Tous droits réservés
