# Car Collection System

A modern, responsive, automotive dealership and car collection management web and mobile application.

---

## 🛠 Root Cause of Vercel 404 NOT_FOUND & The Permanent Fix

### Exact Cause of the Error:
1. **Missing Web Entry Point:** The repository root previously lacked a web entry point (`index.html`), `package.json`, and Vite build configuration. When deployed to Vercel, the platform found no web entry file to build or serve, leading to `404: NOT_FOUND`.
2. **Missing SPA Rewrites:** Without a `vercel.json` rewrite configuration (`{ "source": "/(.*)", "destination": "/index.html" }`), any direct navigation or page refresh on client routes (such as `/dashboard`, `/cars`, `/add`, `/contact`) causes Vercel's static router to look for a physical directory and return HTTP 404 NOT_FOUND.

### The Permanent Fix Applied:
1. **Configured `index.html` at the Root:** Created the standard Vite HTML entry point with `#root` container linking to `/src/main.jsx`.
2. **Configured `package.json` & Vite:** Configured dependencies (`react`, `react-dom`, `lucide-react`) and standard build scripts (`"build": "vite build"` producing `dist/`).
3. **Configured `vercel.json`:**
   ```json
   {
     "framework": "vite",
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
4. **Vite Production Build Verified:** `npm run build` generates the complete `dist/` directory containing `dist/index.html` and bundled assets.

---

## 🚀 Features

* **Home & Showcase Landing:** Hero header, live fleet metrics, featured supercars spotlight, quick actions.
* **Dashboard:** Real-time fleet metrics (Total Fleet, Available Units, Sold Units, Total Valuation in $M), inventory readiness bars, and powertrain distribution (Electric, Hybrid, Petrol).
* **Inventory Management (Full CRUD):**
  * Real-time search across Brand, Model, Registration, and Color.
  * Filters for Brand, Fuel Type, and Availability Status.
  * Sorting by Price (High/Low) and Year (Newest/Oldest).
  * Dual View Modes: Grid Cards vs. Compact Table.
  * Add & Edit Vehicle forms with validation and HD preset photo picker.
  * Delete vehicle with confirmation safety modal.
* **Vehicle Details:** Comprehensive modal with full specifications, curator notes, and quick status lifecycle switches (*Available*, *Sold*, *Reserved*).
* **Contact Showroom:** Showroom headquarters address, direct telephone lines, and functional inquiry form.
* **404 Route Recovery:** Built-in route fallback for unrecognized paths.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run local development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🌐 Vercel Deployment Guide

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New** → **Project**.
3. Select your repository.
4. Verify the default settings:
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Click **Deploy**.
