# Debug Configuration

This directory contains configuration files for controlling debug behavior throughout the application.

## Debug Control

### `debug.ts`

Controls debug logging throughout the application. Modify the `DEBUG_MODE` constant to control logging behavior:

```typescript
// Development (default)
export const DEBUG_MODE = __DEV__; // Automatically true in development, false in production builds

// Always enabled (for testing)
export const DEBUG_MODE = true;

// Always disabled (for production)
export const DEBUG_MODE = false;
```

### Usage

Import the debug utilities in your files:

```typescript
import { debugLog, debugError, debugWarn, authDebugLog, authDebugError } from '../config/debug';

// General debug logging
debugLog('This will only show in debug mode');
debugError('This error will only show in debug mode');
debugWarn('This warning will only show in debug mode');

// Auth-specific debug logging
authDebugLog('Auth operation started');
authDebugError('Auth operation failed');
```

### Environment Control

- **Development**: Debug logging is automatically enabled (`__DEV__` is true)
- **Production**: Debug logging is automatically disabled (`__DEV__` is false)
- **Manual Override**: Set `DEBUG_MODE = true/false` to override automatic behavior

### Benefits

1. **Performance**: No logging overhead in production builds
2. **Security**: Sensitive information is not logged in production
3. **Flexibility**: Easy to enable/disable logging for testing
4. **Consistency**: Centralized logging configuration
5. **Categorization**: Different log types (debug, error, warn) for different purposes

### Best Practices

1. Use `debugLog` for general debugging information
2. Use `debugError` for error conditions
3. Use `debugWarn` for warning conditions
4. Use `authDebugLog`/`authDebugError` for authentication-related logging
5. Never log sensitive information (passwords, tokens, etc.)
6. Use descriptive messages that help with debugging
