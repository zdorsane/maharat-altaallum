# Maharat Al Taallum · مهارات التعلم

Plateforme algérienne d'accompagnement des enfants en difficulté de lecture, d'écriture et d'orthographe : dépôt de dossiers par les parents, examen pédagogique initial, orientation vers des spécialistes (orthophonistes, éducateurs spécialisés), exercices interactifs et suivi des progrès.

> La plateforme ne pose aucun diagnostic médical ou psychologique. L'examen initial est une orientation pédagogique ; l'évaluation est réalisée par des spécialistes qualifiés.

## Fonctionnalités

- **Quatre espaces par rôle** : parent, référent pédagogique, spécialiste, administration, avec contrôle d'accès côté serveur.
- **Trilingue** : arabe (RTL), français, anglais, avec choix mémorisé par utilisateur.
- **Mode clair / sombre** qui suit le réglage de l'appareil.
- **Authentification** : sessions signées en cookie httpOnly, mots de passe bcrypt, limitation des tentatives, réinitialisation par lien à usage unique.
- **Journal d'audit** des opérations sensibles.

## Stack

Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Prisma 6 · Tailwind CSS 4 · Zod

## Démarrage

Prérequis : Node.js 20+.

```bash
npm install
cp .env.example .env          # puis remplacer SESSION_SECRET par une chaîne aléatoire de 32+ caractères
npm run db:push               # crée la base SQLite
npm run db:seed               # comptes de démonstration
npm run dev                   # http://localhost:3000
```

Comptes de démonstration (mot de passe `Maharat2026!`) : `admin@`, `reviewer@`, `specialist@`, `parent@maharat.local`. Le seed refuse de s'exécuter en production.

## Base de données

SQLite en développement. Pour PostgreSQL, mettre `provider = "postgresql"` dans `prisma/schema.prisma` et renseigner `DATABASE_URL`.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run db:reset` | Réinitialise la base et relance le seed |
