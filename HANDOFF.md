# ClearEdge Protective Films - Project Handoff

## What This Is
A static website for **ClearEdge Protective Films**, a PPF, ceramic coating, and window tint shop in Kennesaw, GA. Includes a main site, a Meta Ads landing page, and a 4-article blog. Deployed on Netlify at **https://clearedgeppf.com**.

## Contact Info (real, live on site)
- **Phone:** (943) 265-8964
- **Email:** dallas@clearedgeppf.com
- **Location:** Kennesaw, GA 30144

## Deployment
- **Host:** Netlify (site ID: `82abed08-38ca-4a97-9808-b9490b1f8b43`)
- **Deploy command:** `netlify deploy --prod --dir=.` from the project root
- **GitHub repo:** `dallas-winston/clearedge-website` (branch: `main`)
- Push to GitHub after deploying: `git push origin main`

## File Structure
```
clearedge/
├── index.html              # Main site (single page)
├── landing.html            # Meta Ads landing page (hero form variant)
├── blog/
│   ├── index.html                          # Blog listing page
│   ├── ppf-vs-ceramic-coating.html         # PPF vs ceramic coating comparison
│   ├── how-much-does-ppf-cost-atlanta.html # Atlanta PPF pricing guide
│   ├── georgia-window-tint-laws.html       # GA tint law breakdown
│   └── ppf-maintenance-care-guide.html     # PPF care guide
├── css/
│   ├── style.css           # All styles (includes blog section at end)
│   └── landing.css         # Landing page overrides
├── js/
│   ├── main.js             # FAQ accordion, nav, stats counter, quote popup, hero slideshow, form submission
│   └── landing.js          # Hero form submit, delayed popup logic for landing page
├── images/
│   ├── logo.png            # Main logo (nav + footer)
│   ├── logo-full.png       # Full logo with car graphic (unused)
│   ├── favicon.ico         # Favicon
│   ├── favicon-32.png      # 32x32 PNG favicon
│   ├── apple-touch-icon.png # Apple touch icon
│   ├── hero-1.jpg through hero-5.jpg  # Hero slideshow images
│   ├── ppf-full-front.png             # PPF coverage visual (Full Front)
│   ├── ppf-full-front-lower-sides.png # PPF coverage visual (Full Front + Lower Sides)
│   ├── ppf-full-body.png              # PPF coverage visual (Full Body)
│   └── qr-code.svg / qr-code.png     # QR code assets
├── thank-you.html          # Post-submission thank you page (conversion tracking)
├── netlify/
│   └── functions/
│       ├── submit-lead.js      # ACTIVE — form submissions → Airtable Leads table
│       ├── generate-invoice.js # DORMANT — webhook-triggered PDF invoice (do not "fix"; see CRM & Invoicing section)
│       └── check-invoices.js   # DORMANT — scheduled every 5min; finds no records under new flow
├── netlify.toml            # Netlify config (functions dir, scheduled-function entry)
├── package.json            # pdfkit + resend deps (used only by the dormant invoice functions)
├── build-airtable.js       # One-time script — populates fields/views in the Airtable Leads table
├── setup-airtable.js       # One-time script — created the original Airtable PPF base
├── robots.txt              # Allows all crawlers, points to sitemap
├── sitemap.xml             # All page URLs for search engines
├── llms.txt                # Plain-text site summary for AI crawlers
├── HANDOFF.md              # This file
└── .netlify/               # Netlify config + site state
```

## Pages

### index.html (main site)
Sections top to bottom:
1. **Quote Popup** - Modal form (name, phone, email, service, vehicle, SMS consent)
2. **Header/Nav** - Logo, section links, Blog link, phone, "Get a Quote" button, mobile menu
3. **Hero** - 5-image slideshow, headline "Atlanta Area's Premier Protection Specialists"
4. **Stats Bar** - 500+ vehicles, 5.0 rating, 10+ years, 10-year warranty (animated counters)
5. **Services** - 3 cards: PPF (Most Popular), Ceramic Coating, Window Tint
6. **PPF Packages** - PNG coverage visuals + 3 package cards (Full Front, Full Front + Lower Sides, Full Body)
7. **Why ClearEdge** - 4 trust points (certified, warranty, premium films, climate-controlled)
8. **Process** - 6-step install process
9. **Quote CTA** - "How Much For My Car?"
10. **FAQ** - 5 accordion items about PPF
11. **Inline Quote Form** - Full contact form with vehicle details
12. **Footer** - Logo, service links, quick links, contact info, hours

### landing.html (Meta Ads)
Same structure as index.html but with:
- Hero includes an inline estimate form (name, phone, service dropdown)
- Auto-dismisses the popup (sessionStorage flag)
- Loads `landing.js` for hero form submission
- Canonical tag points to index.html (avoids duplicate content)
- PPF packages section shows 3 tiers (no Partial Front)

### thank-you.html (conversion page)
Post-form-submission thank you page. All three forms redirect here on success.
- `noindex, nofollow` — not indexed by search engines
- Fires Google Ads conversion event (`AW-18137105821/JuQrCJv256gcEJ2LuchD`)
- Fires Meta Pixel `Lead` event
- Shows next-steps summary and back-to-home / blog CTAs

### Blog (blog/)
4 SEO-optimized articles targeting high-value search queries:
- **PPF vs. Ceramic Coating** - Comparison article, FAQ schema
- **How Much Does PPF Cost in Atlanta?** - 2026 pricing guide with real ranges, FAQ schema
- **Georgia Window Tint Laws** - Legal VLT limits, exemptions, fines, FAQ schema
- **PPF Maintenance Care Guide** - Washing, products, self-healing, HowTo schema

Each article has its own Article JSON-LD schema, FAQ or HowTo schema, OG/Twitter tags, and canonical URL. Blog pages share the same header/footer as the main site with paths adjusted (`../`).

## SEO and AI Search Optimization
The site is optimized for both traditional search engines and AI search (ChatGPT, Perplexity, Google AI Overviews):

- **JSON-LD structured data** on index.html: LocalBusiness (AutoRepair), FAQPage, HowTo, WebPage
- **JSON-LD structured data** on landing.html: LocalBusiness, FAQPage
- **JSON-LD structured data** on blog posts: Article + FAQPage or HowTo per article
- **Open Graph + Twitter Card** meta tags on all pages
- **Canonical tags** on all pages (landing.html canonicalizes to index.html)
- **robots.txt** allowing all crawlers with sitemap reference
- **sitemap.xml** listing all 7 pages
- **llms.txt** plain-text summary for AI crawlers (about, services, FAQ, blog summaries, contact)
- **Semantic HTML** with `<main>` landmark on index.html and landing.html
- **Favicons** (ICO, PNG 32x32, Apple touch icon)

## Branding
- **Primary accent color:** Royal Purple `#7851A9` (CSS variable is still named `--gold` from the original template)
- **Hover:** `#9168C0` / **Dark:** `#5C3D8A`
- **Background:** `#080808` (near-black)
- **Fonts:** Montserrat (headings) + Inter (body) via Google Fonts
- **Tone:** Professional but approachable. No em dashes anywhere (owner preference). Keep copy natural and human-sounding.

## Forms
- **Popup form** (both pages): name, phone, email, service, vehicle, SMS consent
- **Inline quote form** (both pages): first/last name, email, phone, vehicle details, service, message, "how found"
- **Hero form** (landing.html only): name, phone, service
- All forms use client-side validation in `main.js` and submit in parallel to:
  1. **Web3Forms** (email notification to dallas@clearedgeppf.com)
  2. **Discord webhook** (real-time lead alerts in Discord)
  3. **Airtable** (via `netlify/functions/submit-lead.js`) — creates a record in the `Leads` table with `Status="New"`
- On success, all three forms redirect to `/thank-you.html` (triggers Google Ads + Meta conversion tracking)
- Meta Pixel tracks PageView on both pages; landing.js tags submissions as "Landing Page Hero Form (Meta Ad)"

## CRM & Invoicing

**Direction (decided 2026-05-11):** Leads live in Airtable; invoicing and payments live in QuickBooks Online + QB Payments. The two systems are bridged manually for now (re-type customer info from Airtable into QB at phone close).

**Important — dormant code:** `netlify/functions/generate-invoice.js` and `netlify/functions/check-invoices.js` are intentionally dormant. They were built for an older "auto-invoice after Status=Completed" flow that's been abandoned. The `*/5 * * * *` cron in `netlify.toml` still runs but finds no matching records under the new workflow. **Do not "fix" the known PDF layout bug (lines 124/143/152 of generate-invoice.js) or the sender-email default mismatch — neither will ever fire.**

**Airtable:**
- Base ID: `appzzFZTAzAnTHQJg`, table: `Leads`
- Fields already in place: `Name`, `Email`, `Phone`, `Vehicle Year/Make/Model`, `Service Requested`, `Coverage Details`, `Status`, `Lead Source`, `Quote Amount`, `Final Price`, `Payment Method`, `Payment Status`, `Film Brand`, `Warranty Length`, `Appointment Date`, `Completion Date`, `Notes`, `Invoice Sent` (legacy — used by dormant cron), `Created Date`
- Status values: `New → Contacted → Quoted → Booked → In Progress → Completed → Lost`
- **Fields/options still to add** (blocked on QB account being live; see TODO section):
  - New Status option: `Awaiting Deposit` (between Quoted and Booked)
  - New fields: `QB Invoice #` (text), `QB Invoice URL` (URL), `Invoiced` (checkbox), `Deposit Paid` (checkbox), `Balance Paid` (checkbox)

**Workflow once QB is live:**
1. Lead comes in via web form → Airtable record `Status="New"`
2. Work the lead: `Contacted → Quoted`
3. **Phone close:** set `Status="Awaiting Deposit"`, fill `Final Price` + `Service Sold` in Airtable; create one QB invoice for the full job amount; QB emails customer with Pay Now link; paste QB Invoice # and URL back into Airtable; check `Invoiced`
4. Customer pays deposit via QB Pay Now → check `Deposit Paid` in Airtable, set `Status="Booked"` + `Appointment Date`
5. Service day: `In Progress → Completed`
6. Balance collected at pickup (cash/Venmo/Zelle/card) → manually log as a second partial payment in QB; check `Balance Paid` in Airtable

**Deposit policy:**
- Window Tint: **$99**
- PPF or Ceramic Coating: **$250**
- Bundles: **$250 once** (highest tier wins)
- Refundable with 48hr notice; one free reschedule; forfeit on no-show, same-day cancel, or 2nd reschedule

**Sales tax:**
- Rate is **6.0%** (GA state 4.0% + Cobb County 2.0%; Kennesaw adds 0%)
- Configure in QB at 6.0% but **leave disabled on every invoice** until accountant confirms which line items are taxable for PPF/ceramic/tint installation in GA (materials likely yes, labor ambiguous)

**Full design and rationale:** `/Users/dallaseberle/.claude/plans/i-want-to-make-wondrous-canyon.md`

## Conversion Tracking
- **Google Ads:** Base tag (`AW-18137105821`) on `index.html`, `landing.html`, and `thank-you.html`. Conversion event fires on `thank-you.html` — action: "Submit lead form (1)", send_to: `AW-18137105821/JuQrCJv256gcEJ2LuchD`
- **Meta Pixel:** Pixel ID `26513218314954688`. `PageView` on all pages. `Lead` event fires on `thank-you.html`.

## Hours
- Monday - Friday: 8am - 6pm
- Saturday: 9am - 4pm
- Sunday: Closed

## Still TODO

### Invoicing / Payments (blocking — biggest open item)
- [ ] **Sign up for QuickBooks Online** (Simple Start ~$30/mo or Essentials ~$60/mo). Identity verification takes ~1 business day.
- [ ] **Enroll in QuickBooks Payments**; add bank account for payouts.
- [ ] **Configure QB service items**: `Window Tint`, `PPF - Full Front`, `PPF - Full Front + Lower Sides`, `PPF - Full Body`, `Ceramic Coating`, plus any bundle SKUs.
- [ ] **Configure sales tax at 6.0%** in QB but leave disabled on invoices until accountant confirms.
- [ ] **Customize QB invoice template**: ClearEdge royal purple `#7851A9`, logo, business contact info, payment terms ("Deposit due upon receipt to reserve appointment. Balance due at pickup.")
- [ ] **Set up QB payment reminders**: email reminder 3 days before service if deposit unpaid.
- [ ] **Call accountant or GA DOR** about sales tax treatment of PPF/ceramic/tint installation in Georgia — materials taxable, labor taxable, combined or split? Flip QB sales tax live only after this is answered.
- [ ] **Agree on phone-close script** with partner: "$250 deposit ($99 for tint-only) to lock in your slot. I'll send a QB invoice now, you can pay from your phone. Balance due at pickup. Deposit is refundable with 48 hours notice."
- [ ] **Add Airtable fields** once QB is live (5 fields + 1 status option — see CRM & Invoicing section)
- [ ] **End-to-end test** an invoice through the full flow (create lead → close → QB invoice → pay deposit on a real card → log balance manually → confirm Airtable mirrors state)

### Marketing / Site
- [ ] Gallery section with real vehicle photos
- [ ] `logo-full.png` not placed on site yet
