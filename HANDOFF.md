# ClearEdge Film & Coatings — Project Handoff

## Project Location
`/Users/dallaseberle/clearedge/`

## What This Is
A static HTML website for ClearEdge Film & Coatings — a PPF, ceramic coating, and window tint shop based in Kennesaw, GA.

## File Structure
```
clearedge/
├── index.html          # Homepage
├── about.html
├── contact.html
├── faq.html
├── gallery.html
├── css/style.css       # All styles (single stylesheet)
├── js/main.js          # JS (FAQ accordion, nav scroll, stats counter, popup, hero slideshow)
├── images/
│   ├── logo.png        # Horizontal shield lockup (used in nav/footer)
│   ├── logo-full.png   # Full logo with car (unused so far)
│   ├── JOHN1.png       # Technician installing PPF on black Porsche
│   ├── audi-rs6.jpg    # Grey Audi RS6 in shop
│   ├── bentley.jpg     # Black Bentley Continental GT (background-position: 65% center)
│   └── bmw-m4.jpg      # Green BMW M4 in shop
└── services/
    ├── ppf.html
    ├── ceramic.html
    └── tint.html
```

## Branding
- **Primary color:** Royal Purple `#7851A9` (CSS var: `--gold`, kept the variable name)
- **Hover:** `#9168C0` / **Dark:** `#5C3D8A`
- **Background:** `#080808` (near black)
- **Fonts:** Montserrat (headings) + Inter (body) via Google Fonts

## What's Been Done
- [x] Logo images swapped in on all 8 pages (nav + footer)
- [x] Yellow/gold color replaced with royal purple throughout
- [x] Button/badge text updated to white for legibility on purple
- [x] Hero section: full-background slideshow with 4 car photos (BMW first), 5s interval, Ken Burns zoom, dark overlay, drop shadow on text
- [x] Hero headline changed to "Atlanta Area's / Premier Protection / Specialists" (middle line purple)
- [x] "Why ClearEdge" section image: JOHN1.png (PPF install on Porsche) wired in
- [x] "How It Works" subtitle removed from homepage
- [x] PPF packages updated (see below)

## PPF Package Changes (services/ppf.html)
| Package | Items |
|---|---|
| Partial Front | Hood leading 12–18", Full front bumper, Fender leading edges *(mirror caps removed)* |
| Full Front | Full hood, Full front bumper, Full fenders *(mirrors/headlights/A-pillars moved out)* |
| Full Front + Lower Sides *(was "Track Package")* | Everything in Full Front + Side mirrors, Headlights & fog lights, A-pillars, Rocker panels, Lower doors, Door cup handles *(rear bumper & trunk ledge removed)* |
| Full Body | All body panels, Roof option, 10-year warranty, Custom quote only |

## Still Placeholder / TODO
- Phone number: `(770) 555-0000` — replace with real number
- Email: `hello@clearedgefilms.com` — replace with real email
- Gallery images: all placeholders — need real vehicle photos
- Team section (about.html): placeholder initials — needs real photos/bios
- Copyright year: currently 2024 — update to current year
- `logo-full.png` not yet placed on site — could go in hero or about page

## How to Open
```
open /Users/dallaseberle/clearedge/index.html
```
