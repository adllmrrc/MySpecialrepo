# FitoPro

FitoPro est une application web front-end (HTML/CSS/JavaScript) pour créer, suivre et optimiser ses entraînements.

## Fonctionnalités V3 (Étapes 1 & 2)
- Validation robuste des formulaires avec messages d'erreur explicites.
- Contrôle complet du timer (démarrer, pause, reprise, validation, reset) + repos entre séries.
- Feedback UX via toasts de confirmation/erreur et messages de confirmation plus explicites.
- UI mobile optimisée iPhone (look & feel iOS-like: glassmorphism, safe-area, CTA tactiles 44px, contrôles sticky).
- Welcome screen d'entrée + animations satisfaisantes (pop timer, pulse de validation, feedback visuel).
- Logo mascotte FitoPro + animation d'intro avant le loading screen et l'écran welcome.
- Historique par date (7 jours) + graphiques simples sur canvas.
- Templates rapides (Débutant, Force, Perte de poids).
- Objectif hebdomadaire de séances + suivi visuel.
- Badges de progression (streak, séances, séries).
- Onboarding au premier lancement.
- Export / import JSON et suppression complète des données locales.

## Lancer en local
Ouvrez simplement `index.html` dans votre navigateur.

## Tests
```bash
node tests/logic.test.js
node --check app.js
```

## Données
Les données sont sauvegardées localement via `localStorage` :
- `fitopro.workouts`
- `fitopro.stats`
- `fitopro.history`
- `fitopro.settings`
