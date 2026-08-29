# Design & Engineering Review Notes

## Strong ideas retained from the supplied version
- Premium purple/gold brand direction.
- Serif display typography for a distinctive institutional feel.
- Loan calculator.
- Cooperative-cycle concept.
- Membership onboarding flow.
- Property milestones.
- Mobile quick navigation concept.

## Main issues found in the supplied version
- The entire site, including the logo and large property photography, was embedded in one HTML file using base64 data. This makes the file difficult to maintain and reduces browser caching efficiency.
- The landing page had many large full sections, making mobile scrolling long again.
- Desktop navigation contained seven items plus a CTA, which can become crowded before the 1220px breakpoint.
- Inline styles were repeated heavily, making consistent typography/spacing harder to maintain.
- Counters showed `0` in source HTML and relied on JavaScript to populate actual values.
- FAQ questions were clickable `div` elements instead of semantic buttons.
- The contact form displayed a success message even though no backend request was made.
- The loan rate slider can look like an official published rate unless the illustrative nature is made prominent.
- The orbit visualization is visually interesting, but dynamically positioning five nodes with JavaScript is more fragile than a responsive CSS component.
- Some contact/charter details should be verified before production.

## New design strategy
- Project-led first impression.
- Fewer, denser sections rather than many long homepage blocks.
- 8px-based spacing rhythm.
- One primary display serif + one UI/body sans serif.
- Purple as primary brand colour, gold for premium/CTA, teal for credit/tools, green for property/growth.
- Stronger semantic HTML and accessibility.
- Data-driven JavaScript for projects, products, FAQs and membership steps.
- Separate cacheable media assets.
