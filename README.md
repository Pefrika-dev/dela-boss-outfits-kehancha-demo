# DE LA BOSS OUTFITS — website concept demonstration

A complete, responsive fashion storefront and LocalStorage-backed admin dashboard built as a **website concept demonstration** for **DE LA BOSS OUTFITS**, Kehancha, Migori County, Kenya.

> **Important:** This is not the official website of DE LA BOSS OUTFITS. It is an independent proposal demonstration created by **Thomas Hondo Chacha — Software Engineer**. It has not been commissioned, approved, endorsed or launched by the business. All products, prices, stock levels, orders, customers and testimonials-free editorial copy are sample data for demonstration only.

---

## 1. What this demo shows

A full shopping journey with no backend, no framework and no build step:

- A branded storefront with hero, categories, curated products, campaign, benefits and newsletter sections.
- A filterable, sortable shop with search, category, price, size and colour filters, active-filter chips, product counts, load-more pagination and an empty state.
- Product detail pages with image gallery, size/colour selection, stock-aware quantity limits, add-to-cart, WhatsApp enquiry and related products.
- A persistent cart with variant-level line items, quantity controls, stock validation, recommendations and WhatsApp handoff.
- A checkout with Kenyan phone validation, 47 counties, collection or demonstration delivery, an order summary, demo order references and a confirmation screen.
- A demonstration admin dashboard with overview metrics, product CRUD, inventory management, order status workflow, derived customers, settings and CSV exports.
- About, contact and custom 404 pages.

No payment is taken, no message is sent, no order reaches the business and nothing is uploaded to a server. Everything stays in the browser.

---

## 2. Running the demo

Because the site loads shared JavaScript and local images, serve it over HTTP rather than opening files directly with `file://`.

### Option A — Python (already installed on most systems)

```bash
cd "Dela Boss outfits-kehancha website proposal demo"
python -m http.server 8080
```

Then open <http://localhost:8080/>.

### Option B — Node.js

```bash
npx serve .
```

### Option C — Any static host

Upload the whole folder to Netlify, Cloudflare Pages, GitHub Pages, Vercel or ordinary shared hosting. There is no build command and no environment variable to configure. The folder itself is the deployable site.

**Do not** open `index.html` by double-clicking if you want to test LocalStorage-backed flows across pages; browsers treat `file://` pages inconsistently.

---

## 3. Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home page: hero, categories, featured products, campaign, benefits, newsletter |
| `shop.html` | Full catalogue with search, filters, sorting and pagination |
| `product.html` | Product detail page (`product.html?id=db-001`) |
| `cart.html` | Shopping bag with variant lines and totals |
| `checkout.html` | Demonstration checkout and order confirmation |
| `about.html` | Concept explanation, supplied business details and demo boundaries |
| `contact.html` | Supplied contact details, WhatsApp links and local-only enquiry form |
| `faq.html` | Ordering, delivery, payment, sizing and data questions, with `FAQPage` schema |
| `size-guide.html` | Standard body measurements for clothing and footwear conversions |
| `returns.html` | Proposed returns and exchanges policy, clearly marked as awaiting owner approval |
| `privacy.html` | What the preview stores in the browser, what it never collects, and how to clear it |
| `admin.html` | Demonstration admin dashboard |
| `404.html` | Custom not-found page |

Every public page includes unique title/description metadata, canonical URLs on the live Netlify domain, Open Graph tags and `index, follow`. `index.html` carries `ClothingStore` and `WebSite` structured data, `faq.html` carries `FAQPage` and `BreadcrumbList`, and the remaining information pages carry `BreadcrumbList`. Transactional/demo-only pages (`cart.html`, `checkout.html`, `product.html`, `admin.html`, `404.html`) stay `noindex, nofollow`. `robots.txt` and `sitemap.xml` are included at the project root; the sitemap lists the eight indexable pages.

---

## 4. Project structure

```
.
├── index.html
├── shop.html
├── product.html
├── cart.html
├── checkout.html
├── about.html
├── contact.html
├── admin.html
├── 404.html
├── favicon.svg
├── README.md
├── assets
│   ├── fonts
│   │   ├── cormorant-garamond.woff2
│   │   └── manrope.woff2
│   ├── icons
│   │   └── monogram.svg
│   └── images
│       ├── categories/       six category images
│       ├── editorial/        hero, campaign and about imagery
│       ├── products/         25 product images + detail crops
│       └── placeholder.svg   branded fallback image
├── css
│   ├── style.css             design tokens, layout, shared components
│   ├── shop.css
│   ├── product.css
│   ├── cart.css
│   ├── checkout.css
│   ├── about.css
│   ├── contact.css
│   ├── admin.css
│   └── 404.css
└── js
    ├── products.js           sample catalogue, categories, sample orders
    ├── app.js                shared data layer, cart, orders, dialogs, helpers
    ├── home.js
    ├── shop.js
    ├── product.js
    ├── cart.js
    ├── checkout.js
    ├── contact.js
    └── admin.js
```

The extra CSS and JS files (`about.css`, `contact.css`, `404.css`, `home.js`, `contact.js`) keep each page's presentation separate while sharing the common design system in `style.css` and the data layer in `app.js`.

---

## 5. Sample data

### Catalogue

`js/products.js` contains **25 sample products** (`db-001` to `db-025`) across six categories:

- Men
- Women
- Shoes
- Accessories
- Essentials
- New

Prices, descriptions, colours, sizes, stock figures and imagery are invented or licensed stock material and are **not** the shop's real catalogue. Product names such as "The Kehancha Oxford Shirt" are editorial sample names, not confirmed product names.

### Orders

Three clearly labelled sample orders are seeded on first load:

- `DB-PRV-1001`
- `DB-PRV-1002`
- `DB-PRV-1003`

These exist only to demonstrate the order dashboard. They are fictional.

### Contact facts

Only the details supplied for the proposal are used:

- Phone: **+254 758 102 552**
- Phone: **+254 707 421 337**
- WhatsApp: **+254 758 102 552** (`+254758102552`)
- Location: **Kehancha, Migori County, Kenya**

No opening hours, delivery coverage, social handles, email address, awards, history or testimonials have been invented. Where a detail was not supplied, the interface deliberately omits it or labels it as "to be confirmed".

---

## 6. LocalStorage model

All state is namespaced under `delaboss.demo.v1.`:

| Key | Contents |
| --- | --- |
| `delaboss.demo.v1.products` | Catalogue, prices, stock, sizes, colours, image paths |
| `delaboss.demo.v1.settings` | Store name, phones, WhatsApp number, currency, low-stock threshold, delivery fee, announcement |
| `delaboss.demo.v1.orders` | Orders, line items, customer details, statuses, references |
| `delaboss.demo.v1.cart` | Persistent bag lines keyed by `productId|size|colour` |
| `delaboss.demo.v1.activity` | Recent demonstration admin/order activity |
| `delaboss.demo.v1.subscribers` | Newsletter sign-ups entered in this browser |
| `delaboss.demo.v1.enquiries` | Contact enquiries entered in this browser |

If LocalStorage is unavailable or full, the data layer falls back to in-memory storage for the current page and warns in the console. Admin save actions surface a visible error rather than silently pretending data was saved.

### Resetting

Admin → **Settings** → **Reset demo data** (or the settings panel's reset card) restores the original sample catalogue, the three demo orders, default settings and an empty bag after two confirmations. You can also clear site data in the browser's developer tools.

---

## 7. Admin dashboard

Open [`admin.html`](admin.html) directly. It is **intentionally unauthenticated**, because a fake login would be misleading in a prototype. A prominent warning explains that it must be protected before production.

### Overview

- Revenue/order metrics from non-cancelled demonstration orders
- Low-stock and out-of-stock counts
- Recent orders and recent activity

### Products

- Search and category filter
- Add, edit and delete products
- Image upload with client-side compression to a data URL (kept small for LocalStorage limits)
- Multi-size and multi-colour values
- Optional compare-at price and stock

### Inventory

- Searchable stock table with state badges (In stock / Low stock / Out of stock)
- Quick stock adjustments with steppers
- Low-stock threshold from Settings
- CSV export

### Orders

- Order list with status filters and search
- Order detail view with customer, fulfilment and line items
- Status workflow: Pending → Confirmed → Processing → Ready for Collection → Completed, or Cancelled
- WhatsApp contact link using the order's number
- CSV export

**Inventory rule:** stock is deducted only when an order moves into `Confirmed`, `Processing`, `Ready for Collection` or `Completed`. It is restored if the order moves back to `Pending` or `Cancelled`, or if a deducted order is deleted. A status change that would take stock below zero is refused with an explanatory message.

### Customers

Derived from demonstration orders (not a separate editable database). Includes totals and CSV export plus a privacy note.

### Settings

- Store name, location, phone numbers, WhatsApp number
- Currency label, delivery fee (0 means "to be agreed"), low-stock threshold
- Announcement text and visibility
- Reset demonstration data

### CSV exports

Products, inventory, orders, customers and the activity log can be downloaded as UTF-8 CSV with a BOM so Excel opens them correctly. All exports contain demonstration data only.

---

## 8. WhatsApp integration

WhatsApp links are generated client-side using the number in **Admin → Settings → WhatsApp number**. They open `wa.me` with a pre-filled message containing the item, variant, quantity or order reference.

Two caveats:

1. The link only opens the user's own WhatsApp client/web page; this demo cannot verify that a message was sent.
2. Before launch, the business must confirm the correct WhatsApp number, message wording and who will respond.

The default is `+254758102552`, as supplied for this proposal.

---

## 9. Order and checkout behaviour

- Checkout requires a name, a valid Kenyan phone number, an email (format-checked) and confirmation that the order is a demonstration.
- Phone validation accepts common Kenyan forms such as `0712 345 678`, `+254 712 345 678` and `254712345678`.
- Delivery adds the demo delivery fee from Settings; if it is `0`, the summary says the fee is to be agreed. Collection has no fee.
- Submitting creates a local demonstration order with a `DB-DEMO-` reference, clears the bag, shows a confirmation screen and offers a WhatsApp handoff.
- No payment information is collected and no payment is claimed to have happened.
- Checkout blocks lines that are out of stock or exceed available stock, directing the customer back to the bag.

---

## 10. Accessibility and responsive design

- Semantic landmarks (`header`, `nav`, `main`, `footer`), skip link, visible focus styles and logical heading order
- Keyboard-operable dialogs (Escape to close, focus handling) for search and quick view
- Descriptive `alt` text on editorial and product imagery
- `aria-live` regions for cart counts, filters, toasts and form errors
- Form labels, error messages linked with `aria-describedby`, and `aria-invalid` states
- `prefers-reduced-motion` support to reduce transitions and animation
- Responsive layouts verified at desktop, tablet and narrow mobile widths
- Native `<dialog>` elements where supported, plus fallbacks in the shared script

---

## 11. Known limitations

- **No backend.** Data lives only in the current browser. Two devices will not share a cart, order or stock count.
- **No real authentication.** The admin area must be protected before any real deployment.
- **No payments.** Checkout is a demonstration; no M-Pesa, card or COD integration exists.
- **No email/SMS/WhatsApp sending.** Forms store locally; WhatsApp links open an external app.
- **LocalStorage size limits** (typically ~5 MB) constrain uploaded images and catalogue size.
- **Sample data only.** Prices, stock, product names and orders are illustrative.
- **Unverified business details.** Anything not supplied for the proposal is omitted or marked as to be confirmed.
- **Hosting metadata.** Canonical URLs and Open Graph tags currently point to the Netlify demo domain. Change them to the production custom domain before launch.
- **Image licensing.** Pexels images are suitable for the concept demo, but the business should confirm final product photography rights before launch.

---

## 12. Production checklist

Before this concept becomes a live shop:

1. Replace every sample product, price, description and stock figure with confirmed business data.
2. Replace stock/editorial imagery with the shop's own photography and obtain usage rights.
3. Set the real WhatsApp number, phone numbers, location wording and any real email/social details in Settings and page copy.
4. Point canonical URLs, `sitemap.xml` and `robots.txt` at the production domain, then resubmit the sitemap in Google Search Console.
5. Keep the transactional pages `noindex`; only the public marketing pages should be indexed.
6. Move the catalogue, orders and settings to a real backend/database.
7. Add authentication and role-based access for the admin dashboard.
8. Integrate a verified payment method and a real order-notification workflow if required.
9. Add server-side validation, rate limiting and spam protection for forms.
10. Host contact/enquiry handling with a privacy policy and data-retention rules compliant with Kenya's Data Protection Act.
11. Test on real low-end Android devices and slow mobile networks; re-check image sizes and fonts.
12. Have the business review all copy, claims and contact details before publishing.

---

## 13. Credits

### Design and development

Concept, design and front-end implementation: **Thomas Hondo Chacha — Software Engineer**.

### Photography

All photographs are licensed stock from [Pexels](https://www.pexels.com/license/) and are used here as placeholder/sample imagery for the demonstration. They do not depict DE LA BOSS OUTFITS products, premises or team.

#### Store photography slots

`index.html` and `about.html` include an "Inside the store" gallery whose tiles stay as labelled placeholders until original shop photographs are supplied. Drop files named `store-01.jpg` … `store-05.jpg` into `assets/images/store/` and they appear automatically — no HTML edit required. Requirements and suggested subjects are documented in `assets/images/store/README.md`.

Slots in use: five on the home page (`store-01` … `store-05`), three on the about page (`store-01`, `store-02`, `store-05`). Files must be portrait 3:4, roughly 900 × 1200 px or 1200 × 1600 px, JPG or WebP, and must be owned or licensed by the business.

| Use | Pexels photo ID |
| --- | --- |
| Product `db-001` | 9955929 |
| Product `db-002` | 17901286 |
| Product `db-003` | 10005224 |
| Product `db-004` | 16428589 |
| Product `db-005` | 9742586 |
| Product `db-006` | 37934905 |
| Product `db-007` | 30246242 |
| Product `db-008` | 17749083 |
| Product `db-009` | 31240333 |
| Product `db-010` | 16624072 |
| Product `db-011` | 1108982 |
| Product `db-012` | 26761457 |
| Product `db-013` | 5710077 |
| Product `db-014` | 30128844 |
| Product `db-015` | 14174467 |
| Product `db-016` | 5413294 |
| Product `db-017` | 8670488 |
| Product `db-018` | 20763458 |
| Product `db-019` | 8801195 |
| Product `db-020` | 32498584 |
| Product `db-021` | 1493113 |
| Product `db-022` | 34479701 |
| Product `db-023` | 7764611 |
| Product `db-024` | 18186106 |
| Product `db-025` | 35685416 |
| Hero editorial | 38169129 |
| Campaign editorial | 35564443 |
| About editorial | 40114275 |
| Men category | 17901286 |
| Women category | 14162172 |
| Shoes category | 5710077 |
| Accessories category | 3892369 |
| Essentials category | 7764611 |
| New category | 28625806 |

Source pages follow the pattern `https://www.pexels.com/photo/<id>/`.

The Pexels license permits free use, including commercial use, without attribution; attribution is provided here as good practice. It does not permit selling unmodified copies of the photos or implying endorsement by the people depicted.

### Typography

- **Cormorant Garamond** — display serif, SIL Open Font License
- **Manrope** — sans-serif, SIL Open Font License

Both are self-hosted as WOFF2 files in `assets/fonts/` for reliable, privacy-friendly loading. They were obtained from Google Fonts.

### Icons

Interface icons are inline SVG drawn for this project. The monogram and favicon are original SVG assets.

---

## 14. Disclaimer

This project is a **demonstration and proposal only**. It is not affiliated with, authorised by, or an official representation of DE LA BOSS OUTFITS. All business details are included solely as context supplied for the proposal. Sample products, prices, orders, customers and analytics are fictional. No commercial transaction, booking, message or payment takes place.

© 2026 Thomas Hondo Chacha. Demonstration concept.
