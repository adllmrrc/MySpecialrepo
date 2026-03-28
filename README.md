# FitoPro

FitoPro est une application web front-end (HTML/CSS/JavaScript) pour créer, suivre et optimiser ses entraînements.

## Fonctionnalités V4 (pro)
- Validation robuste des formulaires avec messages d'erreur explicites.
- Contrôle complet du timer (démarrer, pause, reprise, validation, reset) + repos entre séries.
- Feedback UX via toasts de confirmation/erreur et messages de confirmation plus explicites.
- UI mobile optimisée iPhone (look & feel iOS-like: glassmorphism, safe-area, CTA tactiles 44px, contrôles sticky).
- Navigation multi-écrans façon app mobile (Run / Activity / Coach) avec barre iOS en bas, inspiration Nike Run.
- Nouveau "Run cockpit" (style Nike-like): score de performance, distance, pace, HR et calories en tuiles live.
- Welcome screen d'entrée + animations satisfaisantes (pop timer, pulse de validation, feedback visuel).
- Welcome screen cinématique avec slides animées, dots de progression et particules canvas.
- Logo mascotte FitoPro + animation d'intro avant le loading screen et l'écran welcome.
- Focus mode plein écran au lancement d'entraînement (timer + infos essentielles).
- Import CSV Apple Watch (export Apple Santé/forme) pour enrichir l'historique local.
- Mode live Apple Watch via URL bridge JSON (heartRate/bpm) pour afficher la fréquence cardiaque en direct dans le focus mode.
- Analytics Apple Watch améliorées: répartition des zones cardio + recovery score en direct.
- Architecture JS modulaire (`src/state.js`, `src/timer.js`, `src/watch.js`, `src/ui.js`).
- Bridge backend sécurisé (`backend/server.js`) avec token Bearer.
- Auth session backend (register/login + Apple identity token), sync cloud save/load, endpoint santé `/health`, CORS et rate limiting.
- Connexion Apple simplifiée avec bouton "Apple rapide" (`POST /api/auth/apple/demo`) en plus du mode token JWT.
- Normalisation santé (HR, calories, VO2, zone) + graphe cardio live + alerte HR haute.
- Coach vocal (TTS) + sons/haptics enrichis.
- PWA améliorée (offline fallback, update/activate flow).
- Consentement confidentialité + page RGPD baseline (`privacy.html`).
- Historique par date (7 jours) + graphiques simples sur canvas.
- Templates rapides (Débutant, Force, Perte de poids).
- Objectif hebdomadaire de séances + suivi visuel.
- Badges de progression (streak, séances, séries).
- Onboarding au premier lancement.
- Export / import JSON et suppression complète des données locales.

## Lancer en local
Ouvrez simplement `index.html` dans votre navigateur.

## Layout du projet
- Front web principal disponible en racine **et** sous `public/` (`public/index.html`, `public/app.js`, `public/styles.css`, `public/src/*`, `public/assets/*`) pour correspondre au layout de déploiement demandé.
- Backend Node dans `backend/server.js`.

## Tests
```bash
node tests/logic.test.js
node tests/watch.test.js
node tests/timer.test.js
node tests/workout-flow.test.js
node tests/backend.contract.test.js
node --check app.js
```

## Bridge Apple Watch live (local)
```bash
FITOPRO_TOKEN=mon-token node backend/server.js
```
Puis configure dans l'app :
- URL: `http://localhost:8787/api/watch/live`
- Token: `mon-token`

## Auth Apple (prototype)
- Bouton `Se connecter avec Apple` dans la section Cloud.
- Collez un `identityToken` Apple (JWT) : l'app appelle `POST /api/auth/apple`.
- Le backend prototype lit le payload JWT (`sub`, `email`) pour créer/connecter la session.

## Déploiement rapide
- Frontend: Vercel / Netlify (fichiers statiques).
- Backend: Railway / Fly / Render (commande: `node backend/server.js`).

## Données
Les données sont sauvegardées localement via `localStorage` :
- `fitopro.workouts`
- `fitopro.stats`
- `fitopro.history`
- `fitopro.settings`
