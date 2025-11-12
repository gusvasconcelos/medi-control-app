---
name: react-native
description: Comprehensive React Native, Expo and NativeWind (Tailwind) standards for mobile development. Use when building mobile apps, creating components, implementing navigation, or working with cross-platform features. Focuses on performance, type-safety, accessibility, and platform-specific best practices.
---

# React Native, Expo & NativeWind Guidelines

Apply these standards to all React Native code. Focus on performance, cross-platform compatibility, type-safety, and mobile-first UX.

## Core Principles

### Type Safety
- Use strict TypeScript for all React Native components and hooks
- Define prop interfaces that extend native RN types: `extends TextInputProps`, `extends ViewProps`
- Leverage generic types for reusable components: `Control<TFieldValues>`, `FieldPath<TFieldValues>`
- Centralize type definitions in `@types/` with namespace pattern (`Medication.UserMedication`)
- Include both camelCase (frontend) and snake_case (API) variants in API types

### Performance First
- **Memoization**: Use `useMemo` for computed values, `useCallback` for function stability
- **Keys**: Use composite keys for lists: ``key={`${id}-${time}-${index}`}``
- **Native Driver**: Always use `useNativeDriver: true` for animations when possible
- **Avoid Inline Objects**: Memoize styles and objects passed as props
- **List Optimization**: Use `FlatList`/`SectionList` for long lists, not `ScrollView` with `.map()`

### Cross-Platform Excellence
- Use `Platform.OS` for conditional logic, not try-catch or feature detection
- Create platform-specific files when needed: `component.ios.tsx`, `component.android.tsx`
- Test on both iOS and Android; behavior differs significantly
- Handle safe areas properly with `react-native-safe-area-context`
- Use platform-appropriate components (iOS modals vs Android dialogs)

## Component Architecture

### Two-Tier System
1. **Core Components** (`src/components/core/`):
   - Generic, business-agnostic UI primitives
   - Examples: Button, Input, Card, Modal, DatePicker
   - No business logic or domain coupling
   - Highly reusable across features

2. **Feature Components** (`src/components/features/`):
   - Domain-specific with business logic
   - Examples: MedicationCard, UserProfileCard, AppointmentList
   - Can use core components and contain state management

### Component Design Patterns

**ForwardRef for Form Inputs**
```typescript
export const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, ...props }, ref) => {
    return <TextInput ref={ref} {...props} />;
  }
);

Input.displayName = 'Input';
```

**Controlled Wrapper Pattern**
```typescript
// Base uncontrolled component
export const Input = ({ value, onChangeText, ...props }) => { ... };

// Controlled wrapper for forms
export const ControlledInput = <TFieldValues extends FieldValues>({
  control,
  name,
  ...props
}: ControlledInputProps<TFieldValues>) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => <Input {...field} {...props} />}
  />
);
```

**Props Composition**
```typescript
// Extend native props, omit conflicts
interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  className?: string;
}
```

**Barrel Exports**
- Create `index.ts` in each component directory
- Re-export all components from main `src/components/index.ts`
- Import pattern: `import { Input, Button } from '@/src/components'`

## NativeWind (Tailwind) Styling

### Semantic Color System
```typescript
// Use semantic classes for dark mode support
<View className="bg-background dark:bg-dark-background">
  <Text className="text-foreground dark:text-dark-foreground">
    Content
  </Text>
</View>
```

**Color Palette Pattern**
- Define in `tailwind.config.js` with HSL format: `'primary': 'hsl(210, 95%, 51%)'`
- Use semantic names: `background`, `foreground`, `primary`, `destructive`, `muted`
- Medical/domain-specific colors: `medical-blue`, `health-green`, `alert-red`

### Styling Best Practices

**Combining NativeWind with Inline Styles**
```typescript
// Good: className for static, style for dynamic
<View
  className="flex-1 bg-background"
  style={{ paddingTop: insets.top }}
/>

// Memoize inline styles
const inputStyle = React.useMemo(
  () => ({ minHeight: 52 }),
  []
);
```

**Conditional Classes**
```typescript
// Use template literals with ternary
className={`px-4 py-2 ${disabled ? 'opacity-50' : 'opacity-100'}`}

// Trim to remove extra whitespace
className={`
  flex-1
  ${isActive ? 'bg-primary' : 'bg-muted'}
  ${hasError ? 'border-destructive' : 'border-border'}
`.trim()}
```

**Dark Mode Implementation**
- Use `useColorScheme()` from React Native or `@react-navigation/native`
- Apply `dark:` prefix for all dark mode styles
- Ensure contrast ratios meet WCAG standards in both modes

### Layout Patterns
```typescript
// Flex is default in RN (unlike web)
// Don't need to specify display: flex

// Use flex-1 for growing containers
<View className="flex-1">

// Row layouts (RN default is column)
<View className="flex-row items-center gap-2">

// Safe area handling
<SafeAreaView className="flex-1 bg-background">
```

## Navigation (Expo Router)

### File-Based Routing
```
app/
├── _layout.tsx           # Root layout
├── (tabs)/               # Tab group
│   ├── _layout.tsx
│   ├── index.tsx         # Home tab
│   └── profile.tsx       # Profile tab
├── (auth)/               # Auth group
│   ├── login.tsx
│   └── register.tsx
└── medication/[id].tsx   # Dynamic route
```

### Navigation Patterns

**Root Layout with Guards**
```typescript
export default function RootLayout() {
  const { user, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isInitializing, segments]);

  return <Slot />;
}
```

**Typed Navigation**
```typescript
// Enable in app.json
"experiments": {
  "typedRoutes": true
}

// Import typed router
import { router } from 'expo-router';

// Type-safe navigation
router.push('/medication/123');
router.replace('/(tabs)/home');
```

**Programmatic Navigation**
```typescript
// Use router, not navigation object
import { router } from 'expo-router';

router.push('/path');
router.replace('/path');
router.back();
router.setParams({ id: '123' });
```

## State Management

### Context Pattern
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: LoginData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Memoize context value to prevent unnecessary re-renders
  const value = React.useMemo(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook with error handling
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Storage Hooks
```typescript
// Type-safe storage hooks
export function useStorageObject<T>(key: string) {
  const [value, setValue] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getObject<T>(key).then((stored) => {
      setValue(stored);
      setLoading(false);
    });
  }, [key]);

  const updateValue = React.useCallback(
    async (newValue: T) => {
      await setObject(key, newValue);
      setValue(newValue);
    },
    [key]
  );

  return [value, updateValue, loading] as const;
}
```

### Local State Guidelines
- Use `useState` for simple local state
- Use `useReducer` for complex state with multiple sub-values
- Lift state only when needed; keep it local when possible
- Consider Zustand or Jotai for complex global state (avoid Redux in new projects)

## API Integration

### Axios Configuration
```typescript
// Request interceptor for token injection
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Convert camelCase to snake_case for API
    if (config.data) {
      config.data = toSnakeCase(config.data);
    }
    return config;
  }
);

// Response interceptor for error handling & token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Convert snake_case to camelCase for frontend
    if (response.data) {
      response.data = toCamelCase(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Auto-refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, log out user
        await signOut();
        return Promise.reject(refreshError);
      }
    }

    // Normalize error format
    return Promise.reject(normalizeApiError(error));
  }
);
```

### Service Layer
```typescript
// Organized by domain in /src/api/services/
export const medicationService = {
  async list(): Promise<Medication.UserMedication[]> {
    const { data } = await apiClient.get<Medication.UserMedication[]>(
      API_ROUTES.MEDICATIONS.LIST
    );
    return data;
  },

  async create(payload: Medication.CreatePayload): Promise<Medication.UserMedication> {
    const { data } = await apiClient.post(
      API_ROUTES.MEDICATIONS.CREATE,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ROUTES.MEDICATIONS.DELETE(id));
  },
};
```

### Error Handling
```typescript
// Standardized ApiError type
interface ApiError {
  reqId: string;
  message: string;
  statusCode: number;
  code: string;
  details?: Record<string, string[]>; // Field validation errors
}

// Usage in components
try {
  await medicationService.create(formData);
  toast.success('Medication created');
} catch (error) {
  const apiError = error as ApiError;
  if (apiError.details) {
    // Handle field-specific errors
    setFieldErrors(apiError.details);
  } else {
    // Handle general error
    toast.error(apiError.message);
  }
}
```

## Forms

### React Hook Form Integration
```typescript
import { useForm, Controller } from 'react-hook-form';

interface FormData {
  name: string;
  dosage: number;
  frequency: string;
}

function MedicationForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [apiErrors, setApiErrors] = React.useState<Record<string, string[]>>();

  const onSubmit = async (data: FormData) => {
    try {
      await medicationService.create(data);
    } catch (error) {
      setApiErrors((error as ApiError).details);
    }
  };

  return (
    <View>
      <ControlledInput
        control={control}
        name="name"
        label="Medication Name"
        error={errors.name?.message}
        apiErrors={apiErrors?.name}
      />
      <Button onPress={handleSubmit(onSubmit)}>Submit</Button>
    </View>
  );
}
```

### Form Validation
- Use `zod` or `yup` for schema validation with `@hookform/resolvers`
- Validate on blur for better UX: `mode: 'onBlur'`
- Show both client-side validation errors and API errors
- Merge error sources: `allErrors = [...(apiErrors || []), ...(errors || [])]`

## Platform-Specific Patterns

### Storage Abstraction
```typescript
// Secure storage for sensitive data (tokens, keys)
// src/lib/storage/secure-storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function setSecureItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

// Async storage for non-sensitive data
// src/lib/storage/async-storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}
```

### Component Variation
```typescript
// Different UI per platform
function DatePicker() {
  if (Platform.OS === 'ios') {
    return <IOSDatePickerModal />;
  }
  return <AndroidDateTimePicker />;
}

// Platform-specific behavior
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
```

### Platform Files
```
src/components/
├── Button/
│   ├── index.tsx           # Shared logic
│   ├── Button.ios.tsx      # iOS-specific UI
│   └── Button.android.tsx  # Android-specific UI
```

## Performance Optimization

### Rendering Optimization
```typescript
// Memoize expensive computations
const sortedMedications = React.useMemo(
  () => medications.sort((a, b) => a.time.localeCompare(b.time)),
  [medications]
);

// Stabilize callbacks
const handlePress = React.useCallback(
  (id: string) => {
    router.push(`/medication/${id}`);
  },
  [router]
);

// Prevent unnecessary re-renders
const MedicationCard = React.memo(({ medication }: Props) => {
  return <View>...</View>;
});
```

### List Performance
```typescript
// Use FlatList for long lists
<FlatList
  data={medications}
  renderItem={({ item }) => <MedicationCard medication={item} />}
  keyExtractor={(item) => item.id}
  // Performance props
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={10}
  updateCellsBatchingPeriod={50}
/>

// Use getItemLayout for fixed-height items
getItemLayout={(data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
})}
```

### Animation Performance
```typescript
import { Animated } from 'react-native';

const fadeAnim = React.useRef(new Animated.Value(0)).current;

React.useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true, // Critical for 60fps
  }).start();
}, []);

<Animated.View style={{ opacity: fadeAnim }}>
```

### Image Optimization
```typescript
import { Image } from 'expo-image';

// Use expo-image instead of RN Image
<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
  cachePolicy="memory-disk"
/>
```

## Accessibility (a11y)

### Essential Props
```typescript
<Pressable
  accessible={true}
  accessibilityLabel="Delete medication"
  accessibilityHint="Removes this medication from your list"
  accessibilityRole="button"
  onPress={handleDelete}
>
  <Icon name="trash" />
</Pressable>
```

### Semantic Elements
```typescript
// Use appropriate roles
<Text accessibilityRole="header">Title</Text>
<View accessibilityRole="list">
  <View accessibilityRole="listitem">Item 1</View>
</View>

// Group related elements
<View accessible={true} accessibilityLabel="User profile card">
  <Text>Name</Text>
  <Text>Email</Text>
</View>
```

### Screen Reader Testing
- Test with TalkBack (Android) and VoiceOver (iOS)
- Ensure all interactive elements have labels
- Use `accessibilityLiveRegion` for dynamic content
- Test focus order and navigation

## Testing

### Component Testing
```typescript
import { render, screen, userEvent } from '@testing-library/react-native';

describe('MedicationForm', () => {
  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<MedicationForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Name'), 'Aspirin');
    await userEvent.press(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Aspirin',
      // ...
    });
  });

  it('displays validation errors', async () => {
    render(<MedicationForm />);
    await userEvent.press(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Name is required')).toBeVisible();
  });
});
```

### Hook Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react-native';

describe('useAuth', () => {
  it('initializes with stored token', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeDefined();
    });
  });
});
```

## Common Pitfalls

### Avoid These Patterns

**❌ Inline Function Creation**
```typescript
// Bad: Creates new function every render
<Button onPress={() => handlePress(id)} />

// Good: Memoized callback
const onPress = React.useCallback(() => handlePress(id), [id]);
<Button onPress={onPress} />
```

**❌ Unkeyed Lists**
```typescript
// Bad: No keys
{items.map(item => <Item data={item} />)}

// Good: Proper keys
{items.map(item => <Item key={item.id} data={item} />)}
```

**❌ Large Bundle Size**
```typescript
// Bad: Imports entire library
import _ from 'lodash';

// Good: Import only what you need
import debounce from 'lodash/debounce';
```

**❌ Unoptimized Images**
```typescript
// Bad: Full-size images
<Image source={{ uri: profilePicUrl }} />

// Good: Optimized with resize
<Image
  source={{ uri: profilePicUrl }}
  style={{ width: 50, height: 50 }}
  resizeMode="cover"
/>
```

**❌ Blocking Main Thread**
```typescript
// Bad: Heavy computation in render
const sorted = heavySort(largeArray);

// Good: Memoized or moved to worker
const sorted = React.useMemo(() => heavySort(largeArray), [largeArray]);
```

## Security

### Input Validation
- Sanitize all user input before API calls
- Validate data types and formats on frontend
- Never trust client-side validation alone
- Use TypeScript to prevent type-based vulnerabilities

### Secure Storage
- Use `expo-secure-store` for tokens and sensitive data (not AsyncStorage)
- Never log sensitive data to console
- Clear sensitive data on logout
- Implement certificate pinning for production apps

### API Security
- Always use HTTPS, never HTTP
- Implement request timeout (10s default)
- Validate SSL certificates in production
- Add request signing for critical operations

## Bundle Size & Performance

### Optimization Strategies
- Use Hermes JavaScript engine (enabled by default in Expo SDK 54+)
- Enable ProGuard/R8 for Android release builds
- Analyze bundle with `npx expo-cli customize:web` and webpack-bundle-analyzer
- Lazy load heavy screens with dynamic imports
- Remove unused dependencies regularly

### Code Splitting
```typescript
// Lazy load heavy screens
const SettingsScreen = React.lazy(() => import('./screens/Settings'));

<Suspense fallback={<LoadingSpinner />}>
  <SettingsScreen />
</Suspense>
```

## Debugging

### React Native Debugger
- Use Flipper for debugging (network, layout, logs)
- Enable Fast Refresh for instant updates
- Use `console.log` sparingly; prefer Flipper logs
- Set breakpoints in VS Code with React Native Tools extension

### Performance Profiling
```typescript
// Use React DevTools Profiler
import { Profiler } from 'react';

<Profiler id="MedicationList" onRender={onRenderCallback}>
  <MedicationList />
</Profiler>
```

### Common Debug Commands
```bash
# Clear cache and restart
npx expo start -c

# Run on specific device
npx expo run:ios --device "iPhone 15"

# View logs
npx expo start --android --no-dev --minify
```

## Environment Configuration

### Expo Config
```javascript
// app.json or app.config.js
{
  "expo": {
    "newArchEnabled": true,
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ]
  }
}
```

### Environment Variables
```bash
# .env
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
EXPO_PUBLIC_ENVIRONMENT=production
```

```typescript
// Access in code
const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
```

## Additional Resources

### Essential Packages
- **Navigation**: `expo-router` (file-based)
- **State**: `zustand` or `jotai` (lightweight)
- **Forms**: `react-hook-form` + `zod`
- **API**: `axios` with interceptors
- **Storage**: `expo-secure-store`, `@react-native-async-storage/async-storage`
- **UI**: `nativewind` (Tailwind)
- **Images**: `expo-image` (optimized)
- **Dates**: `date-fns` (smaller than moment)

### Avoid These Libraries
- ❌ React Native Paper (heavy, opinionated)
- ❌ Redux (boilerplate, use Zustand)
- ❌ Moment.js (large, use date-fns)
- ❌ React Navigation (use expo-router)
- ❌ Styled Components (performance issues, use NativeWind)

## Checklist for New Features

- [ ] TypeScript types defined with proper generics
- [ ] Component follows two-tier architecture (core vs feature)
- [ ] Memoization applied (`useMemo`, `useCallback`, `React.memo`)
- [ ] Accessibility props added (`accessibilityLabel`, `accessibilityRole`)
- [ ] Dark mode styles with `dark:` classes
- [ ] Error handling with try-catch and ApiError type
- [ ] Loading states for async operations
- [ ] Platform-specific code tested on iOS and Android
- [ ] Form validation with react-hook-form
- [ ] Proper navigation guards if needed
- [ ] Keys on all list items
- [ ] Images optimized with proper resizing
- [ ] Security: no sensitive data in logs
- [ ] Unit tests for business logic
- [ ] Integration tests for user flows
