# ClearEdge Protective Films - Project Handoff

## What This Is
A single-page static website for **ClearEdge Protective Films**, a PPF, ceramic coating, and window tint shop in Kennesaw, GA. Deployed on Netlify at **https://clearedgeppf.com**.

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
├── index.html              # The entire site (single page)
├── css/style.css           # All styles
├── js/main.js              # FAQ accordion, nav scroll, stats counter, quote popup, hero slideshow
├── images/
│   ├── logo.png            # Main logo (used in nav + footer)
│   ├── logo-full.png       # Full logo with car graphic (unused)
│   ├── logo-header.png     # Alternate header logo (unused)
│   ├── logo-old-backup.png # Backup of previous logo
│   ├── hero-1.jpg          # Hero slideshow image 1
│   ├── hero-2.jpg          # Hero slideshow image 2
│   ├── hero-3.jpg          # Hero slideshow image 3
│   ├── hero-4.jpg          # Hero slideshow image 4 (also used in "Why ClearEdge" section)
│   └── hero-5.jpg          # Hero slideshow image 5
├── HANDOFF.md              # This file
└── .netlify/               # Netlify config + site state
```

## Page Sections (top to bottom in index.html)
1. **Quote Popup** - Modal form triggered by "Get a Quote" buttons (name, phone, email, service, vehicle)
2. **Header/Nav** - Logo, nav links, phone number, "Get a Quote" button, mobile hamburger menu
3. **Hero** - 5-image slideshow with Ken Burns zoom, headline "Atlanta Area's Premier Protection Specialists"
4. **Stats Bar** - 500+ vehicles, 5.0 rating, 10+ years, 10-year warranty (animated counters)
5. **Services** - 3 cards: PPF (marked "Most Popular"), Ceramic Coating, Window Tint
6. **PPF Packages** - Visual car diagrams + 4 package cards (Partial Front, Full Front [Most Popular], Track, Full Body)
7. **Why ClearEdge** - 4 trust points (certified, warranty, premium films, climate-controlled facility)
8. **Process** - 6-step install process
9. **Quote CTA** - "How Much For My Car?" call to action
10. **FAQ** - 5 accordion items about PPF
11. **Inline Quote Form** - Full contact form with vehicle details, service selector, "how did you find us"
12. **Footer** - Logo, service links, quick links, contact info, hours, copyright

## Branding
- **Primary accent color:** Royal Purple `#7851A9` (CSS variable is still named `--gold` from the original template)
- **Hover:** `#9168C0` / **Dark:** `#5C3D8A`
- **Background:** `#080808` (near-black)
- **Fonts:** Montserrat (headings) + Inter (body) via Google Fonts
- **Tone:** Professional but approachable. No em dashes anywhere (owner preference). Keep copy natural and human-sounding.

## Forms
Both forms (popup + inline) do client-side validation in `js/main.js`. They don't currently submit to a backend. The popup form includes SMS consent with the real phone number.

## Hours
- Monday - Friday: 8am - 6pm
- Saturday: 9am - 4pm
- Sunday: Closed

## Still TODO
- Gallery images: need real vehicle photos (no gallery section currently on the single page)
- `logo-full.png` not placed on site yet
- Forms need a backend (Netlify Forms, Formspree, etc.) to actually receive submissions
