# Armoniq Database Documentation

> **Project:** Armoniq  
> **Repository:** `api`  
> **Database:** MongoDB Atlas Free Tier  
> **Driver:** Mongoose  
> **Document status:** Initial specification

## 1. Database Architecture

Armoniq uses **MongoDB Atlas Free Tier** as its primary database, accessed through **Mongoose** via `@nestjs/mongoose`.

The data model follows a **document-oriented** approach that leverages:

- **References** when entities have an independent lifecycle, are queried independently, or can grow significantly.
- **Embedded documents** when data belongs strongly to a parent document, is always read together with it, and does not need an independent lifecycle.

### Collections

| Collection | Purpose |
| --- | --- |
| `users` | Customer and administrator accounts |
| `refresh_tokens` | Hashed refresh tokens for session management |
| `auth_tokens` | Hashed email verification and password reset tokens |
| `login_attempts` | Authentication attempt audit log |
| `products` | Product catalog |
| `categories` | Product categories |
| `subcategories` | Product subcategories |
| `orders` | Customer orders |
| `reviews` | Product reviews and ratings |
| `favorites` | Customer favorite products |
| `addresses` | Customer saved addresses |
| `banners` | Promotional banners |
| `slides` | Homepage hero slides |
| `blog_posts` | Blog content |
| `store_settings` | Global store configuration (singleton) |
| `payments` | Payment transaction records |

---

## 2. Users and Authentication

### 2.1 Users Collection

A single `users` collection stores both customers and administrators. User type is determined by the `role` field.

```text
users
├── _id: ObjectId
├── role: "CLIENT" | "ADMIN"
├── firstName: string
├── lastName: string
├── email: string (unique)
├── passwordHash: string
├── phone: string
├── avatar: string
├── isActive: boolean
├── isEmailVerified: boolean
├── createdAt: Date
└── updatedAt: Date
```

**Design decisions:**

- A single collection avoids duplication of shared fields (email, password, profile, audit timestamps).
- Client-specific data (addresses, favorites, reviews, orders) is accessed through references.
- Administrator capabilities are enforced through `role` and backend authorization guards, not through separate collections.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `email` | Unique | Login lookup, uniqueness constraint |
| `role` | Single | Administrative user filtering |

### 2.2 Refresh Tokens Collection

Refresh tokens are persisted to support token rotation, revocation, logout, reuse detection, and session control.

MongoDB stores **only the hash** of each refresh token. Tokens in plaintext are never persisted.

```text
refresh_tokens
├── _id: ObjectId
├── userId: ObjectId → users._id
├── tokenHash: string
├── expiresAt: Date
├── revokedAt: Date | null
├── replacedByTokenId: ObjectId | null
├── userAgent: string
├── ip: string
├── createdAt: Date
└── updatedAt: Date
```

**Constraints:**

- Maximum lifetime: **30 days**.
- `tokenHash` must be unique.
- `revokedAt` is set when the token is explicitly revoked or replaced during rotation.
- `replacedByTokenId` links to the successor token in a rotation chain.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `userId` | Single | Lookup all tokens for a user |
| `expiresAt` | TTL | Automatic cleanup of expired tokens |
| `tokenHash` | Unique | Token lookup during validation |

### 2.3 Auth Tokens Collection

Email verification and password reset tokens share a single collection with a `type` discriminator.

Tokens are stored **only as hashes**.

```text
auth_tokens
├── _id: ObjectId
├── userId: ObjectId → users._id
├── tokenHash: string
├── type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
├── expiresAt: Date
├── usedAt: Date | null
├── createdAt: Date
└── updatedAt: Date
```

**Constraints:**

- Each token has a finite expiration.
- `usedAt` is set when the token is consumed, preventing reuse.
- Only one active token per type per user at any given time.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `userId` | Single | Lookup tokens for a user |
| `expiresAt` | TTL | Automatic cleanup of expired tokens |
| `tokenHash` | Unique | Token lookup during validation |

### 2.4 Login Attempts Collection

Every authentication attempt is recorded for auditing, attack detection, and rate limiting.

```text
login_attempts
├── _id: ObjectId
├── email: string
├── userId: ObjectId | null
├── ip: string
├── userAgent: string
├── timestamp: Date
├── success: boolean
└── reason: "SUCCESS" | "INVALID_CREDENTIALS" | "USER_NOT_FOUND" | "ACCOUNT_DISABLED" | "EMAIL_NOT_VERIFIED" | "RATE_LIMITED"
```

**Design decisions:**

- `userId` is nullable because the email may not correspond to an existing user.
- Rate limiting is evaluated using both `ip` and `email` to prevent trivial evasion.
- This collection is append-only; records are never modified after creation.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `email` | Single | Lookup attempts by email |
| `ip` | Single | Lookup attempts by IP |
| `timestamp` | Single | Time-range queries, TTL cleanup |

---

## 3. Products

### 3.1 Products Collection

Products are independent documents that reference their category and subcategory.

```text
products
├── _id: ObjectId
├── name: string
├── slug: string (unique)
├── description: string
├── price: number
├── stock: number
├── images: Image[]
├── categoryId: ObjectId → categories._id
├── subcategoryId: ObjectId → subcategories._id
├── specifications: object
├── rating: number
├── reviewCount: number
├── isFeatured: boolean
├── isActive: boolean
├── createdAt: Date
└── updatedAt: Date
```

**Embedded document — `Image`:**

```text
images[]
├── url: string
├── publicId: string (Cloudinary)
├── alt: string
└── order: number
```

**Design decisions:**

- Images are stored in **Cloudinary**. MongoDB retains URLs and metadata only.
- `categoryId` and `subcategoryId` are stored as references rather than embedding category data, allowing independent category CRUD.
- `rating` and `reviewCount` are denormalized fields updated when reviews are created, modified, or deleted.
- `slug` is derived from `name` and must be unique for URL-friendly product pages.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `slug` | Unique | Product detail page lookup |
| `categoryId` | Single | Category-based filtering |
| `subcategoryId` | Single | Subcategory-based filtering |
| `isFeatured` | Single | Featured product queries |
| `isActive` | Single | Active product filtering |
| `price` | Single | Price range filtering and sorting |
| `rating` | Single | Rating-based filtering and sorting |
| `name` | Text | Full-text search |

---

## 4. Categories and Subcategories

### 4.1 Categories Collection

```text
categories
├── _id: ObjectId
├── name: string
├── slug: string (unique)
├── description: string
├── image: string
├── isActive: boolean
├── createdAt: Date
└── updatedAt: Date
```

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `slug` | Unique | URL-friendly category pages |

### 4.2 Subcategories Collection

```text
subcategories
├── _id: ObjectId
├── name: string
├── slug: string (unique)
├── categoryId: ObjectId → categories._id
├── description: string
├── image: string
├── isActive: boolean
├── createdAt: Date
└── updatedAt: Date
```

**Design decisions:**

- Categories and subcategories are separate collections to support independent CRUD, filtering, and URL generation.
- Each subcategory references exactly one parent category via `categoryId`.
- Deletion of a category must validate that no dependent subcategories exist.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `slug` | Unique | URL-friendly subcategory pages |
| `categoryId` | Single | Lookup subcategories by parent category |

---

## 5. Orders

### 5.1 Orders Collection

Orders are independent documents associated with a customer.

```text
orders
├── _id: ObjectId
├── userId: ObjectId → users._id
├── items: OrderItem[]
├── subtotal: number
├── shippingCost: number
├── total: number
├── status: OrderStatus
├── paymentMethod: "CASH_ON_DELIVERY" | "WOMPI"
├── paymentStatus: PaymentStatus
├── shippingAddress: AddressSnapshot
├── trackingNumber: string | null
├── notes: string
├── createdAt: Date
└── updatedAt: Date
```

**Embedded document — `OrderItem`:**

```text
items[]
├── productId: ObjectId → products._id
├── name: string
├── price: number
├── quantity: number
├── image: string
└── subtotal: number
```

**Embedded document — `AddressSnapshot`:**

```text
shippingAddress
├── name: string
├── address: string
├── details: string
├── city: string
├── state: string
├── country: string
├── postalCode: string
├── latitude: number
└── longitude: number
```

**Design decisions:**

- **Order items store a historical snapshot** of the product name, price, and image at the time of purchase. This ensures that subsequent changes to the product do not alter historical order data.
- **Shipping address is embedded as a snapshot** to preserve the exact address used at checkout, even if the customer later modifies or deletes the original address.
- `trackingNumber` is nullable and populated by administrators when shipping is initiated.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `userId` | Single | Customer order history |
| `status` | Single | Order status filtering |
| `createdAt` | Single | Time-range queries and sorting |

---

## 6. Reviews

### 6.1 Reviews Collection

Reviews are independent documents linking a user to a product.

```text
reviews
├── _id: ObjectId
├── userId: ObjectId → users._id
├── productId: ObjectId → products._id
├── rating: number (1–5)
├── title: string
├── comment: string
├── isApproved: boolean
├── createdAt: Date
└── updatedAt: Date
```

**Relationships:**

```text
User 1 ─── N Review
Product 1 ─── N Review
```

**Constraints:**

- Each user may submit at most **one review per product**. Enforced via a unique compound index.
- `rating` must be an integer between 1 and 5.
- Users may only edit or delete their own reviews.
- Administrators may moderate (approve or remove) any review.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `productId` | Single | Reviews for a product |
| `userId` | Single | Reviews by a user |
| `(userId, productId)` | Unique compound | Prevent duplicate reviews |

---

## 7. Favorites

### 7.1 Favorites Collection

Favorites associate a user with a product.

```text
favorites
├── _id: ObjectId
├── userId: ObjectId → users._id
├── productId: ObjectId → products._id
└── createdAt: Date
```

**Constraints:**

- Duplicate favorites are prevented via a unique compound index on `(userId, productId)`.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `(userId, productId)` | Unique compound | Prevent duplicates, lookup |

---

## 8. Addresses

### 8.1 Addresses Collection

Addresses belong to a customer and are managed through the customer account.

```text
addresses
├── _id: ObjectId
├── userId: ObjectId → users._id
├── name: string
├── address: string
├── details: string
├── city: string
├── state: string
├── country: string
├── postalCode: string
├── latitude: number
├── longitude: number
├── isDefault: boolean
├── createdAt: Date
└── updatedAt: Date
```

**Design decisions:**

- Geolocation coordinates (`latitude`, `longitude`) are stored to support map-assisted address selection via Google Maps Platform.
- Google Maps handles the frontend selection and geocoding functionality; MongoDB stores the resulting coordinates.
- Only one address per user may have `isDefault: true`. Setting a new default must unset the previous one.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `userId` | Single | Lookup addresses for a user |

---

## 9. Banners

### 9.1 Banners Collection

Promotional banners managed from the admin panel.

```text
banners
├── _id: ObjectId
├── title: string
├── image: string
├── link: string
├── position: number
├── isActive: boolean
├── startAt: Date | null
├── endAt: Date | null
├── createdAt: Date
└── updatedAt: Date
```

**Design decisions:**

- Images are stored in **Cloudinary**. MongoDB retains the URL only.
- `startAt` and `endAt` allow time-based banner scheduling.
- `position` controls display order.
- The storefront receives only banners that are active and within their scheduled window.

---

## 10. Home Slides

### 10.1 Slides Collection

Homepage hero slides are managed independently from banners.

```text
slides
├── _id: ObjectId
├── title: string
├── description: string
├── image: string
├── link: string
├── order: number
├── isActive: boolean
├── createdAt: Date
└── updatedAt: Date
```

**Design decisions:**

- `order` determines the display sequence of slides on the homepage.
- Images are stored in **Cloudinary**.

---

## 11. Blog Posts

### 11.1 Blog Posts Collection

Blog posts are independent documents authored by administrators.

```text
blog_posts
├── _id: ObjectId
├── authorId: ObjectId → users._id
├── title: string
├── slug: string (unique)
├── excerpt: string
├── content: string
├── coverImage: string
├── status: "DRAFT" | "PUBLISHED"
├── publishedAt: Date | null
├── createdAt: Date
└── updatedAt: Date
```

**Design decisions:**

- `authorId` references the admin user who created the post.
- `slug` is derived from `title` and must be unique for URL-friendly blog pages.
- Only posts with `status: "PUBLISHED"` are exposed to the storefront.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `slug` | Unique | Blog post page lookup |
| `status` | Single | Filter published posts |

---

## 12. Payments

### 12.1 Payments Collection

Payments are separated from orders to isolate transactional data from order lifecycle management.

```text
payments
├── _id: ObjectId
├── orderId: ObjectId → orders._id
├── userId: ObjectId → users._id
├── provider: "WOMPI" | "CASH_ON_DELIVERY"
├── method: "CASH_ON_DELIVERY" | "CARD" | "WOMPI"
├── amount: number
├── currency: string
├── status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
├── transactionId: string | null
├── reference: string
├── providerResponse: object | null
├── paidAt: Date | null
├── createdAt: Date
└── updatedAt: Date
```

**Design decisions:**

- Wompi integration is handled through a strategy-based adapter, keeping provider-specific details outside the core domain.
- `providerResponse` stores the raw response from the payment provider for debugging and reconciliation.
- `transactionId` is the provider-assigned transaction identifier (e.g., Wompi transaction ID).
- Sensitive payment provider credentials (API keys, secrets) are **never stored in MongoDB**. They are managed through environment variables.

**Indexes:**

| Field(s) | Type | Purpose |
| --- | --- | --- |
| `orderId` | Single | Lookup payments for an order |
| `transactionId` | Single | Provider transaction lookup, idempotency |

---

## 13. Store Settings

### 13.1 Store Settings Collection

Global store configuration stored as a **singleton document**.

```text
store_settings
├── _id: ObjectId
├── storeName: string
├── favicon: string
├── headerLogo: string
├── footerLogo: string
├── contact: object
├── socialLinks: object
├── shipping: object
├── createdAt: Date
└── updatedAt: Date
```

**Embedded document — `contact`:**

```text
contact
├── email: string
├── phone: string
└── address: string
```

**Embedded document — `socialLinks`:**

```text
socialLinks
├── facebook: string
├── instagram: string
├── twitter: string
├── youtube: string
└── tiktok: string
```

**Design decisions:**

- This collection contains **a single active document** representing the global configuration of Armoniq.
- Images (logos, favicon) are stored in **Cloudinary**. MongoDB retains URLs only.
- The API exposes only the configuration required by public clients. Administrative endpoints are protected.

---

## 14. Relationship Overview

```text
                         ┌──────────────┐
                         │    USERS     │
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
        ADDRESSES          FAVORITES          REVIEWS
              │                 │                 │
              │                 ▼                 ▼
              │             PRODUCTS ◄──── REVIEWS
              │                 │
              │          ┌──────┴──────┐
              │          ▼             ▼
              │     CATEGORIES    SUBCATEGORIES
              │
              ▼
           ORDERS
              │
              ▼
          PAYMENTS


USERS
  │
  └── BLOG POSTS


AUTHENTICATION
  │
  ├── REFRESH TOKENS
  ├── AUTH TOKENS
  └── LOGIN ATTEMPTS


STORE MANAGEMENT
  │
  ├── BANNERS
  ├── SLIDES
  └── STORE SETTINGS
```

---

## 15. Reference vs Embedded Data

### References

References are used when:

- The entity has an independent lifecycle.
- The collection can grow significantly.
- The entity is queried independently.
- The entity is shared by or related to multiple documents.
- The entity requires independent CRUD operations.

Collections using references:

```text
users
products
categories
subcategories
orders
reviews
favorites
addresses
payments
blog_posts
```

### Embedded Documents

Embedded documents are used when:

- The data belongs directly to the parent document.
- The data is typically read together with the parent.
- The data does not need an independent lifecycle.

Examples:

```text
order.items[]              — Historical product snapshot within an order
order.shippingAddress      — Address snapshot at time of purchase
product.images[]           — Image metadata belonging to a product
product.specifications     — Product attributes belonging to a product
store_settings.contact     — Contact info belonging to the settings document
store_settings.socialLinks — Social links belonging to the settings document
```

---

## 16. Index Strategy

### Summary

| Collection | Index | Type | Purpose |
| --- | --- | --- | --- |
| `users` | `email` | Unique | Login lookup |
| `users` | `role` | Single | Admin filtering |
| `products` | `slug` | Unique | Product page lookup |
| `products` | `categoryId` | Single | Category filtering |
| `products` | `subcategoryId` | Single | Subcategory filtering |
| `products` | `isFeatured` | Single | Featured queries |
| `products` | `isActive` | Single | Active product filtering |
| `products` | `price` | Single | Price range queries |
| `products` | `rating` | Single | Rating queries |
| `products` | `name` | Text | Full-text search |
| `categories` | `slug` | Unique | Category page lookup |
| `subcategories` | `slug` | Unique | Subcategory page lookup |
| `subcategories` | `categoryId` | Single | Parent category lookup |
| `orders` | `userId` | Single | Customer order history |
| `orders` | `status` | Single | Status filtering |
| `orders` | `createdAt` | Single | Time-range queries |
| `reviews` | `productId` | Single | Product reviews |
| `reviews` | `userId` | Single | User reviews |
| `reviews` | `(userId, productId)` | Unique compound | Prevent duplicates |
| `favorites` | `(userId, productId)` | Unique compound | Prevent duplicates |
| `addresses` | `userId` | Single | User addresses |
| `blog_posts` | `slug` | Unique | Post page lookup |
| `blog_posts` | `status` | Single | Published post filtering |
| `payments` | `orderId` | Single | Order payments |
| `payments` | `transactionId` | Single | Provider transaction lookup |
| `refresh_tokens` | `userId` | Single | User token lookup |
| `refresh_tokens` | `expiresAt` | TTL | Expired token cleanup |
| `refresh_tokens` | `tokenHash` | Unique | Token validation |
| `auth_tokens` | `userId` | Single | User token lookup |
| `auth_tokens` | `expiresAt` | TTL | Expired token cleanup |
| `auth_tokens` | `tokenHash` | Unique | Token validation |
| `login_attempts` | `email` | Single | Attempt lookup by email |
| `login_attempts` | `ip` | Single | Attempt lookup by IP |
| `login_attempts` | `timestamp` | Single | Time-range queries |

### TTL Indexes

TTL indexes are used to automatically expire documents that are no longer needed:

- `refresh_tokens.expiresAt` — Expired refresh tokens.
- `auth_tokens.expiresAt` — Expired verification and reset tokens.

---

## 17. Security Considerations

The database architecture enforces the following security principles:

### Credential Storage

- Passwords are stored **only as hashes** (Argon2).
- Refresh tokens are stored **only as hashes**.
- Email verification tokens are stored **only as hashes**.
- Password reset tokens are stored **only as hashes**.
- Access tokens (JWT) are **never persisted** in MongoDB.

### Token Security

- Access tokens use `HttpOnly`, `Secure`, and `SameSite` cookies.
- Refresh tokens have a maximum lifetime of 30 days.
- Refresh token rotation is implemented; each token can be replaced at most once.
- Token revocation is supported via `revokedAt` and `usedAt` fields.
- TTL indexes automatically clean up expired tokens.

### Audit and Monitoring

- All login attempts are recorded with email, IP, User-Agent, timestamp, success status, and failure reason.
- Rate limiting is evaluated using both IP and email.

### Data Protection

- External service API keys and secrets (Cloudinary, Wompi, Resend, Google Maps) are **never stored in MongoDB**. They are managed through environment variables.
- Sensitive payment provider data that belongs exclusively to the payment provider is not persisted.
- Customer data is only accessible according to authorization rules enforced at the application level.
- Administrative resources are never protected solely at the frontend level.
