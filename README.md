# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/14193d2e-4cc7-4d83-8a4b-a8ce4688ac1e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/14193d2e-4cc7-4d83-8a4b-a8ce4688ac1e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Kalenderarkitektur og dataflyt

- Lokal lagring versjoneres med `APP_VERSION` slik at gamle skift, farger og andre strukturer slettes automatisk når datastrukturen endres.
- Når siden lastes, initialiseres ukedagsraden, hendelser registreres og lokale data, kollegaer, nære kollegaer, avvik og brukerskift lastes før kalenderen tegnes.
- Fargevalg, valgte kollegaer, listen over nære kollegaer og avvik lagres i `localStorage`, med fallback til en cache dersom brukeren ikke er innlogget eller API-kall feiler.
- Kun egendefinerte turnuser persisteres i `localStorage`; egne og kollegers turnuser holdes i minnet slik at de alltid samsvarer med serverstatus.

## Navigasjon og visning

- Kalenderheaderen tilbyr navigasjon for forrige/neste måned, en «I dag»-knapp og en bryter for årsvy, og månedsnavn oppdateres dynamisk når brukeren navigerer.
- `updateView` bytter mellom månedsrutenett og kompakt årsvy, der årsvyen rendrer 12 minikalendere med egen CSS.
- Rutenettet viser ukenumre i venstre kolonne og bygger ukedagsraden (inkludert «Uke»-kolonnen) programmert slik at både måneds- og årsvy følger ISO-logikk.
- Dagens dato får en tydelig bakgrunn, røde dager og spesielle markeringer vises som etiketter nederst i cellen og skjules automatisk i årsvy for å redusere støy.
- Aktive turnuser vises som fargede prikker i kalendercellene, og avvik markeres med kantlinje og en ekstra markør både på prikken og i popupen.
- Klikk på en dag åpner et popupkort med ukedag, dato og deltakerliste (fornavn + mønster), og på mobil flyttes popupen til bunnen av skjermen for bedre lesbarhet.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/14193d2e-4cc7-4d83-8a4b-a8ce4688ac1e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
