# v10 Review Notes

## Resource centre design decisions

1. The homepage remains concise. Only a small resources preview remains there; the full library lives on `resources.html`.
2. Search and category filters reduce long-scroll behaviour on mobile and desktop.
3. The website does not fake downloads. Existing approved documents must be supplied before a button becomes a real download.
4. The resource data is separated from HTML so a future API can replace `resources-data.js` without redesigning the page.
5. A document-control section demonstrates the metadata the future admin portal should manage: version, approval date, owner and publication status.
6. Mobile form/search inputs use a 16px font to avoid unwanted browser zoom.
7. Resource cards stack to one column on small screens and preserve large touch targets.

## Content requiring WEMACOOP confirmation before production

- Membership Application Form
- Loan Application Form
- Cooperative By-laws
- Any annual/AGM/circular documents later added
- Official contact details and office address
- Product rates, limits, fees and eligibility rules
