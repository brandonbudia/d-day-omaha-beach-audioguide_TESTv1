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
