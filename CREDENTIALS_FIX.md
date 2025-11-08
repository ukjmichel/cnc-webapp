# Credentials Fix for Camera Barcode Scanning

## Issue
When using the camera with HTTPS (required for browser camera access), the backend was blocking requests due to CORS configuration not allowing HTTPS origins.

## Root Cause
The backend CORS configuration only allowed:
- `http://localhost:8100`
- `http://localhost:4200`

But when using SSL for camera support, the app runs on:
- `https://localhost:8100` ❌ (was blocked)

This caused credential headers to be rejected by CORS, preventing barcode API calls from working.

## Fix Applied

### 1. Updated CORS Configuration (`server/app.ts`)

**Before:**
```typescript
app.use(cors({
  origin: ['http://localhost:8100', 'http://localhost:4200'],
  credentials: true,
}));
```

**After:**
```typescript
app.use(cors({
  origin: [
    'http://localhost:8100',
    'https://localhost:8100',  // For SSL camera development
    'http://localhost:4200',
    'https://localhost:4200',  // For SSL camera development
  ],
  credentials: true,
}));
```

### 2. Enhanced Request Logging

Added detailed logging to help debug credential issues:
```typescript
console.log(`  Origin: ${req.headers.origin || 'none'}`);
console.log(`  Credentials: ${req.headers.cookie ? 'present' : 'none'}`);
console.log(`  Authorization: ${req.headers.authorization ? 'present' : 'none'}`);
```

## How to Test

1. **Start the backend server:**
   ```bash
   npm run server:dev
   ```

2. **Start the frontend with SSL:**
   ```bash
   npm run start:camera
   ```

3. **Test barcode lookup:**
   - Navigate to **https://localhost:8100**
   - Go to **Products > New Product**
   - Click **"Scan with Camera"**
   - Scan a barcode or enter manually: `012345678905`
   - Click **"Lookup Barcode"**
   - Should succeed without CORS errors

4. **Check backend logs:**
   You should see:
   ```
   2025-11-08T... - GET /api/barcode/012345678905
     Origin: https://localhost:8100
     Credentials: none  (or "present" if cookies are set)
     Authorization: none  (or "present" if auth header is set)
   ```

## Important Notes

### Authentication is Currently Disabled for Development

Both authentication middleware are currently pass-through (TODO):
- `requireAuth` - Not checking tokens/sessions
- `requireEmployeeOrAdmin` - Not checking user roles

This is **intentional for development testing**. The barcode API will work without actual credentials.

**Files affected:**
- `src/middlewares/requireAuth.ts` - TODO: Implement JWT validation
- `src/middlewares/requireRole.ts` - TODO: Implement role checking

### Credentials Configuration

The frontend barcode service already has `withCredentials: true` configured:
```typescript
// src/app/services/barcode.service.ts
getItemByCode(code: string): Observable<CombinedBarcodeResponse> {
  return this.http.get<CombinedBarcodeResponse>(`${this.baseUrl}${code}`, {
    withCredentials: true,  // ✅ Already configured
  });
}
```

This tells the browser to include credentials (cookies, authorization headers) in cross-origin requests.

## Common Errors (Now Fixed)

### ❌ Before Fix:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/barcode/012345678905'
from origin 'https://localhost:8100' has been blocked by CORS policy:
The value of the 'Access-Control-Allow-Origin' header in the response
must not be the wildcard '*' when the request's credentials mode is 'include'.
```

### ✅ After Fix:
Request succeeds! Backend accepts `https://localhost:8100` as allowed origin.

## Future Work

When implementing actual authentication:

1. **Add JWT token validation** in `requireAuth.ts`
2. **Add role checking** in `requireRole.ts`
3. **Implement login/logout** in frontend
4. **Store auth tokens** (localStorage or httpOnly cookies)
5. **Add token refresh** mechanism
6. **Update CORS** for production domains

## Production Deployment

For production, update CORS origins:
```typescript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
  ],
  credentials: true,
}));
```

Never use wildcard `*` origins when `credentials: true`!
