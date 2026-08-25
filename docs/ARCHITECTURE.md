# Armoniq API — Architecture

> **Project:** Armoniq  
> **Repository:** `api`  
> **Document status:** Final architecture reference

## 1. Architectural Overview

Armoniq API is a **modular monolithic** REST backend built with **NestJS** and **TypeScript**. It serves as the centralized persistence, business logic, and integration layer for the Armoniq ecommerce ecosystem, consumed independently by the Storefront and Admin frontend applications.

The architecture prioritizes:

- Clear separation of concerns across well-defined layers.
- Testability of business logic in isolation.
- Security by default at every boundary.
- Maintainability through consistent conventions.
- Pragmatic use of design patterns where they solve real problems.

The application is deployed as a single unit but is internally organized to allow independent evolution of its modules without cascading changes.

## 2. Architectural Style

The API combines two complementary organizational approaches:

### 2.1 Layered Architecture

The top-level `src/` directory exposes the architectural layers directly. Each layer has a single responsibility and communicates only with adjacent layers.

| Layer | Directory | Responsibility |
| --- | --- | --- |
| Entry point | `main.ts`, `app.module.ts` | Application bootstrap and root module composition |
| Configuration | `config/` | Environment-based configuration registration and validation |
| Controllers | `controllers/` | HTTP request handling, routing, response formatting |
| Services | `services/` | Business logic orchestration and domain rules |
| Repositories | `repositories/` | Persistence abstraction and data access |
| Database | `database/` | Mongoose connection, schemas, and embedded types |
| DTOs | `dto/` | Request/response contracts and validation rules |
| Models | `models/` | Internal domain representations |
| Enums | `enums/` | Shared enumeration types |
| Constants | `constants/` | Shared immutable values (routes, roles, permissions) |
| Guards | `guards/` | Authentication and authorization enforcement |
| Strategies | `strategies/` | Passport authentication strategies |
| Filters | `filters/` | Exception handling and error response formatting |
| Interceptors | `interceptors/` | Cross-cutting request/response transformation |
| Middleware | `middleware/` | Low-level HTTP pipeline processing |
| Decorators | `decorators/` | Custom parameter and method decorators |
| Events | `events/` | Domain event definitions and handlers |
| Integrations | `integrations/` | External service adapters (Cloudinary, Resend, Wompi, Google Maps) |
| Utilities | `utils/` | Shared helper functions |

### 2.2 Feature-Based Organization Within Layers

When a layer contains files related to a specific feature, those files are grouped into subdirectories:

```text
dto/
├── auth/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── ...
├── users/
│   ├── create-user.dto.ts
│   └── ...
├── health.dto.ts
└── index.ts
```

```text
integrations/
├── cloudinary/
├── email/
├── google-maps/
└── wompi/
```

This hybrid approach keeps the top-level architecture visible while allowing feature-level organization where the file count justifies it.

## 3. Architectural Patterns

The following patterns are applied throughout the application:

### 3.1 Repository Pattern

All persistence operations are encapsulated behind repository classes. Controllers and services never interact with Mongoose models directly.

```text
Controller → Service → Repository → Mongoose Model → MongoDB
```

Repositories expose domain-oriented methods and return domain models, not raw database documents.

### 3.2 Strategy Pattern

Payment processing uses a strategy-based abstraction. Each payment provider implements a common interface, allowing new providers to be added without modifying order logic.

```text
OrderService → PaymentStrategy (interface)
                   ├── WompiPaymentStrategy
                   └── CashOnDeliveryPaymentStrategy
```

### 3.3 Adapter Pattern

External services (Cloudinary, Resend, Wompi, Google Maps) are accessed through adapter classes in `integrations/`. These adapters isolate third-party SDK details from the rest of the application.

```text
Service → Integration Adapter → External SDK / API
```

### 3.4 DTO Pattern

All external input is validated through DTO classes using `class-validator` and `class-transformer`. DTOs define the contract at the application boundary and are never used for internal domain representation.

```text
HTTP Request → DTO (validation) → Service → Domain Model
```

### 3.5 Event-Driven Architecture

Domain events are emitted through `@nestjs/event-emitter` to decouple side effects from their triggering operations. For example, user registration emits an event that triggers email verification without coupling the registration service to the email service.

```text
AuthService.register() → EventEmitter → UserRegisteredEvent → EmailService
```

### 3.6 Factory Pattern

Configuration and database connection use factory patterns. `MongooseModule.forRootAsync()` with `MongooseOptionsFactory` provides environment-aware database configuration.

### 3.7 Decorator Pattern

Custom decorators encapsulate reusable parameter extraction and metadata attachment. For example, `@CurrentUser()` extracts the authenticated user from the request.

### 3.8 Singleton Pattern

The `store_settings` collection implements a singleton document pattern. The API ensures only one active configuration document exists.

## 4. System Architecture

### 4.1 System Boundaries

```text
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│                                                              │
│   ┌──────────────┐              ┌──────────────┐            │
│   │  Storefront   │              │     Admin     │            │
│   │   (React)     │              │    (React)    │            │
│   └──────┬───────┘              └──────┬───────┘            │
│          │                              │                    │
└──────────┼──────────────────────────────┼────────────────────┘
           │         HTTPS / REST         │
           └──────────┬───────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────────┐
│                ARMONIQ API                                   │
│                     │                                        │
│   ┌─────────────────┴─────────────────┐                     │
│   │         NestJS Application        │                     │
│   │                                   │                     │
│   │  Controllers → Services → Repos   │                     │
│   │                                   │                     │
│   │  Guards │ Filters │ Interceptors  │                     │
│   │                                   │                     │
│   │  Integrations (Adapters)          │                     │
│   └──┬────────┬────────┬────────┬────┘                     │
│      │        │        │        │                           │
└──────┼────────┼────────┼────────┼───────────────────────────┘
       │        │        │        │
       ▼        ▼        ▼        ▼
   ┌───────┐ ┌──────┐ ┌──────┐ ┌──────────┐
   │MongoDB│ │Cloud │ │Resend│ │  Wompi   │
   │ Atlas │ │inary │ │      │ │ Sandbox  │
   └───────┘ └──────┘ └──────┘ └──────────┘
```

### 4.2 Technology Stack

| Category | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | NestJS |
| Language | TypeScript (strict) |
| Package Manager | pnpm |
| Database | MongoDB Atlas (Free Tier) |
| ODM | Mongoose / `@nestjs/mongoose` |
| Authentication | JWT + Passport |
| Password Hashing | Argon2 |
| Validation | class-validator + class-transformer |
| Security | Helmet, CORS, throttling, secure cookies |
| API Documentation | Swagger / OpenAPI |
| Events | `@nestjs/event-emitter` |
| Media Storage | Cloudinary |
| Email | Resend |
| Payments | Wompi Sandbox |
| HTTP Client | Axios |
| Testing | Vitest, Supertest, MongoDB Memory Server, Testcontainers |
| Code Quality | ESLint, Prettier, Husky, lint-staged, Commitlint, SonarCloud |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

### 4.3 External Service Boundaries

Each external service is accessed exclusively through its adapter in `integrations/`. No other part of the application imports third-party SDKs directly.

| Service | Adapter Directory | Purpose |
| --- | --- | --- |
| MongoDB Atlas | `database/` | Primary persistence |
| Cloudinary | `integrations/cloudinary/` | Media upload, transformation, deletion |
| Resend | `integrations/email/` | Transactional email delivery |
| Wompi Sandbox | `integrations/wompi/` | Payment processing |
| Google Maps | `integrations/google-maps/` | Geocoding and address coordinates |

## 5. Package and Component Architecture

### 5.1 Module Composition

The application is composed through NestJS modules. `AppModule` is the root module and imports all feature modules and infrastructure modules.

```text
AppModule
├── ConfigModule (global)
├── DatabaseModule
│   └── MongooseModule.forRootAsync()
├── AuthModule
│   ├── JwtModule
│   └── PassportModule
├── UsersModule
├── ProductsModule
├── CategoriesModule
├── OrdersModule
├── PaymentsModule
├── ReviewsModule
├── FavoritesModule
├── AddressesModule
├── BannersModule
├── SlidesModule
├── BlogModule
├── StoreSettingsModule
├── CloudinaryModule
├── EmailModule
├── WompiModule
├── GoogleMapsModule
└── HealthModule
```

Each feature module encapsulates its controller, service, repository, and related providers. Modules expose only the services required by other modules through their `exports` array.

### 5.2 Request Lifecycle

```text
HTTP Request
    │
    ▼
┌─────────────────────────────────────────┐
│           Global Middleware              │
│  Helmet │ CORS │ Cookie Parser │ Throttle│
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Global Interceptors             │
│  Logging │ Serialization │ Transform     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│              Guards                      │
│  AuthGuard │ RolesGuard │ ThrottlerGuard │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│            Validation Pipe               │
│  DTO validation and transformation       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│             Controller                   │
│  Route handler, parameter extraction     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│              Service                     │
│  Business logic, domain rules            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│            Repository                    │
│  Data access, persistence operations     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Global Exception Filter          │
│  Error handling, response formatting     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
            HTTP Response
```

### 5.3 Data Flow

```text
External Input:
  HTTP Request → Controller → DTO (validation) → Service → Repository → MongoDB

Internal Output:
  MongoDB → Repository → Domain Model → Service → HATEOAS Interceptor → HTTP Response

Cross-Cutting:
  Guards (auth) → Interceptors (logging/serialization) → Filters (error handling)
```

## 6. Configuration Architecture

Configuration is managed through `@nestjs/config` with the following structure:

| Config File | Namespace | Source |
| --- | --- | --- |
| `app.config.ts` | `app` | `PORT`, `NODE_ENV`, `API_PREFIX`, `FRONTEND_URLS` |
| `auth.config.ts` | `auth` | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, token expiration |
| `database.config.ts` | `database` | `MONGODB_URI`, connection options |
| `cloudinary.config.ts` | `cloudinary` | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `email.config.ts` | `email` | `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_FROM_NAME` |
| `payment.config.ts` | `payment` | `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_BASE_URL` |
| `google-maps.config.ts` | `googleMaps` | `GOOGLE_MAPS_API_KEY` |
| `swagger.config.ts` | `swagger` | `SWAGGER_TITLE`, `SWAGGER_DESCRIPTION`, `SWAGGER_VERSION` |

Environment validation is enforced at startup through `env.validation.ts` using `class-validator`. The application fails fast if required variables are missing or invalid.

## 7. Security Architecture

Security controls are applied at multiple layers:

| Layer | Control | Implementation |
| --- | --- | --- |
| Transport | HTTPS enforcement | Vercel deployment |
| Headers | Security headers | Helmet (global middleware) |
| CORS | Origin restriction | Explicit `FRONTEND_URLS` configuration |
| Rate limiting | Throttling | `@nestjs/throttler` (global guard) |
| Authentication | JWT | Passport JWT strategy, access + refresh tokens |
| Authorization | Role-based | Guards enforce `CLIENT` / `ADMIN` roles |
| Password storage | Hashing | Argon2 (never stored in plaintext) |
| Token storage | Hashing | Refresh tokens stored as hashes only |
| Session | Secure cookies | `httpOnly`, `secure`, `sameSite` attributes |
| Input validation | DTO validation | `class-validator` + `ValidationPipe` (global) |
| NoSQL injection | Sanitization | MongoDB query sanitization middleware |
| Error handling | Safe errors | Centralized filter, no stack traces in production |
| Audit | Login tracking | `login_attempts` collection |

## 8. Testing Architecture

The testing strategy follows multiple levels:

| Level | Tool | Scope | Location |
| --- | --- | --- | --- |
| Unit | Vitest | Services, utilities, guards, strategies | `test/unit/` |
| Integration | Vitest + MongoDB Memory Server | Repositories, service + DB interaction | `test/integration/` |
| Database Integration | Testcontainers MongoDB | Real MongoDB in Docker containers | `test/integration/` |
| E2E | Supertest | Full HTTP request/response cycle | `test/e2e/` |

```text
test/
├── unit/
│   ├── *.service.spec.ts
│   ├── *.controller.spec.ts
│   └── ...
├── integration/
│   ├── *.repository.spec.ts
│   └── ...
└── e2e/
    ├── *.e2e-spec.ts
    └── ...
```

## 9. Deployment Architecture

```text
┌─────────────────────────────────────────────────────┐
│                   GitHub                              │
│                                                       │
│   Push / PR → GitHub Actions CI                       │
│                  │                                     │
│                  ├── Install dependencies              │
│                  ├── Lint                              │
│                  ├── Type check                        │
│                  ├── Unit tests                        │
│                  ├── Integration tests                 │
│                  ├── E2E tests                         │
│                  └── Build                             │
│                                                       │
│   Merge to main → Deploy to Vercel                    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │     Vercel       │
              │  (API Hosting)   │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  MongoDB │ │Cloudinary│ │  Resend  │
    │  Atlas   │ │          │ │          │
    └──────────┘ └──────────┘ └──────────┘
```

The API is deployed independently from the Storefront and Admin applications. Environment variables are configured through Vercel's environment variable management. No credentials are committed to the repository.

## 10. Key Architectural Decisions

| Decision | Rationale |
| --- | --- |
| Modular monolith over microservices | Simpler deployment, easier to develop and test for a portfolio project |
| Layer-first directory structure | Makes architectural boundaries explicit and visible |
| Repository pattern | Isolates persistence concerns, enables testability |
| Adapter pattern for integrations | Prevents third-party SDK coupling to business logic |
| Event-driven for side effects | Decouples operations like email sending from their triggers |
| DTOs at boundary only | Internal domain models remain independent of API contracts |
| Enums in separate directory | Single source of truth, avoids duplication across schemas |
| Embedded schemas in separate directory | Clear separation between root schemas and embedded types |
| Strategy pattern for payments | Allows adding payment providers without modifying order logic |
| Global middleware, filters, interceptors | Consistent behavior across all endpoints without repetition |
| `@nestjs/config` with validation | Centralized, type-safe, fail-fast configuration |
| MongoDB Atlas Free Tier | Suitable for portfolio project, no production requirements |
| Vercel deployment | Serverless-compatible, free tier, simple CI/CD integration |
