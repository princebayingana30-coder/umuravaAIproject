# Google OAuth Setup Guide

## What's Been Added

### 1. **Frontend Changes** (`/client`)
- [CHECK] Updated login page with Google OAuth button
- [CHECK] Installed `@react-oauth/google` package
- [CHECK] Added Google OAuth Provider wrapper
- [CHECK] Google login handler with token exchange
- [CHECK] Updated environment configuration

### 2. **Backend Changes** (`/server`)
- [CHECK] Added `google-auth-library` for token verification
- [CHECK] Created `googleLogin` controller in `auth.controller.ts`
- [CHECK] Added `/api/auth/google` endpoint
- [CHECK] Token verification with Google's OAuth2Client
- [CHECK] JWT token generation for verified Google users

### 3. **Background Update** 
- [CHECK] Created job/talent-themed SVG background (`/client/public/illustrations/talent-bg.svg`)
- [CHECK] Updated layout to use new background with job/talent visuals
- [CHECK] Includes: candidate silhouettes, job cards, checkmarks, AI icons, matching lines

### 4. **Environment Configuration**
- [CHECK] Added `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `/client/.env.local`
- [CHECK] Added `GOOGLE_CLIENT_ID` to `/server/.env`

## How to Configure Google OAuth

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named "TalentIQ AI"
3. Enable the "Google+ API"

### Step 2: Create OAuth 2.0 Credentials
1. Go to "Credentials" in Google Cloud Console
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:5001`
5. Add Authorized redirect URIs:
   - `http://localhost:3000/login`
   - `http://localhost:3000/dashboard`
6. Copy the Client ID

### Step 3: Update Environment Variables

**Client** (`/client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
```

**Server** (`/server/.env`):
```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
```

### Step 4: Restart Servers
```bash
# Terminal 1 - Client
cd client && npm run dev

# Terminal 2 - Server  
cd server && npm run dev
```

## Features

### Frontend Login Page
- Email/password login (original)
- Divider with "OR"
- Google OAuth button (when configured)
- Demo credentials hint
- Proper error handling

### Backend Endpoint
- **Endpoint**: `POST /api/auth/google`
- **Body**: `{ token: "google_credential_token" }`
- **Response**: `{ token: "jwt_token", user: { id, email, name, picture, role } }`
- **Verification**: Uses Google's OAuth2Client to verify tokens

### User Flow
1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User authenticates with Google
4. Frontend sends Google token to `/api/auth/google`
5. Backend verifies token with Google
6. Backend generates app JWT token
7. User redirected to dashboard

## Troubleshooting

### "Google login not configured" message
- Check if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart dev server after updating env vars

### "Invalid Google token" error
- Verify `GOOGLE_CLIENT_ID` in server `.env` matches client ID
- Check that credentials are from a Web application, not native app
- Ensure redirect URIs match your localhost setup

### CORS errors
- Verify `CORS_ORIGIN=http://localhost:3000` in `/server/.env`
- Check that both servers are running

## Files Modified

1. `/client/src/app/login/page.tsx` - Added Google OAuth UI and handler
2. `/client/.env.local` - Added GOOGLE_CLIENT_ID env var
3. `/server/src/controllers/auth.controller.ts` - Added googleLogin function
4. `/server/src/routes/auth.ts` - Added /google endpoint
5. `/server/.env` - Added GOOGLE_CLIENT_ID env var
6. `/client/src/app/layout.tsx` - Updated background reference
7. `/client/public/illustrations/talent-bg.svg` - NEW job-themed background

## Testing

### Without Google OAuth (demo mode)
1. Click "Show demo credentials"
2. Use provided email/password
3. Login works with standard authentication

### With Google OAuth
1. Update `.env.local` with your Google Client ID
2. Update `/server/.env` with matching Client ID
3. Restart both servers
4. Click "Sign in with Google" on login page
5. Complete Google authentication
6. Should redirect to dashboard

## Next Steps

- Production: Use environment variables securely (no hardcoded IDs)
- Add user profile page with Google profile picture
- Consider adding logout behavior that clears Google session
- Add user registration flow for new Google users
- Implement refresh token rotation for better security
