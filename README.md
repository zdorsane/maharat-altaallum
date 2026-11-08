# Maharat Al Taallum · مهارات التعلم

Plateforme algérienne d'accompagnement des enfants en difficulté de lecture, d'écriture et d'orthographe : dépôt de dossiers par les parents, examen pédagogique initial, orientation vers des spécialistes (orthophonistes, éducateurs spécialisés), exercices interactifs et suivi des progrès.

> La plateforme ne pose aucun diagnostic médical ou psychologique. L'examen initial est une orientation pédagogique ; l'évaluation est réalisée par des spécialistes qualifiés.

## Identité visuelle

- Palette : Deep Teal `#245B73`, Soft Mint `#67B7A5`, Warm Yellow `#F3C969`, Soft Coral `#F2A69B`, Warm Ivory `#F7F5EF`, Ink Slate `#283C48` — définie comme tokens dans `src/app/globals.css` (clair et sombre).
- Typographie : Manrope (latin) et IBM Plex Sans Arabic (arabe), chargées via `next/font`.
- Logo : `src/components/logo.tsx` (complet et symbole), favicon `src/app/icon.svg`.

## Fonctionnalités

- **Quatre espaces par rôle** : parent, référent pédagogique, spécialiste, administration, avec contrôle d'accès côté serveur.
- **Trilingue** : arabe (RTL), français, anglais, avec choix mémorisé par utilisateur.
- **Mode clair / sombre** qui suit le réglage de l'appareil.
- **Authentification** : sessions signées en cookie httpOnly, mots de passe bcrypt, limitation des tentatives, réinitialisation par lien à usage unique.
- **Journal d'audit** des opérations sensibles.

## Stack

Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Prisma 6 · Tailwind CSS 4 · Zod

## Démarrage

Prérequis : Node.js 20+ et une base PostgreSQL. En local, le plus simple est le serveur intégré de Prisma :

```bash
npx prisma dev -d --name maharat   # affiche une URL postgres://… à copier dans .env
```

Avec ce serveur local, ajouter `&connection_limit=1&pgbouncer=true` à l'URL (il ne gère pas les requêtes préparées).

```bash
npm install
cp .env.example .env          # renseigner DATABASE_URL, DATABASE_URL_UNPOOLED et SESSION_SECRET (32+ caractères)
npm run db:deploy             # applique les migrations
npm run db:seed               # comptes de démonstration (développement uniquement)
npm run dev                   # http://localhost:3000
```

Comptes de démonstration (mot de passe `Maharat2026!`) : `admin@`, `reviewer@`, `specialist@`, `parent@maharat.local`. Le seed refuse de s'exécuter en production.

## Déploiement (Vercel + Neon)

- La base Neon est connectée au projet Vercel ; elle fournit `DATABASE_URL` et `DATABASE_URL_UNPOOLED`.
- À chaque déploiement, `npm run build:vercel` applique les migrations, puis `prisma/bootstrap.ts` crée les catégories de dossiers et le premier super-administrateur (à partir de `ADMIN_EMAIL` et `ADMIN_PASSWORD_HASH`, un hash bcrypt), puis compile l'application.
- Variables requises en production : `SESSION_SECRET`, `APP_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`.

## Base de données

PostgreSQL via Prisma. Les migrations sont dans `prisma/migrations` ; après une modification du schéma, `npm run db:migrate`.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run db:reset` | Réinitialise la base et relance le seed |
