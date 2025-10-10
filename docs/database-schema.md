# Database Schema Overview

This document describes the backend MySQL tables that power the colleague calendar application, as well as the supporting configuration and email infrastructure. You can create the full schema by running `database/schema.sql` and load demo data with `database/seed.sql`.

## Tables

### `users`
- Stores the core profile information for each account: name fields, email, company, location, shift preferences, avatar, and privacy flag (`info_hide`).
- Profile view and edit flows read and update these fields directly.
- New accounts are created by inserting a row with first name, last name, email, and a password hash. On login, the `user_id` and first name are stored in the session.
- Password reset relies on the `reset_token` and `reset_token_expiry` columns to keep track of recovery links; both fields are cleared once the password changes.

### `friends`
- Holds every confirmed colleague pair. Logged-in users query this table to populate their colleague list together with the relevant profile fields, respecting the `info_hide` privacy flag.
- Accepting a request moves the relationship from `friend_requests` into this table. Rejecting only changes the request status; removing a colleague deletes the pair here and tidies related requests so a new invitation can be sent later.

### `friend_requests`
- Tracks pending (`status = 0`), accepted (`status = 1`), and rejected (`status = 2`) invitations.
- When a new request is submitted the API ensures that neither an existing friendship nor another pending request already exists before inserting the row.
- Approval changes the status to `1` and creates the corresponding entry in `friends`; rejection sets the status to `2`. The table also powers counts and listings for incoming and outgoing requests, and lets senders cancel their outstanding invitations.
- Successful insertions trigger PHPMailer-based email notifications about the new request.

### `close_colleagues`
- Provides each user with a personal favourites list of colleagues using `user_id` and `colleague_id` pairs.
- API endpoints support retrieval, updates via `REPLACE`, and deletions so the UI can highlight "close" colleagues.

### `shift_deviations`
- Captures deviations from the standard shift rotation per user, including start date, number of work and off cycles, duration (in days), and whether to keep repeating the rhythm.
- CRUD endpoints are available for authenticated users to manage their own deviations.

### `remember_tokens`
- Stores hashes of "remember me" tokens together with the associated user and expiry timestamp.
- Tokens are created during logins where the user opts in to be remembered, restore the session on subsequent visits, and are refreshed or removed during logout.

## Configuration (`backend/config.php`)
- Every backend script that connects to MySQL requires `backend/config.php`, which returns credentials for `DB_USER` and `DB_PASS`. These combine with the host and database name for both `mysqli` and `PDO` connections across the backend.
- The same file exposes `MAIL_USER` and `MAIL_PASS`, ensuring each PHPMailer instance authenticates consistently. New scripts must continue to use `require __DIR__ . '/config.php';` instead of hard-coding credentials.

## Email via PHPMailer
- The PHPMailer library resides in `backend/PHPMailer/`, and scripts include the `src/` classes manually when sending emails.
- The contact/support form (`backend/send_mail.php`) delivers plain text emails to a fixed recipient using `MAIL_USER`/`MAIL_PASS` over SMTPS (server `cpanel02.dedia-server.no`, port `465`).
- The forgot-password flow generates a token, persists it on the user, and sends an HTML/plain-text reset link via the same SMTP connection.
- When a colleague request is sent, PHPMailer notifies the recipient with a styled HTML email, explicitly setting `CharSet` to `UTF-8` for Norwegian characters. Reuse this setup for any additional notifications to keep emails consistent.
