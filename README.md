# Armoniq API

> RESTful backend API for Armoniq, a fictional music store ecommerce platform, built with NestJS, TypeScript, MongoDB Atlas, and a security-focused architecture.

**Status:** In Development  
**Platform:** REST API  
**Language:** TypeScript  
**Repository:** [GitHub](https://github.com/Isa-Bedoya-UdeA/Armoniq-api)

## Overview

Armoniq API is the centralized backend for the Armoniq ecommerce ecosystem. It exposes the business logic and REST HATEOAS API consumed independently by the customer Storefront and the Admin application.

The API manages authentication, users, products, categories, orders, reviews, favorites, addresses, blog content, banners, home slides, store settings, payments, media, and other ecommerce operations.

The project is intentionally designed as a realistic portfolio application, emphasizing modularity, security, testing, maintainability, documentation, and professional development practices.

## Features

- JWT authentication with access and refresh tokens.
- Refresh-token rotation and hashed refresh-token persistence.
- Email verification and password reset flows.
- Login-attempt tracking.
- Role-based authorization for administrative operations.
- Product, category, and subcategory management.
- Product ratings and reviews.
- Favorites and customer cart/order workflows.
- Customer address management.
- Google Maps-compatible address coordinates.
- Order management and tracking information.
- Cash-on-delivery and Wompi Sandbox payment workflows.
- Cloudinary media management.
- Blog posts.
- Promotional banners and home slides.
- Store branding/settings.
- REST HATEOAS responses.
- Swagger/OpenAPI documentation.
- Validation and centralized error handling.
- Security middleware and throttling.
- Automated unit, integration, and E2E testing.
- GitHub Actions CI/CD.
- Docker build validation.

## Tech Stack

| Category | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | NestJS |
| Language | TypeScript |
| Package Manager | pnpm |
| API Style | REST + HATEOAS |
| Database | MongoDB Atlas Free Tier |
| ODM | Mongoose / `@nestjs/mongoose` |
| Authentication | JWT + Passport |
| Password Hashing | Argon2 |
| Validation | class-validator + class-transformer |
| Security | Helmet, CORS, throttling, secure cookies |
| API Documentation | Swagger / OpenAPI |
| Events | NestJS Event Emitter |
| Media | Cloudinary |
| Email | Resend |
| Payments | Wompi Sandbox |
| HTTP Client | Axios |
| IDs | UUID |
| Unit Testing | Vitest |
| Integration Testing | Vitest + MongoDB Memory Server |
| E2E Testing | Supertest |
| Database Integration Testing | Testcontainers MongoDB |
| Code Quality | ESLint + Prettier |
| Git Hooks | Husky + lint-staged + Commitlint |
| Code Analysis | SonarCloud |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

## Architecture

The API is implemented as a **modular monolithic backend**. It is intentionally kept as one deployable application while maintaining strong separation of concerns internally.

The architecture emphasizes:

- Controllers for HTTP/API concerns.
- Services for business logic.
- Repositories for persistence abstraction.
- DTOs for request/response contracts.
- Models and database schemas for persistence representation.
- Guards, middleware, interceptors, filters, and strategies for cross-cutting concerns.
- Integrations/adapters for external services.
- Events for decoupled application workflows.
- HATEOAS for discoverable REST responses.

Detailed architectural decisions are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Project Structure

```text
src/
├── config/
├── constants/
├── controllers/
├── database/
│   └── schemas/
├── decorators/
├── dto/
├── enums/
├── events/
├── filters/
├── guards/
├── integrations/
├── interceptors/
├── middleware/
├── models/
├── repositories/
├── services/
├── strategies/
├── utils/
├── app.module.ts
└── main.ts

test/
```

The repository intentionally keeps the main architectural layers visible at the `src/` level. Features are grouped inside those layers when additional files make such grouping useful.

## Getting Started

### Prerequisites

Install:

- Node.js LTS.
- pnpm.
- Git.
- Docker Desktop for Testcontainers-based database tests.

External services required for local development depend on the feature being tested:

- MongoDB Atlas.
- Cloudinary.
- Resend.
- Wompi Sandbox.
- Google Maps credentials where API functionality requires map-related data.

### Clone the Repository

```bash
git clone https://github.com/Isa-Bedoya-UdeA/Armoniq-api.git
cd Armoniq-api
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Never commit `.env` or real credentials.

For service configuration, consult:

- [`docs/API.md`](docs/API.md)
- [`docs/DATABASE.md`](docs/DATABASE.md)
- [`docs/SECURITY.md`](docs/SECURITY.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

### Run the Application

Development mode:

```bash
pnpm start:dev
```

Production build:

```bash
pnpm build
pnpm start:prod
```

Swagger/OpenAPI documentation is exposed by the running API according to the configuration documented in [`docs/API.md`](docs/API.md).

## Documentation

| Document | Description |
| --- | --- |
| [`SPEC.md`](SPEC.md) | Product and technical specification |
| [`docs/API.md`](docs/API.md) | API conventions, endpoints, HATEOAS and Swagger |
| [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) | Authentication and token flows |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Database design and MongoDB model |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Deployment and infrastructure |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Security requirements and controls |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Functional and non-functional requirements |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architecture and design decisions |
| [`docs/TESTING.md`](docs/TESTING.md) | Testing strategy and conventions |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution and development workflow |
| [`LICENSE`](LICENSE) | MIT license |

## Screenshots

### Swagger / API Documentation

![Swagger API documentation](docs/assets/screenshots/swagger.png)

### API / Postman

![Postman API collection](docs/assets/screenshots/postman.png)

> Screenshots are placeholders and should be replaced with real project captures as development progresses.

## Demo

The project demo video should be stored at:

```text
docs/assets/demo/
```

Example:

![API demo](docs/assets/demo/api-demo.mp4)

## Development

Development is organized through GitHub.

The repository uses:

- GitHub repositories for source control.
- Issues for tasks, bugs, technical work, and documentation.
- Milestones for development phases and feature groups.
- Pull Requests for reviewed changes.
- Releases when stable project versions are appropriate.
- GitHub Actions for automated CI/CD.
- SonarCloud for static analysis and code-quality monitoring.
- Figma for visual identity, typography, palettes, and UI assets.
- Lucidchart for database and architecture diagrams.

Development principles include:

- SOLID.
- Separation of Concerns.
- DRY where appropriate.
- KISS where appropriate.
- Dependency inversion.
- Repository abstraction.
- Reusable services and utilities.
- Explicit API contracts.
- Secure-by-default development.
- Testable business logic.
- Maintainable modular code.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the contribution workflow and project conventions.

## Testing

The API uses multiple testing levels:

- **Unit tests:** Vitest.
- **Integration tests:** Vitest with MongoDB Memory Server.
- **Database integration tests:** Testcontainers MongoDB.
- **E2E tests:** Supertest against the HTTP API.

Typical checks include:

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Testing conventions and coverage expectations are documented in [`docs/TESTING.md`](docs/TESTING.md).

## CI/CD

GitHub Actions is responsible for validating Pull Requests and relevant branches.

The CI pipeline includes:

1. Install dependencies.
2. Lint.
3. Type check.
4. Run unit tests.
5. Run integration tests.
6. Run E2E tests where configured.
7. Build the application.
8. Validate Docker build.
9. Perform quality checks where configured.

## Security

Security is a core project concern.

The API uses:

- Short-lived access tokens.
- Long-lived refresh tokens with rotation.
- Hashed refresh tokens.
- Secure HTTP-only cookies.
- `secure` and `sameSite` cookie attributes.
- Password hashing with Argon2.
- Email verification.
- Password reset expiration.
- Login-attempt tracking.
- Rate limiting and throttling.
- Helmet.
- CORS configuration.
- DTO validation.
- MongoDB sanitization.
- HTTP parameter pollution protection.
- Centralized error handling.

See [`docs/SECURITY.md`](docs/SECURITY.md) and [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md).

## Deployment

The API is intended to be deployed independently from the Admin and Storefront applications.

Deployment documentation is available in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

The project prioritizes free-tier and sandbox services suitable for portfolio use.

## License

This project is licensed under the MIT License.

See [`LICENSE`](LICENSE).

## Contributors

Developed by **Isabela Bedoya Gaviria**.
