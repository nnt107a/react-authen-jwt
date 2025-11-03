# React JWT Auth Demo

This repository contains a small React single-page app that demonstrates JWT-based authentication with access + refresh tokens. It includes a mock Express backend for demo/testing.

Features
- Access token stored in memory (sessionStorage as fallback) and attached to every Axios request.
- Refresh token stored in localStorage and used to obtain new access tokens when the access token expires.
- Axios interceptors automatically refresh tokens on 401 and retry the original request.
- React Query for login mutation and protected data fetching.
- React Hook Form for login form and validation.
- Protected routes using React Router.

Getting started

1. Install dependencies

```powershell
npm install
```

2. Run the dev servers (client + mock server)

```powershell
npm run dev
```

This runs the Express mock server on http://localhost:4000 and the Vite dev server on http://localhost:5173.

Login credentials
- Email: demo@example.com
- Password: password

How it works (brief)
- On login the server returns { accessToken, refreshToken }. Access token is short-lived (30s in demo). The refresh token is long-lived.
- Axios attaches access token to Authorization for protected requests. When a request gets 401, Axios sends the refresh token to `/auth/refresh` to get a new access token and retries the original request.
- On refresh failure (expired or invalid refresh token) the app clears tokens and redirects to `/login`.