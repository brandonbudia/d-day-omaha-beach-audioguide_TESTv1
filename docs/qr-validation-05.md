# QR journey validation

Mission 05 review of the QR visitor entry path.

## Verified from the checkout

- The site root (`/`) selects the home screen, which offers the visitor a way to start the museum tour.
- A direct `/stop/{id}` link opens a stop when `{id}` matches an ID in `src/data/stops.ts`.
- `vercel.json` rewrites incoming paths to `index.html`, supporting direct links and browser refreshes for this Vercel deployment.
- No QR image, encoded destination URL, deployed origin, or deployment configuration for another host is present in `public/qr-code/`. The two files there are French source text, so the physical QR destination cannot be confirmed from this checkout.

## Targeted correction

An unknown `/stop/{id}` previously selected the first stop in the page component while leaving the URL on the invalid ID. The app now returns to the home screen for an unknown ID instead of presenting stop 01 as if it matched the scanned code. Valid stop links keep their existing behavior.

Before printing or publishing a physical QR code, confirm its encoded URL uses the live site origin and either `/` for the visitor entry or a valid `/stop/{id}` deep link. Verify direct access and refresh on the actual hosting provider; only Vercel's fallback is confirmed here.

## Langue des liens de fiche

Le parcours et la navigation interne incluent désormais la langue choisie dans l’adresse. Par exemple, `/stop/15?hl=en` ouvre la fiche anglaise. Les adresses sans paramètre utilisent toujours la préférence du navigateur ou le français par défaut.

Le rendu des 22 liens a été vérifié dans les sept langues. Dans le navigateur local, le clic sur la carte 15, la fiche suivante, le retour et l’ouverture directe ont conservé l’anglais. L’adresse sans paramètre a également ouvert la bonne fiche. Après arrêt du serveur, le lien anglais s’est ouvert depuis le cache à une largeur de 390 px. La validation du QR imprimé dépend encore de sa destination réelle et de l’hébergement.
