# Deploy til cPanel

1. Merge til `main`
2. cPanel → Git Version Control → Manage → Deploy HEAD commit
3. Output skal vise `npm ci`, `npm run build`, `rsync` til `public_html`
4. Ved 500 eller hvit side, sjekk `.htaccess` i `public_html` og at `index.html` og `assets` ligger der
