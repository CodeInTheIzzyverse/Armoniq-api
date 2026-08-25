# Armoniq API — Requirements

> **Project:** Armoniq  
> **Repository:** `api`  
> **Document status:** Final requirements specification

## 1. Purpose

This document defines the functional and non-functional requirements for the Armoniq API, a RESTful ecommerce backend for a fictional music store platform. The API serves as the centralized business logic and persistence layer for the Armoniq ecosystem, supporting both customer-facing storefront and administrative management applications.

The requirements documented here are derived from the project specification (SPEC.md) and represent the minimum viable product (MVP) along with important features that enhance the platform's capabilities.

## 2. Product Scope

Armoniq API provides a comprehensive ecommerce backend with the following scope:

**In Scope:**

- Customer authentication and authorization
- Product catalog management with categories and subcategories
- Shopping cart and order processing
- Payment integration (cash on delivery and Wompi Sandbox)
- Customer account management (profiles, addresses, favorites)
- Product reviews and ratings
- Administrative content management (banners, slides, blog posts)
- Store settings and branding configuration
- Media management through Cloudinary
- Transactional email delivery
- RESTful API with HATEOAS
- Swagger/OpenAPI documentation

**Out of Scope:**

- Microservices architecture
- Real commercial payment processing
- Multi-region deployment
- Enterprise-grade infrastructure
- Real-time features beyond standard HTTP

## 3. Functional Requirements

### 3.1 Authentication and Authorization

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-001 | The system shall allow customers to register with email, password, first name, and last name | Must |
| FR-002 | The system shall verify customer email addresses through a time-limited token sent via email | Must |
| FR-003 | The system shall authenticate customers using email and password, returning a JWT access token | Must |
| FR-004 | The system shall issue refresh tokens with a 30-day expiration for session persistence | Must |
| FR-005 | The system shall implement refresh token rotation, invalidating the old token when a new one is issued | Must |
| FR-006 | The system shall hash all refresh tokens before storage using a secure algorithm | Must |
| FR-007 | The system shall allow customers to log out, invalidating their refresh token | Must |
| FR-008 | The system shall allow customers to request a password reset via email with a time-limited token | Must |
| FR-009 | The system shall allow customers to reset their password using a valid reset token | Must |
| FR-010 | The system shall enforce role-based access control with CLIENT and ADMIN roles | Must |
| FR-011 | The system shall restrict administrative endpoints to users with ADMIN role | Must |
| FR-012 | The system shall track all login attempts with email, IP address, timestamp, success status, and failure reason | Must |
| FR-013 | The system shall implement rate limiting on authentication endpoints to prevent brute force attacks | Must |

### 3.2 User Management

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-014 | The system shall allow authenticated customers to retrieve their profile information | Must |
| FR-015 | The system shall allow authenticated customers to update their profile (first name, last name, phone, avatar) | Must |
| FR-016 | The system shall allow administrators to retrieve a list of all users with pagination | Must |
| FR-017 | The system shall allow administrators to update user roles and account status | Must |
| FR-018 | The system shall allow administrators to deactivate user accounts | Must |

### 3.3 Product Catalog

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-019 | The system shall allow administrators to create products with name, description, price, stock, category, subcategory, and images | Must |
| FR-020 | The system shall allow administrators to update existing products | Must |
| FR-021 | The system shall allow administrators to delete products (soft delete) | Must |
| FR-022 | The system shall allow customers to retrieve a paginated list of active products | Must |
| FR-023 | The system shall allow customers to retrieve a single product by ID or slug | Must |
| FR-024 | The system shall allow customers to search products by name and description using text search | Must |
| FR-025 | The system shall allow customers to filter products by category | Must |
| FR-026 | The system shall allow customers to filter products by subcategory | Must |
| FR-027 | The system shall allow customers to filter products by price range (min and max) | Must |
| FR-028 | The system shall allow customers to filter products by minimum rating | Must |
| FR-029 | The system shall allow customers to sort products by price, rating, name, and creation date | Must |
| FR-030 | The system shall allow customers to retrieve featured products | Must |
| FR-031 | The system shall allow administrators to mark products as featured | Must |
| FR-032 | The system shall generate unique slugs for products based on their names | Must |
| FR-033 | The system shall store product images in Cloudinary and retain only URLs and metadata in the database | Must |
| FR-034 | The system shall allow administrators to manage multiple images per product with ordering | Must |

### 3.4 Categories and Subcategories

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-035 | The system shall allow administrators to create categories with name, description, and image | Must |
| FR-036 | The system shall allow administrators to update categories | Must |
| FR-037 | The system shall allow administrators to delete categories (only if no subcategories exist) | Must |
| FR-038 | The system shall allow customers to retrieve a list of active categories | Must |
| FR-039 | The system shall allow administrators to create subcategories linked to a parent category | Must |
| FR-040 | The system shall allow administrators to update subcategories | Must |
| FR-041 | The system shall allow administrators to delete subcategories | Must |
| FR-042 | The system shall allow customers to retrieve subcategories for a given category | Must |
| FR-043 | The system shall generate unique slugs for categories and subcategories | Must |

### 3.5 Shopping Cart

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-044 | The system shall allow authenticated customers to add products to their shopping cart | Must |
| FR-045 | The system shall allow authenticated customers to update product quantities in their cart | Must |
| FR-046 | The system shall allow authenticated customers to remove products from their cart | Must |
| FR-047 | The system shall allow authenticated customers to retrieve their current cart | Must |
| FR-048 | The system shall allow authenticated customers to clear their entire cart | Must |
| FR-049 | The system shall validate product availability and stock before adding to cart | Must |
| FR-050 | The system shall validate current product pricing at checkout time | Must |

### 3.6 Orders

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-051 | The system shall allow authenticated customers to create orders from their cart | Must |
| FR-052 | The system shall require a valid shipping address for order creation | Must |
| FR-053 | The system shall require a payment method selection (cash on delivery or Wompi) | Must |
| FR-054 | The system shall validate cart contents, product availability, and pricing before order creation | Must |
| FR-055 | The system shall create an immutable snapshot of product information (name, price, image) at order time | Must |
| FR-056 | The system shall create an immutable snapshot of the shipping address at order time | Must |
| FR-057 | The system shall calculate order subtotal, shipping cost, and total | Must |
| FR-058 | The system shall allow customers to retrieve their order history with pagination | Must |
| FR-059 | The system shall allow customers to retrieve details of a specific order | Must |
| FR-060 | The system shall allow administrators to retrieve all orders with pagination and filtering | Must |
| FR-061 | The system shall allow administrators to update order status (pending, confirmed, processing, shipped, delivered, cancelled) | Must |
| FR-062 | The system shall allow administrators to add or update tracking numbers for shipped orders | Must |
| FR-063 | The system shall synchronize payment status with order status | Must |

### 3.7 Payments

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-064 | The system shall support cash on delivery as a payment method | Must |
| FR-065 | The system shall integrate with Wompi Sandbox for card payment processing | Must |
| FR-066 | The system shall initialize Wompi payment transactions and return payment references to clients | Must |
| FR-067 | The system shall process Wompi webhooks to update payment and order status | Must |
| FR-068 | The system shall verify webhook signatures to ensure authenticity | Must |
| FR-069 | The system shall implement idempotent webhook processing to prevent duplicate state changes | Should |
| FR-070 | The system shall store payment transaction records with provider response data | Must |

### 3.8 Reviews and Ratings

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-071 | The system shall allow authenticated customers to create reviews for products they have purchased | Must |
| FR-072 | The system shall require a rating (1-5) and allow optional title and comment for reviews | Must |
| FR-073 | The system shall enforce one review per customer per product | Must |
| FR-074 | The system shall allow customers to update their own reviews | Must |
| FR-075 | The system shall allow customers to delete their own reviews | Must |
| FR-076 | The system shall allow customers to retrieve reviews for a product with pagination | Must |
| FR-077 | The system shall calculate and store average rating and review count for each product | Must |
| FR-078 | The system shall allow administrators to approve or reject reviews (moderation) | Should |
| FR-079 | The system shall allow administrators to delete any review | Must |

### 3.9 Favorites

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-080 | The system shall allow authenticated customers to add products to their favorites | Must |
| FR-081 | The system shall allow authenticated customers to remove products from their favorites | Must |
| FR-082 | The system shall allow authenticated customers to retrieve their list of favorite products with pagination | Must |
| FR-083 | The system shall prevent duplicate favorites (same customer and product) | Must |
| FR-084 | The system shall validate product existence before adding to favorites | Must |

### 3.10 Addresses

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-085 | The system shall allow authenticated customers to create saved addresses | Must |
| FR-086 | The system shall allow authenticated customers to retrieve their saved addresses | Must |
| FR-087 | The system shall allow authenticated customers to update their saved addresses | Must |
| FR-088 | The system shall allow authenticated customers to delete their saved addresses | Must |
| FR-089 | The system shall allow customers to designate one address as their default | Must |
| FR-090 | The system shall store address name, street, details, city, state, country, postal code, and coordinates | Must |
| FR-091 | The system shall integrate with Google Maps for address geocoding and coordinate storage | Should |

### 3.11 Promotional Banners

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-092 | The system shall allow administrators to create promotional banners with title, image, link, and position | Must |
| FR-093 | The system shall allow administrators to update banners | Must |
| FR-094 | The system shall allow administrators to delete banners | Must |
| FR-095 | The system shall allow administrators to activate or deactivate banners | Must |
| FR-096 | The system shall allow administrators to set start and end dates for banner display | Should |
| FR-097 | The system shall allow customers to retrieve active banners within their scheduled window | Must |
| FR-098 | The system shall store banner images in Cloudinary | Must |

### 3.12 Homepage Slides

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-099 | The system shall allow administrators to create homepage slides with title, description, image, link, and order | Must |
| FR-100 | The system shall allow administrators to update slides | Must |
| FR-101 | The system shall allow administrators to delete slides | Must |
| FR-102 | The system shall allow administrators to activate or deactivate slides | Must |
| FR-103 | The system shall allow customers to retrieve active slides ordered by display sequence | Must |
| FR-104 | The system shall store slide images in Cloudinary | Must |

### 3.13 Blog Posts

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-105 | The system shall allow administrators to create blog posts with title, excerpt, content, and cover image | Must |
| FR-106 | The system shall allow administrators to update blog posts | Must |
| FR-107 | The system shall allow administrators to delete blog posts | Must |
| FR-108 | The system shall allow administrators to set blog post status as draft or published | Must |
| FR-109 | The system shall generate unique slugs for blog posts based on their titles | Must |
| FR-110 | The system shall allow customers to retrieve published blog posts with pagination | Must |
| FR-111 | The system shall allow customers to retrieve a single published blog post by slug | Must |
| FR-112 | The system shall store blog post cover images in Cloudinary | Must |

### 3.14 Store Settings

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-113 | The system shall maintain a singleton document for global store settings | Must |
| FR-114 | The system shall allow administrators to update store name | Must |
| FR-115 | The system shall allow administrators to upload and update favicon, header logo, and footer logo | Must |
| FR-116 | The system shall allow administrators to update contact information (email, phone, address) | Must |
| FR-117 | The system shall allow administrators to update social media links | Must |
| FR-118 | The system shall expose public store settings to customers (name, logos, contact, social links) | Must |
| FR-119 | The system shall protect administrative store settings endpoints | Must |
| FR-120 | The system shall store logos and favicon in Cloudinary | Must |

### 3.15 API Documentation and HATEOAS

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-121 | The system shall provide Swagger/OpenAPI documentation for all endpoints | Must |
| FR-122 | The system shall include HATEOAS links in REST responses for navigation | Must |
| FR-123 | The system shall document request and response DTOs in Swagger | Must |
| FR-124 | The system shall document authentication and authorization requirements in Swagger | Must |
| FR-125 | The system shall document pagination, filtering, and sorting parameters in Swagger | Must |
| FR-126 | The system shall document error responses in Swagger | Must |

### 3.16 Dashboard Data

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-127 | The system shall provide aggregated dashboard statistics for administrators | Must |
| FR-128 | The system shall provide total orders count | Must |
| FR-129 | The system shall provide revenue statistics | Must |
| FR-130 | The system shall provide recent orders list | Must |
| FR-131 | The system shall provide order status distribution | Must |
| FR-132 | The system shall provide product statistics | Must |
| FR-133 | The system shall provide customer statistics | Must |
| FR-134 | The system shall optimize dashboard queries to avoid unnecessary database requests | Should |

## 4. Non-Functional Requirements

### 4.1 Security

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-001 | The system shall hash passwords using Argon2 before storage | Must |
| NFR-002 | The system shall never store plaintext passwords or refresh tokens | Must |
| NFR-003 | The system shall use HTTP-only cookies for access and refresh tokens | Must |
| NFR-004 | The system shall set the Secure flag on cookies in production | Must |
| NFR-005 | The system shall configure SameSite attribute on cookies | Must |
| NFR-006 | The system shall expire access tokens after 15 minutes | Must |
| NFR-007 | The system shall expire refresh tokens after 30 days | Must |
| NFR-008 | The system shall expire password reset tokens after a defined period | Must |
| NFR-009 | The system shall expire email verification tokens after a defined period | Must |
| NFR-010 | The system shall enable Helmet for security headers | Must |
| NFR-011 | The system shall configure CORS with explicit allowed origins | Must |
| NFR-012 | The system shall implement rate limiting on sensitive endpoints | Must |
| NFR-013 | The system shall validate all input using DTOs with class-validator | Must |
| NFR-014 | The system shall apply MongoDB query sanitization | Must |
| NFR-015 | The system shall protect against HTTP parameter pollution | Should |
| NFR-016 | The system shall never expose sensitive credentials in error responses | Must |
| NFR-017 | The system shall never commit environment variables or secrets to the repository | Must |
| NFR-018 | The system shall enforce authorization on all administrative endpoints at the backend level | Must |

### 4.2 Performance

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-019 | The system shall respond to standard API requests within 500ms under normal load | Should |
| NFR-020 | The system shall support pagination for all collection endpoints | Must |
| NFR-021 | The system shall use database indexes for frequently queried fields | Must |
| NFR-022 | The system shall optimize dashboard aggregation queries | Should |
| NFR-023 | The system shall use connection pooling for MongoDB | Must |

### 4.3 Reliability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-024 | The system shall handle database connection failures gracefully | Must |
| NFR-025 | The system shall implement retry logic for transient failures | Should |
| NFR-026 | The system shall provide health check endpoints for monitoring | Must |
| NFR-027 | The system shall log errors with sufficient context for debugging | Must |
| NFR-028 | The system shall use TTL indexes for automatic cleanup of expired tokens | Must |

### 4.4 Maintainability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-029 | The system shall follow SOLID principles | Must |
| NFR-030 | The system shall use repository pattern for data access | Must |
| NFR-031 | The system shall separate concerns across controllers, services, and repositories | Must |
| NFR-032 | The system shall use TypeScript strict mode | Must |
| NFR-033 | The system shall enforce code style with ESLint and Prettier | Must |
| NFR-034 | The system shall use conventional commits with Commitlint | Must |
| NFR-035 | The system shall enforce code quality checks before commits with Husky and lint-staged | Must |

### 4.5 Testability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-036 | The system shall provide unit tests for services, guards, strategies, and utilities | Must |
| NFR-037 | The system shall provide integration tests for repositories and service-database interaction | Must |
| NFR-038 | The system shall provide E2E tests for critical HTTP flows | Must |
| NFR-039 | The system shall use MongoDB Memory Server for fast isolated database tests | Must |
| NFR-040 | The system shall use Testcontainers with MongoDB for realistic integration tests | Should |
| NFR-041 | The system shall achieve meaningful test coverage for critical business flows | Must |

### 4.6 API Consistency

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-042 | The system shall use consistent HTTP status codes across all endpoints | Must |
| NFR-043 | The system shall use consistent error response structure | Must |
| NFR-044 | The system shall use consistent pagination response structure | Must |
| NFR-045 | The system shall use consistent naming conventions for endpoints and parameters | Must |
| NFR-046 | The system shall support API versioning through URI | Must |

### 4.7 Deployment and Operations

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-047 | The system shall be deployable to Vercel | Must |
| NFR-048 | The system shall support environment-based configuration | Must |
| NFR-049 | The system shall be independently deployable from frontend applications | Must |
| NFR-050 | The system shall use GitHub Actions for CI/CD | Must |
| NFR-051 | The system shall run automated quality checks on pull requests | Must |

## 5. Constraints

### 5.1 Technology Constraints

| Constraint | Description |
| --- | --- |
| Runtime | Node.js LTS |
| Framework | NestJS |
| Language | TypeScript |
| Package Manager | pnpm (npm is not permitted) |
| Database | MongoDB Atlas Free Tier |
| ODM | Mongoose with @nestjs/mongoose |
| Testing | Vitest for unit and integration tests |
| E2E Testing | Supertest |

### 5.2 External Service Constraints

| Service | Constraint |
| --- | --- |
| MongoDB Atlas | Free tier usage only |
| Cloudinary | Free tier usage only |
| Wompi | Sandbox environment only (no real payments) |
| Resend | Free tier usage only |
| Google Maps | Free tier or minimal usage |

### 5.3 Security Constraints

- Access tokens must expire after 15 minutes.
- Refresh tokens must expire after 30 days.
- Refresh tokens must be hashed before storage.
- Passwords must be hashed using Argon2.
- Authentication cookies must use httpOnly, Secure (in production), and SameSite attributes.
- Sensitive environment variables must never be committed to the repository.
- MongoDB query sanitization must be applied.

### 5.4 Architecture Constraints

- The application must remain a modular monolith (no microservices).
- Repository pattern must be used for all data access.
- Controllers must not contain business logic.
- Services must not contain HTTP-specific logic.
- External service SDKs must only be accessed through integration adapters.

### 5.5 Project Constraints

- The project is a portfolio application, not a production commercial system.
- All external services must remain within free-tier or sandbox limits.
- The API must be suitable for portfolio demonstration.
- The project must follow professional development practices.

## 6. Requirement Priorities (MoSCoW)

### 6.1 Must Have

Requirements that are essential for the MVP and must be implemented for the system to be considered complete.

**Count:** 127 requirements (FR-001 to FR-134 excluding Should items, NFR-001 to NFR-051 excluding Should items)

**Key Must Have requirements:**

- Complete authentication and authorization system
- Product catalog with CRUD operations
- Shopping cart functionality
- Order creation and management
- Payment integration (cash on delivery and Wompi)
- Customer account management
- Product reviews and ratings
- Administrative content management
- Security controls (password hashing, JWT, rate limiting)
- API documentation with Swagger
- Automated testing (unit, integration, E2E)
- CI/CD pipeline

### 6.2 Should Have

Requirements that are important but not essential for the MVP. They should be implemented if time permits.

**Should Have requirements:**

| ID | Requirement |
| --- | --- |
| FR-069 | Idempotent webhook processing |
| FR-078 | Review moderation workflow |
| FR-091 | Google Maps address geocoding |
| FR-096 | Banner scheduling with start/end dates |
| FR-134 | Optimized dashboard queries |
| NFR-015 | HTTP parameter pollution protection |
| NFR-019 | Response time under 500ms |
| NFR-022 | Optimized dashboard aggregation |
| NFR-025 | Retry logic for transient failures |
| NFR-040 | Testcontainers for integration tests |

### 6.3 Could Have

Requirements that are desirable but not necessary. They can be implemented if time and resources allow.

**Could Have requirements (from SPEC.md stretch features):**

- Product comparison
- Discount and coupon system
- Gift cards
- Product recommendations
- Recently viewed products
- Advanced inventory reservations
- Abandoned cart tracking
- WebSocket-based administrative notifications
- Advanced analytics
- Full-text search engine integration
- Multiple payment providers
- Shipping provider integration
- Automated invoice generation
- Export orders to CSV
- Import products from CSV
- Scheduled content publishing
- SEO metadata management
- Product attribute templates
- Product variants
- Multi-currency support
- Multi-language support

### 6.4 Won't Have (This Release)

Requirements that are explicitly out of scope for the current release.

**Won't Have requirements:**

- Microservices architecture
- Real commercial payment processing
- Multi-region deployment
- Enterprise-grade infrastructure
- Kubernetes or complex orchestration
- Real-time features beyond standard HTTP
- User-generated store customization
- Dynamic theme builder
- Arbitrary palette customization

## 7. Requirements Traceability

The following table maps requirements to SPEC.md sections:

| SPEC.md Section | Requirements |
| --- | --- |
| 4.1 Authentication | FR-001 to FR-013 |
| 4.2 Authorization | FR-010, FR-011 |
| 4.3 Login Attempt Tracking | FR-012 |
| 4.4 User Management | FR-014 to FR-018 |
| 4.5 Products Management | FR-019 to FR-034 |
| 4.6 Categories Management | FR-035 to FR-043 |
| 4.7 Media Management | FR-033, FR-034, FR-098, FR-104, FR-112, FR-120 |
| 4.8 Shopping Cart | FR-044 to FR-050 |
| 4.9 Favorites | FR-080 to FR-084 |
| 4.10 Reviews and Ratings | FR-071 to FR-079 |
| 4.11 Addresses | FR-085 to FR-091 |
| 4.12 Orders | FR-051 to FR-063 |
| 4.13 Payments | FR-064 to FR-070 |
| 4.14 Promotional Banners | FR-092 to FR-098 |
| 4.15 Homepage Slides | FR-099 to FR-104 |
| 4.16 Blog | FR-105 to FR-112 |
| 4.17 Store Settings | FR-113 to FR-120 |
| 4.18 Dashboard Data | FR-127 to FR-134 |
| 4.19 HATEOAS | FR-122 |
| 4.20 API Documentation | FR-121, FR-123 to FR-126 |
| 10.2 Authentication Constraints | NFR-001 to NFR-009 |
| 10.3 Architecture Constraints | NFR-029 to NFR-031 |
| 10.4 API Constraints | NFR-042 to NFR-046 |
| 10.5 Testing Constraints | NFR-036 to NFR-041 |
| 10.6 Code Quality Constraints | NFR-033 to NFR-035 |
| 10.7 CI/CD Constraints | NFR-050, NFR-051 |
| 10.8 Deployment Constraints | NFR-047 to NFR-049 |
