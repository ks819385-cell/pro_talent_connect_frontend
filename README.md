# Pro-Talent-Connect Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![Router](https://img.shields.io/badge/React%20Router-7.13-CA4245?logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/API-Axios-5A29E4)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18)

<img src="src/assets/Logo@pro_talent_connect.png" alt="Pro Talent Connect" width="150" />

React SPA for public discovery and admin operations.

</div>

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [User Journeys](#user-journeys)
3. [Application Architecture](#application-architecture)
4. [Route Map](#route-map)
5. [Component and Feature Organization](#component-and-feature-organization)
6. [State and Data Strategy](#state-and-data-strategy)
7. [API Client Design](#api-client-design)
8. [Authentication UX Behavior](#authentication-ux-behavior)
9. [Caching and Deduplication](#caching-and-deduplication)
10. [Styling and UI System](#styling-and-ui-system)
11. [Project Layout](#project-layout)
12. [Environment Configuration](#environment-configuration)
13. [Developer Workflow](#developer-workflow)
14. [Testing Strategy](#testing-strategy)
15. [Build and Deployment Guidance](#build-and-deployment-guidance)
16. [Route and Sub-Route Screenshots](#route-and-sub-route-screenshots)
17. [Troubleshooting](#troubleshooting)

## Executive Summary

This frontend delivers:

- Public discovery pages for players and content.
- Admin login and dashboard interactions.
- Consistent API integration via centralized service layer.
- Guarded behavior on auth failures and network disruptions.

## User Journeys

### Public Visitor Journey

1. Land on home page.
2. Browse players and details.
3. Read blog updates.
4. Explore services/about.
5. Submit enquiry or profile request.

### Admin Journey

1. Authenticate in login page.
2. Enter dashboard.
3. Operate player/content/league/admin modules.
4. Review enquiries and profile requests.
5. Monitor logs and metrics in admin views.

## Application Architecture

```mermaid
flowchart TB
    U[User Browser] --> R[React Router]
    R --> P[Page Components]
    P --> C[Feature Components]
    P --> S[API Service Layer]
    S --> B[Backend API]
```

### Root Composition

`src/main.jsx` wraps App with:

- BrowserRouter
- ErrorBoundary
- AboutProvider

### Rendering Strategy

- Route-level lazy loading for major pages.
- Shared shell with conditional navbar/footer behavior.
- Loading fallback while lazy chunks load.

## Route Map

| Route | Audience | Purpose |
|---|---|---|
| / | Public | Home, featured content |
| /about | Public | Organization profile |
| /players | Public | Player discovery and details |
| /blog | Public | Blog listing |
| /blog/:id | Public | Blog detail |
| /services | Public | Service and process content |
| /contact | Public | Enquiry and profile request forms |
| /login | Admin | Authentication entry |
| /admin | Admin | Operational dashboard |
| * | Any | Not found handling |

## Component and Feature Organization

Main folders under `src/components`:

- admin
- blogs
- common
- contact
- dashboard
- home
- players
- services
- skeletons
- ui

Shared structural components:

- NavBar
- Footer
- ScrollToTop
- ErrorBoundary

## State and Data Strategy

State model in current implementation:

- Local state in route and feature components.
- Context provider usage for about domain (`AboutProvider`).
- Event-based refresh trigger for specific content updates.

Data model in UI:

- API responses normalized at service layer.
- UI components consume service methods rather than raw axios.

## API Client Design

Core service file:

- `src/services/api.js`

Implemented behavior:

- Configurable base URL via `VITE_API_URL`.
- Token attachment from local storage on every request.
- Global response interceptor for 401 handling.
- User-friendly messaging for network and rate-limit failures.
- Utility exports for cache clear and cache invalidation.

API service groups include:

- Auth
- OTP
- Players
- Blogs
- About
- Services
- How-it-works
- Contact and profile requests
- Dashboard stats
- Admin management
- Audit logs
- Leagues

## Authentication UX Behavior

- On successful login, token and admin payload are stored in local storage.
- Authenticated requests include Authorization header.
- On 401 response:
  - auth data is removed from local storage.
  - user is redirected to login when needed.

## Caching and Deduplication

Client API layer includes:

- TTL-based in-memory response cache.
- Prefix invalidation after mutations.
- Deduplication for duplicate in-flight GET requests.
- Abort-aware paths to avoid strict-mode false negatives.

Benefits:

- Lower repeated network traffic.
- Faster list-heavy screens.
- More stable UX during rapid navigation.

## Styling and UI System

- Tailwind CSS v4 setup.
- App-level and index-level CSS files for global concerns.
- Component-specific styling built with utility classes.
- Loading skeletons and focused empty/loading states.

## Project Layout

```text
frontend/
|- index.html
|- package.json
|- vite.config.js
|- tailwind.config.js
|- eslint.config.js
|- public/
|- src/
|  |- main.jsx
|  |- App.jsx
|  |- App.css
|  |- index.css
|  |- assets/
|  |- components/
|  |  |- admin/
|  |  |- blogs/
|  |  |- common/
|  |  |- contact/
|  |  |- dashboard/
|  |  |- home/
|  |  |- players/
|  |  |- services/
|  |  |- skeletons/
|  |  |- ui/
|  |  |- ErrorBoundary.jsx
|  |  |- NavBar.jsx
|  |  |- Footer.jsx
|  |- context/
|  |- lib/
|  |- pages/
|  |  |- AdminDashboard.jsx
|  |  |- Players.jsx
|  |  |- BlogPage.jsx
|  |  |- BlogDetailPage.jsx
|  |  |- About.jsx
|  |  |- Services.jsx
|  |  |- Contact.jsx
|  |  |- Login.jsx
|  |- services/
|  |  |- api.js
|  |- tests/
|     |- setup.js
|     |- NavBar.test.jsx
|     |- Footer.test.jsx
|     |- Login.test.jsx
|- README.md
```

## Environment Configuration

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001
```

Important note:

- If env is missing, client fallback may use another localhost port.
- Always set VITE_API_URL explicitly for reliable local/dev/prod behavior.

## Developer Workflow

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Testing Strategy

Tooling:

- Vitest
- @testing-library/react
- @testing-library/jest-dom
- jsdom

Commands:

```bash
npm run test
npm run test:watch
npm run test:ui
```

Current test files include core layout/auth components.

## Build and Deployment Guidance

Before deployment:

- Confirm VITE_API_URL for target environment.
- Verify login and dashboard flows against deployed API.
- Validate public pages and forms for successful submissions.
- Check browser console/network for CORS or auth anomalies.

## Route and Sub-Route Screenshots

Generated screenshot assets are stored under `public/readme-images/routes/` and represent the actual running UI.

### Public Route Captures

| Route | Screenshot |
|---|---|
| `/` | ![Home Route](public/readme-images/routes/home.png) |
| `/about` | ![About Route](public/readme-images/routes/about.png) |
| `/players` | ![Players Route](public/readme-images/routes/players.png) |
| `/blog` | ![Blog Route](public/readme-images/routes/blog.png) |
| `/blog/:id` | ![Blog Detail Route](public/readme-images/routes/blog-detail.png) |
| `/services` | ![Services Route](public/readme-images/routes/services.png) |
| `/contact` | ![Contact Route](public/readme-images/routes/contact.png) |
| `/login` | ![Login Route](public/readme-images/routes/login.png) |
| `*` (not found) | ![Not Found Route](public/readme-images/routes/not-found.png) |

### Admin Dashboard Sections

| Section | Screenshot |
|---|---|
| `/admin` (entry state) | ![Admin Dashboard Route](public/readme-images/routes/admin-dashboard.png) |
| Overview | ![Admin Overview](public/readme-images/routes/admin-overview.png) |
| Players | ![Admin Players](public/readme-images/routes/admin-players.png) |
| Leagues | ![Admin Leagues](public/readme-images/routes/admin-leagues.png) |
| Enquiries | ![Admin Enquiries](public/readme-images/routes/admin-enquiries.png) |
| Profile Requests | ![Admin Profile Requests](public/readme-images/routes/admin-profile-requests.png) |
| Blogs | ![Admin Blogs](public/readme-images/routes/admin-blogs.png) |
| Services | ![Admin Services](public/readme-images/routes/admin-services.png) |
| About | ![Admin About](public/readme-images/routes/admin-about.png) |
| Partners | ![Admin Partners](public/readme-images/routes/admin-partners.png) |
| Admin Management | ![Admin Admins](public/readme-images/routes/admin-admins.png) |
| Settings | ![Admin Settings](public/readme-images/routes/admin-settings.png) |

## Troubleshooting

| Symptom | Likely Cause | Action |
|---|---|---|
| API calls fail immediately | Wrong API base URL | Verify VITE_API_URL |
| Repeated redirect to login | Expired or invalid token | Re-authenticate and inspect 401 responses |
| Slow refresh after updates | Cache not invalidated yet | Trigger invalidate/clear utilities during debugging |
| Empty pages during load | Lazy chunk/network issue | Inspect network tab and fallback render paths |
| Form submit errors | Payload mismatch with backend validation | Align request body fields with backend schema |
