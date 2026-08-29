# WEMACOOP Premium Rework v7

This build is a full rework of the supplied single-file prototype.

## What changed
- Replaced the static text-only hero with a large, photo-led project carousel.
- Preserved the distinctive purple/gold editorial feel, while adding teal and green accents for clearer visual hierarchy.
- Kept the Fraunces + Plus Jakarta Sans pairing, but tightened sizes, weights, spacing and alignment.
- Simplified the desktop navigation and improved the mobile drawer.
- Added a mobile bottom dock for the highest-value actions.
- Converted the product area into dynamic tabs.
- Retained and redesigned the live loan calculator with clearer disclaimer language.
- Replaced the fragile circular JS orbit with a responsive cooperation-cycle component.
- Rebuilt the property milestones as responsive cards and a swipeable carousel.
- Added compact resources + FAQ panels instead of giving each one a very long section.
- Improved accessibility: semantic buttons, aria-expanded, visible focus states, reduced-motion support, real counter values in the DOM.
- Removed repeated inline/base64 project images and logo data; assets are cached as separate WebP files.
- Reworked the contact form so it does not falsely claim an email was sent in this static preview.

## Important content checks before production
1. Confirm the Secretariat address and phone details.
2. Confirm the wording and attribution of the 1993 Society Charter quote if it will be reused.
3. Confirm actual loan rates, fees, qualifying periods and maximum tenures.
4. Replace preview resource buttons with approved downloadable documents.
5. Connect the contact form to a real backend/email service.
6. Confirm social media links and privacy/terms pages.

## Files
- `index.html`
- `styles.css`
- `app.js`
- `assets/wema-mark.webp`
- `assets/purple-villa.webp`
- `assets/somolu-flats.webp`
- `assets/oko-omi-land.webp`

The site is static and can be deployed directly to Cloudflare Pages/Workers static assets, GitHub Pages, Netlify or similar hosting.

## v8 — Executive Committee

New files/features:
- `executives.js`: single shared source for executive names, roles, portfolios, images, display order and current/featured status.
- `leadership.html`: dedicated Executive Committee page.
- `leadership.js`: renders the full committee and handles responsive menu behavior.
- `assets/executives/`: temporary portrait placeholders. Replace each with approved 4:5 WebP/JPEG portraits.
- Homepage Executive Committee carousel with four featured officers and link to full committee.

### Replacing executive placeholders
Edit `executives.js` only. Example:

```js
{
  id: 'president',
  name: 'Approved Full Name',
  role: 'President',
  portfolio: 'Approved portfolio wording',
  bio: 'Approved short biography...',
  image: 'assets/executives/president.webp',
  featured: true,
  current: true,
  order: 1
}
```

Recommended portrait format: 4:5 aspect ratio, ideally 800×1000 px, exported as WebP for web performance.
