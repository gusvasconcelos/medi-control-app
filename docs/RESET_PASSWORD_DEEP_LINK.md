# Reset Password Deep Link Configuration

## Deep Link URL Format

The reset password screen can be accessed via deep linking using the following URL format:

```
medicontrolapp://reset-password?token=TOKEN_VALUE
```

**Alternative format:**
```
medicontrolapp://(auth)/reset-password?token=TOKEN_VALUE
```

## Backend Email Configuration

When sending the password reset email from the backend (`/api/v1/auth/forgot-password` endpoint), use the following URL format:

```javascript
// Example for backend implementation
const resetPasswordUrl = `medicontrolapp://reset-password?token=${token}`;
```

The email should contain a link like:
```html
<a href="medicontrolapp://reset-password?token=abc123xyz">
  Redefinir minha senha
</a>
```

## How It Works

1. User requests password reset on the app
2. App calls `/api/v1/auth/forgot-password` with user's email
3. Backend generates a token and sends an email with the deep link
4. User clicks the link in their email
5. App opens automatically on the reset-password screen with the token as a URL parameter
6. User enters new password and submits
7. App calls `/api/v1/auth/reset-password` with the token and new password
8. On success (status 200), user is redirected to login with success message

## Testing Deep Links

### On Development (Expo Go)

```bash
# iOS Simulator
xcrun simctl openurl booted "medicontrolapp://reset-password?token=test123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "medicontrolapp://reset-password?token=test123"
```

### On Development (Development Build)

```bash
# Using Expo CLI
npx uri-scheme open medicontrolapp://reset-password?token=test123 --ios
npx uri-scheme open medicontrolapp://reset-password?token=test123 --android
```

### On Web Browser

When testing on web, you can directly navigate to:
```
http://localhost:8081/reset-password?token=test123
```

## Configuration

The deep link scheme is configured in `app.json`:

```json
{
  "expo": {
    "scheme": "medicontrolapp"
  }
}
```

With Expo Router, deep linking is automatically configured based on the file structure:
- File: `app/(auth)/reset-password.tsx`
- Route: `/reset-password` or `/(auth)/reset-password`
- Deep Link: `medicontrolapp://reset-password?token=TOKEN`

## Security Considerations

1. **Token Expiration**: Ensure tokens expire after a reasonable time (e.g., 1 hour)
2. **Single Use**: Tokens should be invalidated after successful password reset
3. **Token Validation**: Backend must validate token before allowing password reset
4. **HTTPS for Email**: While the deep link uses the custom scheme, ensure the email is sent over HTTPS
5. **Rate Limiting**: Implement rate limiting on forgot-password endpoint to prevent abuse

## Error Handling

The reset-password screen handles the following scenarios:

- **Missing Token**: Shows error and redirects to login after 2 seconds
- **Invalid Token**: Backend returns error, shown via toast
- **Expired Token**: Backend returns error, shown via toast
- **Validation Errors**: Field-specific errors are displayed below inputs
- **Network Errors**: Generic error message shown via toast

## API Endpoints

### Forgot Password
```
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response (200 OK):
{
  "message": "E-mail de recuperação enviado com sucesso."
}
```

### Reset Password
```
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "abc123xyz",
  "password": "newPassword123",
  "password_confirmation": "newPassword123"
}

Response (200 OK):
{
  "message": "Senha redefinida com sucesso."
}

Response (400 Bad Request - Invalid Token):
{
  "message": "Token inválido ou expirado.",
  "code": "INVALID_TOKEN"
}

Response (422 Unprocessable Entity - Validation Error):
{
  "message": "Erro de validação.",
  "code": "VALIDATION",
  "details": {
    "password": ["A senha deve ter pelo menos 8 caracteres."]
  }
}
```
