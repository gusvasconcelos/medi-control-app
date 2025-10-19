# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo (SDK 54) for medical control purposes. The app uses TypeScript, NativeWind (Tailwind CSS for React Native), and expo-router for file-based navigation.

## Development Commands

### Running the Application
```bash
npm start               # Start Expo development server
npm run android         # Run on Android emulator/device
npm run ios             # Run on iOS simulator/device
npm run web             # Run in web browser
```

### Code Quality
```bash
npm run lint            # Run ESLint
```

### Project Reset
```bash
npm run reset-project   # Move starter code to app-example and create blank app directory
```

## Architecture

### Authentication System

The app implements a complete token-based authentication flow:

1. **AuthContext** (`src/contexts/AuthContext.tsx`): Provides global authentication state
   - Manages user state and authentication status
   - Handles bootstrap/initialization on app start
   - Exposes `signIn`, `signOut`, and `refreshProfile` methods
   - Wraps the app at the root layout level (`app/_layout.tsx`)

2. **Token Management** (`src/lib/storage/auth-storage.ts`):
   - Uses cross-platform secure storage (see Storage System below)
   - Mobile: `expo-secure-store` (encrypted keychain)
   - Web: `localStorage` (fallback)
   - Stores access token and optional refresh token
   - Keys: `medi-control.access-token` and `medi-control.refresh-token`

3. **API Client** (`src/api/index.ts`):
   - Axios-based HTTP client with automatic token injection
   - Request interceptor adds Bearer token to Authorization header
   - Response interceptor handles 401 errors with automatic token refresh
   - Formats all API errors into a consistent `ApiError` structure

4. **Auth Service** (`src/api/services/auth.ts`):
   - `login()`: Authenticate and receive tokens
   - `logout()`: Server-side session cleanup
   - `refreshToken()`: Get new access token
   - `getCurrentUser()`: Fetch authenticated user profile

### Navigation Structure

Uses expo-router with file-based routing:
- `app/_layout.tsx`: Root layout with AuthProvider and ThemeProvider
- `app/(tabs)/`: Tab-based navigation structure
- Typed routes enabled via `experiments.typedRoutes` in app.json

### API Configuration

- Base URL: Configurable via `EXPO_PUBLIC_API_BASE_URL` environment variable (defaults to `http://localhost:8080/api`)
- Timeout: 10 seconds
- Routes defined in `src/constants/api.ts` under `API_ROUTES` constant
- Current routes: `/v1/auth/{login,logout,refresh,me}`

### Type Definitions

All types centralized in `src/@types/`:
- `auth/auth.d.ts`: Authentication request/response types
- `user/user.d.ts`: User model
- `index.d.ts`: Exports all types and defines `ApiError`

Path alias `@/*` maps to project root for clean imports.

### Storage System

Cross-platform storage with automatic platform detection:

1. **Secure Storage** (`src/lib/storage/secure-storage.ts`):
   - For sensitive data: tokens, passwords, API keys
   - Mobile: `expo-secure-store` (encrypted keychain)
   - Web: `localStorage` (⚠️ not encrypted)
   - Methods: `setSecureItem()`, `getSecureItem()`, `deleteSecureItem()`

2. **Async Storage** (`src/lib/storage/async-storage.ts`):
   - For general non-sensitive data: preferences, cache, UI state
   - Mobile: `@react-native-async-storage/async-storage`
   - Web: `localStorage`
   - Methods: `setItem()`, `getItem()`, `setObject()`, `getObject()`, `multiGet()`, `multiSet()`, etc.

3. **Storage Hooks** (`src/hooks/useStorage.ts`):
   - `useStorage()`: String values with auto-sync
   - `useStorageObject()`: Object values with JSON serialization
   - `useStorageBoolean()`: Boolean flags with toggle support

4. **Storage Keys** (`src/lib/storage/storage-keys.ts`):
   - Centralized, type-safe key management
   - Prevents typos with autocomplete
   - Namespaced with `medi-control.` prefix

See `docs/STORAGE.md` for complete documentation and examples.

### Components System

Components are organized following `docs/ARCHITECTURE.md`:

1. **Core Components** (`src/components/core/`):
   - Generic, reusable UI components (Button, Input, Card, Modal)
   - Business logic agnostic
   - Can be used anywhere in the application
   - Examples: `Input` with API error validation

2. **Feature Components** (`src/components/features/`):
   - Application-specific components
   - Contains business logic and domain coupling
   - Examples: UserProfileCard, MedicationSchedule, etc.

3. **Import Pattern**:
   - Always import from barrel: `import { Input } from '@/src/components'`
   - Both core and feature components are re-exported from main index

See `docs/COMPONENTS.md` for complete documentation and `src/components/README.md` for development guide.

### Styling

NativeWind (TailwindCSS) integration:
- Config: `tailwind.config.js` with medical color palette
- Global styles: `global.css`
- Type definitions: `nativewind-env.d.ts`
- Medical Design System colors defined in `src/constants/colors.ts`
- Full dark mode support (see `docs/DARK_MODE.md`)

**Color Palette**:
- Primary: Medical Blue (`#0D7FFF`)
- Health: Health Green (`#13C57B`)
- Destructive: Alert Red (`#ED3939`)
- Background Light: `#F8FAFB`
- Background Dark: `#171D2A` (medical dark blue)

Use semantic color classes for consistency:
- `bg-background dark:bg-dark-background`
- `text-foreground dark:text-dark-foreground`
- `border-border dark:border-dark-border`

## Key Configuration

- **TypeScript**: Strict mode enabled
- **Expo Features**:
  - New Architecture enabled (`newArchEnabled: true`)
  - React Compiler experimental feature enabled
  - Typed routes enabled
  - Edge-to-edge rendering on Android
- **Deep Linking**: Custom scheme `medicontrolapp://`

## Important Patterns

1. **Error Handling**: All API errors are normalized to `ApiError` format with `reqId`, `message`, `statusCode`, `code`, and `details`

2. **Async Initialization**: AuthContext bootstraps on mount, checking for stored tokens and fetching user profile before marking initialization complete

3. **Automatic Token Refresh**: 401 responses trigger automatic token refresh attempt before retrying the original request (single retry with `_retry` flag)

4. **Context Usage**: Use the `useAuth` hook (`src/hooks/useAuth.ts`) to access auth context rather than consuming context directly
