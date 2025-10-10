# Database Setup

Denne katalogen inneholder SQL-skript som gjør MySQL-databasen for Kollegakalenderen klar til bruk.

## Innhold

- `schema.sql` – oppretter databasen `colleague_calendar` og alle nødvendige tabeller.
- `seed.sql` – legger inn demodata for de fire standardkollegaene og relaterte relasjoner.

## Komme i gang

1. Logg inn på MySQL-serveren din.
2. Kjør `schema.sql` for å opprette strukturen:
   ```bash
   mysql -u <bruker> -p < schema.sql
   ```
3. Kjør deretter `seed.sql` for å fylle inn basisdata:
   ```bash
   mysql -u <bruker> -p < seed.sql
   ```
4. Oppdater `backend/config.php` (se eksempel nedenfor) slik at PHP-backenden peker på riktig database og legitimasjon.

## Eksempel på `backend/config.php`

```php
<?php
return [
    'DB_HOST' => 'localhost',
    'DB_NAME' => 'colleague_calendar',
    'DB_USER' => 'kalender_user',
    'DB_PASS' => 'veldig-sikkert-passord',
    'MAIL_USER' => 'no-reply@example.com',
    'MAIL_PASS' => 'smtp-passord',
];
```

`backend`-skript henter disse verdiene via `require __DIR__ . '/config.php';` og bruker nøkler som `DB_USER`/`DB_PASS` for å etablere MySQL-tilkoblinger.

Når begge SQL-filene er kjørt er databasen operativ med demo-dataene som også brukes i frontend-demonstrasjonen.
