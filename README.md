# Car Collection System – Prestige Dealership

A modern, luxury automotive dealership and fleet inventory management web application built with React, Vite, and Tailwind CSS.

---

## 🛠 Project Overview & Vercel Deployment Fixes

### 1. UI Design & Styling Fixes
* **Luxury Automotive Theme:** Dark navy background (`#070D19`, `#0B1325`), crisp white text, and metallic gold accents (`#D4AF37`, `#F3C952`).
* **Fixed Aspect Ratio Vehicle Previews:** Vehicle photos now strictly use a fixed-height container (`h-56`) with `object-fit: cover` and centered alignment, permanently resolving oversized preview images.
* **Button Style Normalization:** Removed default browser button appearances with custom `.btn-gold`, `.btn-secondary`, `.btn-reset`, and `.btn-danger` classes with subtle elevation, hover states, and ripples.
* **Responsive Layouts:** Full desktop, tablet, and mobile support with responsive navigation, fluid grids, and slide-down mobile menus.

### 2. Required Pages
1. **Home:** Prestige showroom hero banner, live fleet metrics, featured supercars spotlight, quick navigation.
2. **Dashboard:** Real-time fleet metrics (Total Fleet, Available, Sold, Total Valuation in $M), availability readiness bars, and powertrain classifications (Electric, Hybrid, Petrol, Diesel).
3. **View Cars:** Search by brand, model, registration, or color; filter by Brand, Fuel, and Status; sort by price/year; and switch between Grid Cards and Table views.
4. **Add New Vehicle to Fleet:**
   * Prominent heading: **“Add New Vehicle to Fleet”**.
   * Fixed aspect ratio photo preview with `object-fit: cover`.
   * Fields: Car Title, Brand, Model, Year, Price, Mileage, Fuel Type, Transmission, Color, Registration Number, and Image URL or Local Upload.
   * Actions: **Save Vehicle**, **Reset**, and **Cancel**.
   * Live validation with error handling and success notifications.
5. **Contact:** Showroom headquarters address, direct telephone lines, business hours, and functional inquiry submission form.
6. **Staff Portal (Login):** Demo profile switcher for Collection Director (Alexander Vance) and Acquisitions Specialist (Sarah Connor).

### 3. Vercel SPA Routing Configuration
* `vercel.json` rewrite routing configured to direct all paths (`/(.*)`) to `/index.html`, eliminating 404 errors on page refresh.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Production build
npm run build
```

---

## 🌐 Vercel Deployment Settings

| Setting | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
