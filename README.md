# 🌤️ SKYCAST

A modern, responsive weather dashboard built with React, TypeScript and Open-Meteo.

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-SKYCAST-blue?style=for-the-badge)](https://skycast-lovat-two.vercel.app)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/nitinpandey-dev/SKYCAST)

---

## ✨ Features

- 🌤️ Real-time weather information
- 📍 Current location detection
- 🔎 Global city search
- 📊 24-hour forecast
- 📅 7-day forecast
- 🌙 Light / Dark mode
- ⭐ Favorite locations
- 🌡️ Celsius / Fahrenheit
- 📱 Fully responsive

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM
- **API**: Open-Meteo (No API key required)

## Weather API

This project uses the **Open-Meteo API** (https://open-meteo.com/), which is a highly reliable open-source weather API that offers free access for non-commercial use (up to 10,000 requests per day) without requiring an API key. 

Location search is powered by the Open-Meteo Geocoding API, and reverse geocoding (for "Use my location") is handled by BigDataCloud's free client-side API.

## Environment Variables

Since Open-Meteo does not require an API key, this project can be run immediately without any configuration. However, if you wish to configure the API base URLs for a proxy or enterprise tier, you can copy the `.env.example` file:

```bash
cp .env.example .env
```

## Installation

```bash
# Install dependencies
npm install
```

## Running Locally

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## Production Build

```bash
# Build the application for production
npm run build

# Preview the production build locally
npm run preview
```

## Deployment

This Vite application can be easily deployed to services like Vercel, Netlify, or Cloudflare Pages. 

For Vercel/Netlify:
1. Connect your repository.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Ensure rewrite rules are configured for React Router (SPA fallback) if deploying to a static host.

## Project Structure

- `src/components/`: Reusable UI components (Header, Forecasts, Details, etc.)
- `src/contexts/`: React Contexts (SettingsContext for Theme/Units/Favorites)
- `src/hooks/`: Custom React hooks (`useWeather`, `useGeolocation`)
- `src/pages/`: Main page layouts (`Home.tsx`)
- `src/services/`: API integration layer (`weatherService.ts`)
- `src/types/`: TypeScript definitions
- `src/utils/`: Formatting and conversion helpers
- `src/index.css`: Global styles and Tailwind configuration

## Troubleshooting

- **Location Denied**: If the application cannot access your location, it will default to a sensible fallback (e.g., New York). You can still use the search bar to find any city.
- **Blank Screen / Build Errors**: Ensure you have run `npm install`. This project uses Tailwind CSS v4 which requires `@tailwindcss/postcss`.
