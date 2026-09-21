# Armoniq API — Authentication & Authorization

> **Project:** Armoniq  
> **Repository:** `api`  
> **Document status:** Final authentication reference

## 1. Overview

Armoniq uses a robust authentication and authorization system based on **JSON Web Tokens (JWT)**, **HTTP-only cookies**, and **role-based access control (RBAC)**. Security is a primary concern, ensuring that all credentials and sensitive tokens are securely hashed using **Argon2** before persistence. 

This document details the authentication flows, token lifecycles, and security practices implemented in the platform.

---

## 2. Authentication Flows

### 2.1 Registration & Email Verification
1. **Registration Request:** The user submits their details (email, password, first name, last name).
2. **Creation & Hashing:** The system hashes the password with Argon2 and stores the new user with `isActive: true` and `isEmailVerified: false`.
3. **Token Generation:** An email verification token is generated, hashed, and stored in the database. The plain token is sent to the user via email.
4. **Verification:** The user clicks the link containing the token. The backend validates the token against its hash, marks the user as verified, and invalidates the token.

### 2.2 Login (Session Creation)
1. **Authentication:** The user provides an email and password.
2. **Validation:** The system checks if the user exists, is active, and is email-verified. It verifies the password using Argon2.
3. **Token Generation:** 
   - A short-lived **Access Token (JWT)** is created.
   - A long-lived **Refresh Token** is created, its hash is stored in the database.
4. **Delivery:** Both tokens are sent to the client as **secure, HTTP-only cookies**.
5. **Auditing:** The login attempt (success or failure) is logged in the `login_attempts` collection along with the IP address and user agent.

### 2.3 Logout (Session Termination)
1. **Request:** The user requests to log out.
2. **Revocation:** The system identifies the refresh token from the cookie, finds its hash in the database, and marks it as revoked.
3. **Cookie Clearing:** The HTTP-only cookies are cleared from the client's browser.

### 2.4 Password Reset
1. **Request:** The user requests a password reset using their email.
2. **Token Generation:** A single-use password reset token is generated, hashed, and stored. The plain token is emailed.
3. **Reset:** The user submits the new password along with the token.
4. **Fulfillment:** The system validates the token, hashes and updates the new password, marks the token as used, and explicitly revokes all active refresh tokens for the user to force re-authentication across all devices.

---

## 3. Token Lifecycle & Management

### 3.1 Access Tokens (JWT)
- **Format:** JSON Web Token (JWT) signed with a secure secret.
- **Payload:** Contains the user's ID (`sub`).
- **Lifespan:** **15 minutes**.
- **Storage (Client):** `HttpOnly`, `Secure`, `SameSite=Lax` cookie (`access_token`).
- **Storage (Server):** **Never persisted** in the database. Validated purely cryptographically.

### 3.2 Refresh Tokens
- **Format:** Opaque cryptographic random string.
- **Lifespan:** **30 days**.
- **Storage (Client):** `HttpOnly`, `Secure`, `SameSite=Lax` cookie (`refresh_token`).
- **Storage (Server):** Stored as an **Argon2 hash** in the `refresh_tokens` collection. Plaintext is never saved.
- **Rotation:** When an access token expires, the client uses the refresh token to get a new pair. The old refresh token is marked as revoked (`revokedAt`), and a new one is issued (Refresh Token Rotation).

### 3.3 Auth Tokens (Verification & Reset)
- **Format:** Opaque cryptographic random string.
- **Storage (Server):** Stored as hashes in the `auth_tokens` collection with a discriminator (`type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"`).
- **Constraints:** 
  - Strictly time-limited (TTL indexes auto-delete expired documents).
  - Single-use (`usedAt` field is populated upon consumption).
  - Only one active token per type per user at any given time.

---

## 4. Authorization & Roles

Authorization is enforced at the controller and route level using NestJS Guards and Decorators.

### 4.1 Roles
Users are assigned a role defined by the `UserRole` enum:
- `CLIENT`: Standard customers accessing the storefront.
- `ADMIN`: Administrators accessing the admin dashboard.

### 4.2 Guards Implementation
- **`JwtAuthGuard`:** Validates the presence and validity of the Access Token cookie. If valid, the user payload is attached to the request.
- **`RolesGuard`:** Reads the required roles for an endpoint using the `@Roles()` decorator. It checks if the authenticated user's role matches one of the required roles. If not, it throws a `ForbiddenException`.

### 4.3 Decorators
- **`@Roles(...roles)`:** Specifies the roles required to access an endpoint (e.g., `@Roles(UserRole.ADMIN)`).
- **`@CurrentUser()`:** Extracts the authenticated user object from the current request for use in controllers.

---

## 5. Security Considerations

The authentication architecture implements defense-in-depth through the following controls:

1. **No Plaintext Secrets:** Passwords, refresh tokens, and auth tokens are all hashed using **Argon2** before being stored. A database breach will not expose usable credentials or tokens.
2. **XSS Protection:** Tokens are delivered exclusively via `HttpOnly` cookies, making them inaccessible to client-side JavaScript and eliminating XSS-based token theft.
3. **CSRF Mitigation:** Cookies are configured with `SameSite=Lax` (and optionally CORS strictness) to prevent Cross-Site Request Forgery.
4. **Token Rotation:** Refresh token rotation prevents infinite session hijacking. If a stolen refresh token is reused, it can trigger an anomaly detection (future scope) or simply invalidate the chain.
5. **Auditing & Rate Limiting:** 
   - Every login attempt (success, invalid credentials, not found, disabled) is recorded in the `login_attempts` collection.
   - Global rate limiting protects authentication endpoints against brute-force and credential stuffing attacks.
6. **Query Sanitization:** Anti-NoSQL-injection middleware sanitizes all inputs to prevent query operator manipulation during login operations.
7. **Secure Headers:** `Helmet` is used to set secure HTTP response headers globally.
