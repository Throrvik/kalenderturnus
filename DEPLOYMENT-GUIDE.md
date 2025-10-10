# Deployment Guide til Webhotell

## Steg for å deploye til din webserver

### 1. Bygg appen lokalt
Kjør følgende kommando for å bygge appen:
```bash
npm install
npm run build
```

Dette vil lage en `dist`-mappe med alle nødvendige filer.

### 2. Last opp filer til webhotell
Last opp ALT innholdet i `dist`-mappen til din `public_html`-mappe på webhotellet.

### 3. Kopier .htaccess
Kopier filen `web/.htaccess` til `public_html`-mappen på webhotellet.

**Viktig:** `.htaccess`-filen må ligge i samme mappe som `index.html` for at routing og MIME types skal fungere.

### 4. Sjekk filstruktur på webhotellet
Etter opplasting skal `public_html` se slik ut:
```
public_html/
  ├── .htaccess
  ├── index.html
  ├── favicon.ico
  └── assets/
      ├── index-[hash].js
      ├── index-[hash].css
      └── ...andre filer
```

## Vanlige problemer og løsninger

### MIME type errors
Hvis du får "Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of application/octet-stream":
- Sørg for at `.htaccess` er lastet opp til `public_html`
- Sjekk at webhotellet støtter `.htaccess` (Apache)
- Kontakt webhotell-support for å aktivere `mod_mime` hvis nødvendig

### 404 errors
Hvis du får 404-feil:
- Sørg for at alle filer fra `dist`-mappen er lastet opp
- Sjekk at filnavnene er case-sensitive
- Verifiser at `.htaccess` redirect-reglene fungerer

### Hvit skjerm
Hvis siden er helt hvit:
- Åpne Developer Console (F12) og sjekk for feilmeldinger
- Verifiser at alle `.js` og `.css` filer lastes korrekt
- Sjekk at base URL i `vite.config.ts` matcher din webhotell-struktur

## cPanel Deployment (hvis du bruker cPanel Git)
Hvis du bruker cPanel Git Version Control:
1. Push koden til main branch
2. Gå til cPanel → Git Version Control → Manage
3. Klikk "Deploy HEAD commit"
4. Vent på at deployment script kjører
5. Sjekk at `.htaccess` er kopiert til `public_html`

## Testing
Etter deployment:
1. Åpne nettstedet i en nettleser
2. Åpne Developer Console (F12)
3. Sjekk at det ikke er noen feilmeldinger
4. Test navigasjon mellom sider
5. Test at all funksjonalitet fungerer
