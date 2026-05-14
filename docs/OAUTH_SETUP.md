# OAuth App Setup Guide

This document explains how to register OAuth applications with VK and Yandex for the DM Dashboard authentication system.

---

## 1. VK ID Registration

Follow these steps to create a VK ID application for user authentication.

### 1.1. Start Registration

1. Go to the VK ID for Business portal: https://id.vk.com/about/business/go/
2. Sign in with your VK account
3. Navigate to the applications section and click "Create application"

### 1.2. Configure Platform

Select **"Web"** as the platform type for your application.

### 1.3. Add Redirect URIs

Add the following redirect URIs to your application settings:

```
http://localhost:4321/api/auth/callback/vk
```

For production, also add:

```
https://your-domain.com/api/auth/callback/vk
```

### 1.4. Request Scopes

Ensure the following scopes are requested during authentication:

- `profile` - Access to basic user profile information
- `email` - Access to user's email address

### 1.5. Copy Credentials

After creating the application:

1. Copy the **Client ID** (Application ID)
2. Copy the **Client Secret** (Secure key)
3. Paste both values into your `.env` file:

```env
VK_CLIENT_ID=your_vk_client_id
VK_CLIENT_SECRET=your_vk_client_secret
```

---

## 2. Yandex OAuth Registration

Follow these steps to create a Yandex OAuth application for user authentication.

### 2.1. Start Registration

1. Go to the Yandex OAuth portal: https://oauth.yandex.com/
2. Sign in with your Yandex account
3. Click "Register a new client" or "Create application"

### 2.2. Configure Platform

Select **"Web services"** as the application type.

### 2.3. Add Redirect URIs

Add the following callback URL to your application settings:

```
http://localhost:4321/api/auth/callback/yandex
```

For production, also add:

```
https://your-domain.com/api/auth/callback/yandex
```

### 2.4. Request Scopes

Add the following access permissions (scopes):

- `login:email` - Access to user's email address
- `login:info` - Access to basic user information (name, etc.)
- `login:avatar` - Access to user's avatar image

### 2.5. Copy Credentials

After registering the application:

1. Copy the **Client ID** (also called Application ID)
2. Copy the **Client Secret** (also called Password)
3. Paste both values into your `.env` file:

```env
YANDEX_CLIENT_ID=your_yandex_client_id
YANDEX_CLIENT_SECRET=your_yandex_client_secret
```

---

## 3. Environment Variables

The following environment variables are required for OAuth authentication:

| Variable | Description | Source |
|----------|-------------|--------|
| `VK_CLIENT_ID` | VK application ID | VK ID admin panel |
| `VK_CLIENT_SECRET` | VK secure key | VK ID admin panel |
| `YANDEX_CLIENT_ID` | Yandex application ID | Yandex OAuth portal |
| `YANDEX_CLIENT_SECRET` | Yandex application password | Yandex OAuth portal |
| `DATABASE_URL` | PostgreSQL connection string | Your database setup |
| `JWT_SECRET` | Secret key for JWT token signing | Generate a random string |

### 3.1. Generate a JWT Secret

Generate a secure random string for JWT signing:

```bash
openssl rand -base64 32
```

Copy the output and set it as `JWT_SECRET` in your `.env` file.

---

## 4. Testing OAuth Locally

After completing registration and setting up environment variables, test the login flow.

### 4.1. Start the Development Server

```bash
npm run dev
```

### 4.2. Test VK Login

1. Open http://localhost:4321 in your browser
2. Click "Sign in with VK"
3. You should be redirected to VK for authorization
4. After granting permissions, you should be redirected back to the dashboard
5. Check that your user profile is created in the database

### 4.3. Test Yandex Login

1. Open http://localhost:4321 in your browser
2. Click "Sign in with Yandex"
3. You should be redirected to Yandex for authorization
4. After granting permissions, you should be redirected back to the dashboard
5. Check that your user profile is created in the database

### 4.4. Troubleshooting

If authentication fails:

- Verify redirect URIs match exactly (including protocol and port)
- Check that all required scopes are granted
- Review server logs for OAuth callback errors
- Ensure environment variables are loaded correctly
