# Landscape Discover – Frontend

React + TypeScript + Vite frontend for the Landscape Discover project.

## Stack
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router v6** (routing)
- **TanStack Query v5** (server state)
- **Zustand** (client state / auth)
- **Axios** (HTTP client)

## Folder Structure
```
src/
├── assets/          # Static files: images, icons, fonts
├── components/
│   ├── common/      # Shared components (SearchBar, Pagination…)
│   ├── layout/      # Header, Footer, Sidebar, Layout wrappers
│   ├── landmarks/   # LandmarkCard, LandmarkGrid, RegionFilter…
│   ├── auth/        # LoginForm, ProtectedRoute…
│   └── ui/          # Base UI primitives (Button, Input, Modal…)
├── pages/
│   ├── Home/        # Landing page
│   ├── Discover/    # Browse & filter landmarks
│   ├── LandmarkDetail/  # Single landmark view
│   ├── About/
│   └── NotFound/
├── hooks/           # Custom React hooks
├── services/        # Axios API calls (landmarks, auth…)
├── store/           # Zustand stores
│   └── slices/
├── types/           # Shared TypeScript types/interfaces
├── constants/       # App-wide constants (regions, API paths…)
├── utils/           # Helper functions
└── styles/          # Global CSS / Tailwind base styles
```

## Getting Started
```bash
cp .env.example .env.development
npm install
npm run dev
```
