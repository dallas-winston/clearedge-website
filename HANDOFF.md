# ClearEdge Protective Films - Project Handoff

## What This Is
A static website for **ClearEdge Protective Films**, a PPF, ceramic coating, and window tint shop in Kennesaw, GA. Includes a main site, a Meta Ads landing page, and a 4-article blog. Deployed on Netlify at **https://clearedgeppf.com**.

## Contact Info (real, live on site)
- **Phone:** (678) 983-5212
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
- All forms use client-side validation in `main.js` and submit via Web3Forms + Discord webhook
- Meta Pixel tracks PageView on both pages; landing.js tags submissions as "Landing Page Hero Form (Meta Ad)"

## Hours
- Monday - Friday: 8am - 6pm
- Saturday: 9am - 4pm
- Sunday: Closed

## Still TODO
- Gallery section with real vehicle photos
- `logo-full.png` not placed on site yet
