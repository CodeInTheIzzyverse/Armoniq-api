# Armoniq API Specification

> **Project:** Armoniq  
> **Repository:** `api`  
> **Application type:** RESTful ecommerce backend  
> **Stack:** NestJS, TypeScript, MongoDB Atlas, Mongoose, pnpm  
> **API style:** REST + HATEOAS  
> **Document status:** Initial specification

## 1. Overview

Armoniq is a fictional ecommerce platform focused on musical instruments, studio equipment, music accessories, and related products. The system consists of three independent repositories:

- `api`: centralized backend and REST API.
- `storefront`: public customer-facing ecommerce website.
- `admin`: administrative management panel.

The API is the central application responsible for business rules, persistence, authentication, authorization, integrations, payments, media management, email communication, and communication between the two frontend applications and the database.

The API must be designed as a realistic, maintainable, secure, testable, and modular production-style backend suitable for a software development portfolio.

The API is not intended to become a commercial production system. It is a portfolio and learning project, therefore all infrastructure and third-party services must use free tiers, sandbox environments, or usage limits that can reasonably remain within free quotas.

## 2. Product Vision

Provide a robust ecommerce backend that simulates the core operations of a professional online music store while demonstrating modern backend engineering practices.

The API should expose a consistent and well-documented REST interface that allows customers to discover products, manage their accounts, create orders, pay for purchases, manage addresses and favorites, and interact with product reviews.

At the same time, it must provide authorized administrators with the capabilities required to manage the catalog, store content, customers, orders, branding, and other operational data.

The backend should demonstrate:

- Modular architecture.
- Clear separation of responsibilities.
- Repository-based data access.
- Service-oriented business logic.
- Secure authentication and authorization.
- DTO-based validation.
- HATEOAS.
- Swagger/OpenAPI documentation.
- Design patterns where they provide meaningful value.
- Automated testing.
- CI/CD.
- Secure third-party integrations.
- Production-oriented error handling and observability fundamentals.

## 3. Functional Overview

The API provides the business and persistence layer for the Armoniq ecommerce ecosystem.

### Customer capabilities

Customers must be able to:

- Register an account.
- Verify their email address.
- Log in securely.
- Refresh their session.
- Log out.
- Request a password reset.
- Reset their password.
- View and update their profile.
- Manage saved addresses.
- Select a default address.
- Browse products.
- Search products.
- Filter products by category and subcategory.
- Filter products by rating.
- Filter products by minimum and maximum price.
- Sort and paginate product results.
- View product details.
- View product ratings and reviews.
- Create, edit, and delete their own reviews according to business rules.
- Add products to favorites.
- Remove products from favorites.
- View their favorites.
- Manage their shopping cart.
- Create orders from a valid cart.
- Select a payment method.
- Pay using cash on delivery.
- Pay using Wompi Sandbox.
- View their order history.
- View individual order details.
- View order status.
- View payment status.
- View shipping/tracking information when available.

### Administrator capabilities

Authorized administrators must be able to:

- Access protected administrative resources.
- View dashboard-related statistics.
- Manage products.
- Manage product images and media.
- Manage categories.
- Manage subcategories.
- Manage promotional banners.
- Manage homepage slides.
- Manage blog posts.
- Manage users.
- View and manage orders.
- Update order statuses.
- Add and update tracking numbers.
- Moderate product reviews.
- Manage store name.
- Manage isotipo.
- Manage header logo.
- Manage footer logo.
- Manage store contact and social information.

### Integrations

The API must integrate with:

- MongoDB Atlas for persistence.
- Cloudinary for media storage.
- Wompi Sandbox for payment testing.
- Google Maps Platform for address/geolocation functionality.
- Resend for transactional email.
- JWT for authentication.
- Swagger/OpenAPI for API documentation.

## 4. Core Features

### 4.1 Authentication

Implement a secure authentication system based on JWT.

Required mechanisms:

- Access Token.
- Refresh Token.
- Access token lifetime: 15 minutes.
- Refresh token lifetime: 30 days.
- Refresh token hashing.
- Secure HTTP-only cookies.
- `Secure` cookies in production.
- Appropriate `SameSite` policy.
- JWT rotation.
- Token expiration.
- Logout and refresh-token invalidation.
- Password hashing.
- Email verification.
- Password reset.
- Password reset expiration.
- Login attempt tracking.
- Rate limiting for sensitive authentication operations.

The authentication implementation must avoid storing plaintext passwords or refresh tokens.

### 4.2 Authorization

Implement role-based authorization for at least:

- Customer.
- Administrator.

Protected resources must use guards and authorization rules rather than relying exclusively on frontend restrictions.

### 4.3 Login Attempt Tracking

The system must record authentication attempts with:

- Email.
- IP address.
- Timestamp.
- Success/failure.
- Failure reason when applicable.
- User agent.

This information must support security auditing and troubleshooting without exposing sensitive credentials or tokens.

### 4.4 User Management

Implement customer and administrator user management.

Required capabilities include:

- Registration.
- Profile retrieval.
- Profile updates.
- Account status management.
- Role management where authorized.
- User lookup.
- Administrative user listing.
- Customer order relationship.
- Customer address relationship.

### 4.5 Products Management

Implement the product catalog.

Required capabilities:

- Product creation.
- Product retrieval.
- Product update.
- Product deletion.
- Product listing.
- Product search.
- Pagination.
- Sorting.
- Category filtering.
- Subcategory filtering.
- Rating filtering.
- Price range filtering.
- Featured product management.
- Availability/stock information.
- Product media management.

The catalog must support music-related products such as:

- Musical instruments.
- MIDI keyboards.
- Microphones.
- Mixers.
- Audio interfaces.
- Guitar amplifiers.
- Pedalboards and effects pedals.
- Picks.
- Ocarinas.
- Studio equipment.
- Music accessories.

### 4.6 Categories Management

Implement hierarchical catalog classification.

Required capabilities:

- Category CRUD.
- Subcategory CRUD.
- Category/subcategory relationships.
- Category listing.
- Subcategory listing.
- Validation of dependent resources.
- Prevention of invalid hierarchy operations.

### 4.7 Media Management

Cloudinary must be used for product and content media.

The API must support:

- Secure upload flows.
- Image metadata.
- Cloudinary public identifiers.
- Image replacement.
- Image deletion.
- Media cleanup.
- Product image ordering.
- Media associated with banners, slides, blog posts, and branding.

Sensitive Cloudinary credentials must never be exposed to the client.

### 4.8 Shopping Cart

Implement cart functionality.

Required operations:

- Retrieve cart.
- Add product.
- Update quantity.
- Remove product.
- Clear cart where appropriate.
- Validate product availability.
- Validate stock.
- Validate current pricing before checkout.

The final order must preserve the relevant product and pricing information at the time the order is created.

### 4.9 Favorites

Implement customer favorites.

Required operations:

- Add product.
- Remove product.
- List favorites.
- Prevent duplicate favorites.
- Validate product existence.

### 4.10 Product Reviews and Ratings

Implement customer product reviews.

Required functionality:

- Create review.
- Update own review.
- Delete own review.
- Administrative moderation.
- Rating validation.
- Review ownership validation.
- Average rating calculation.
- Rating distribution.
- Review count.

Business rules must prevent invalid ratings and unauthorized modification of other customers' reviews.

### 4.11 Addresses

Implement customer address management.

Required information may include:

- Address name/label.
- Street address.
- Additional details.
- City.
- Region/department.
- Country.
- Postal information where applicable.
- Latitude.
- Longitude.
- Default-address state.

Required operations:

- Create address.
- Retrieve addresses.
- Update address.
- Delete address.
- Set default address.
- Geocode/normalize address information where applicable.

Google Maps Platform must be used by the frontend/API integration as appropriate without exposing private credentials.

### 4.12 Orders

Implement the complete order lifecycle.

Required capabilities:

- Create order.
- Retrieve order.
- Customer order history.
- Administrative order listing.
- Order filtering.
- Order status management.
- Payment status management.
- Shipping status information.
- Tracking number management.
- Order details.
- Customer ownership validation.

Order creation must validate:

- Customer.
- Cart.
- Products.
- Prices.
- Stock.
- Shipping address.
- Payment method.
- Applicable business rules.

### 4.13 Payments

The API must support:

- Cash on delivery.
- Wompi Sandbox.

Payment processing should use a strategy-based abstraction so that payment providers can be added without tightly coupling order logic to a specific provider.

Wompi functionality must include, where supported by the integration:

- Transaction initialization.
- Payment status handling.
- Sandbox environment.
- Webhook processing.
- Verification of webhook information.
- Synchronization between payment status and order status.

### 4.14 Promotional Banners

Administrators must be able to:

- Create banners.
- Read banners.
- Update banners.
- Delete banners.
- Upload banner media.
- Set active/inactive state.
- Configure display order.
- Configure destination links and promotional content.

The storefront must only receive banners that are active and eligible for display.

### 4.15 Homepage Slides

Administrators must be able to:

- Create slides.
- Read slides.
- Update slides.
- Delete slides.
- Upload slide media.
- Configure titles and descriptions.
- Configure CTA information.
- Set active/inactive state.
- Configure display order.

### 4.16 Blog

Implement blog post management.

Required capabilities:

- Create post.
- Read post.
- Update post.
- Delete post.
- Draft/published state.
- Slug management.
- Cover image management.
- Content management.
- Author association.
- Metadata.
- Published date.
- Public listing of published posts.
- Public retrieval of published posts.

### 4.17 Store Settings and Branding

Administrators must be able to configure:

- Store name.
- Isotipo.
- Header logo.
- Footer logo.
- Contact information.
- Social links.
- Other relevant global store settings.

The API must expose only the configuration required by public clients and must protect administrative configuration endpoints.

### 4.18 Dashboard Data

The API must provide the aggregated data required by the admin dashboard, potentially including:

- Total orders.
- Revenue.
- Recent orders.
- Order status distribution.
- Product statistics.
- Customer statistics.
- Featured product information.
- Relevant sales trends.

Dashboard aggregation should be optimized to avoid unnecessary database requests.

### 4.19 HATEOAS

REST responses must include hypermedia links where meaningful.

HATEOAS should support navigation between related resources and available actions without forcing clients to hardcode every possible resource transition.

Examples may include:

- Self links.
- Related resource links.
- Update links for authorized resources.
- Delete links where applicable.
- Pagination links.

HATEOAS must respect authorization and resource state.

### 4.20 API Documentation

Swagger/OpenAPI must document:

- Endpoints.
- HTTP methods.
- Parameters.
- Query parameters.
- Request DTOs.
- Response DTOs.
- Authentication requirements.
- Authorization requirements.
- Pagination.
- Filtering.
- Sorting.
- Validation errors.
- Common error responses.
- HATEOAS response structures.

## 5. Requirements

The complete functional and non-functional requirements are defined separately in:

- [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)

The API implementation must satisfy those requirements and this specification.

Requirements must cover, at minimum:

- Functional behavior.
- Security.
- Performance.
- Reliability.
- Maintainability.
- Testability.
- Accessibility-related API considerations where applicable.
- API consistency.
- Data integrity.
- Deployment constraints.
- External service constraints.

## 6. MVP

The MVP represents the smallest complete and usable version of Armoniq that demonstrates the core ecommerce workflow without requiring every possible enhancement.

The API MVP includes:

1. NestJS and TypeScript project foundation.
2. MongoDB Atlas integration.
3. User registration and login.
4. Access and refresh token authentication.
5. Password hashing.
6. Email verification.
7. Password reset.
8. Login attempt tracking.
9. Customer/admin authorization.
10. Product CRUD.
11. Category and subcategory CRUD.
12. Product search and filtering.
13. Product pagination and sorting.
14. Product media storage with Cloudinary.
15. Product favorites.
16. Product reviews and ratings.
17. Customer address CRUD.
18. Shopping cart.
19. Order creation.
20. Customer order history.
21. Administrative order management.
22. Order statuses.
23. Tracking number management.
24. Cash-on-delivery payments.
25. Wompi Sandbox integration.
26. Promotional banners.
27. Homepage slides.
28. Blog post CRUD.
29. Store settings and branding.
30. Dashboard statistics.
31. Swagger/OpenAPI documentation.
32. HATEOAS.
33. Input validation and centralized error handling.
34. Rate limiting and security middleware.
35. Unit, integration, and E2E testing.
36. GitHub Actions CI.
37. Docker build.
38. Production deployment configuration.

## 7. Important Features

These features are not mandatory for the initial MVP but should be implemented if time and project complexity allow.

### 7.1 Advanced Product Search

Improve search relevance using MongoDB indexes and more advanced query strategies.

### 7.2 Advanced Catalog Filtering

Add additional filters such as brand, availability, product attributes, and configurable price ranges.

### 7.3 Inventory Management

Introduce explicit stock management, inventory adjustments, and low-stock information.

### 7.4 Order Cancellation Rules

Implement controlled customer order cancellation based on order status.

### 7.5 Review Moderation Workflow

Add moderation states and more detailed administrative review controls.

### 7.6 Transactional Email Templates

Create professional transactional email templates for:

- Welcome.
- Email verification.
- Password reset.
- Order confirmation.
- Payment confirmation.
- Order status changes.
- Shipping/tracking updates.

### 7.7 Advanced Dashboard Aggregations

Provide richer statistics and time-based sales aggregations.

### 7.8 Idempotent Payment Webhooks

Ensure repeated payment notifications do not create duplicate state changes.

### 7.9 Audit Logging

Implement administrative audit logs for important operations.

### 7.10 API Caching

Introduce caching for appropriate read-heavy resources if performance testing demonstrates a clear benefit.

## 8. Stretch Features

Stretch features are optional enhancements that may be implemented after the core project is stable.

- Product comparison.
- Discount and coupon system.
- Gift cards.
- Product recommendations.
- Recently viewed products.
- Wishlist enhancements.
- Advanced inventory reservations.
- Abandoned cart tracking.
- Customer notifications.
- WebSocket-based administrative notifications.
- Advanced analytics.
- Full-text search engine integration.
- Multiple payment providers.
- Shipping provider integration.
- Automated invoice generation.
- Export orders to CSV.
- Import products from CSV.
- Scheduled content publishing.
- SEO metadata management.
- Product attribute templates.
- Product variants.
- Multi-currency support.
- Multi-language support.
- Automated database backup workflows.

Stretch features must not compromise the maintainability or security of the MVP.

## 9. Out of Scope

The following are explicitly outside the project's scope.

### 9.1 Microservices Architecture

The API must remain a modular monolithic NestJS application.

Microservices, service meshes, distributed tracing infrastructure, and independently deployable domain services are out of scope.

### 9.2 Kubernetes and Complex Infrastructure

Kubernetes, ArgoCD, service meshes, complex cloud networking, and enterprise infrastructure are not required.

### 9.3 Real Commercial Operation

Armoniq is a fictional portfolio project and must not be treated as a production commercial store.

### 9.4 Real Payment Processing

Only sandbox/test payment processing is required. No real-money production payment processing is required.

### 9.5 Unrelated Features

Features unrelated to ecommerce, music products, customer accounts, store administration, or the technical objectives of the project are out of scope.

### 9.6 User-Generated Store Customization

Customers must not be able to arbitrarily customize the visual identity or palette of the store.

### 9.7 Dynamic Theme Builder

A complete visual theme builder or page builder is out of scope.

### 9.8 Arbitrary Palette Customization

The backend does not need to provide a user-configurable color palette system.

### 9.9 Enterprise Infrastructure

Enterprise-grade infrastructure, high availability clusters, multi-region deployment, and large-scale distributed systems are out of scope.

## 10. Constraints

### 10.1 General Constraints

- The project must use **pnpm**, never npm.
- TypeScript must be used throughout the backend.
- NestJS must be used as the backend framework.
- MongoDB Atlas Free Tier must be used for the database.
- Cloudinary must be used for media storage.
- Wompi Sandbox must be used for payment testing.
- Resend must be used for transactional email.
- Google Maps Platform must be used where map/geolocation functionality requires it.
- All external services must remain within free-tier or sandbox limits.
- The application must remain suitable for portfolio demonstration.
- Sensitive environment variables must never be committed.
- `.env.example` must document required environment variables without exposing credentials.

### 10.2 Authentication and Security Constraints

- Access tokens must expire after 15 minutes.
- Refresh tokens must expire after 30 days.
- Refresh tokens must be hashed.
- Authentication cookies must use `httpOnly`.
- Production cookies must use `secure`.
- `SameSite` must be explicitly configured.
- JWT rotation must be implemented.
- Tokens must expire and be invalidated appropriately.
- Passwords must never be stored in plaintext.
- Password hashing must use a secure password hashing algorithm such as Argon2 or bcrypt according to the final implementation decision.
- Password reset tokens must expire.
- Email verification tokens must expire.
- Login attempts must be recorded.
- Rate limiting must protect sensitive endpoints.
- Helmet must be enabled.
- CORS must be explicitly configured.
- Input validation must be enforced through DTOs.
- MongoDB query sanitization must be applied.
- HTTP parameter pollution protection must be considered and implemented.
- Authentication and authorization must be enforced on the backend.

### 10.3 Architecture Constraints

The backend must remain modular and maintainable.

The architecture must provide clear separation between:

- Controllers.
- Services.
- Repositories.
- Models.
- DTOs.
- Database schemas.
- Middleware.
- Guards.
- Strategies.
- Filters.
- Interceptors.
- Decorators.
- Integrations.
- Events.
- Utilities.
- Configuration.

Repository-based data access must be used rather than placing database operations directly inside controllers.

The architecture should use design patterns when they solve an actual design problem, including:

- Repository.
- Factory.
- Strategy.
- Adapter.
- Mapper.
- Specification.
- Observer/event-driven architecture.

Patterns must not be introduced purely for complexity or appearance.

### 10.4 API Constraints

The API must:

- Follow REST principles.
- Use HATEOAS where appropriate.
- Use consistent HTTP status codes.
- Use DTOs for external request validation.
- Use consistent response structures.
- Provide pagination for collection endpoints where required.
- Provide filtering and sorting through query parameters.
- Document endpoints with Swagger/OpenAPI.
- Centralize error handling.
- Support API versioning if required by the architecture.
- Avoid leaking internal implementation details in error responses.

### 10.5 Testing Constraints

Backend testing must use:

- Vitest for unit tests.
- Vitest for integration tests.
- Supertest for E2E HTTP testing.
- MongoDB Memory Server for fast isolated database tests.
- Testcontainers with MongoDB for realistic integration environments.

Critical business flows must be covered by automated tests.

At minimum, tests must cover:

- Authentication.
- Authorization.
- Products.
- Categories.
- Cart.
- Favorites.
- Reviews.
- Addresses.
- Orders.
- Payments.
- Administrative operations.
- Security-sensitive behavior.

### 10.6 Code Quality Constraints

The project must use:

- ESLint.
- Prettier.
- Husky.
- lint-staged.
- Commitlint.
- SonarCloud.
- TypeScript strictness where practical.

Pull requests must run automated quality checks through GitHub Actions.

### 10.7 CI/CD Constraints

GitHub Actions must automate, at minimum:

- Dependency installation.
- Linting.
- Type checking.
- Unit tests.
- Integration tests.
- Production build.
- Docker image build.

The CI pipeline must run for pull requests and appropriate repository branches.

### 10.8 Deployment Constraints

The API must be independently deployed from the `admin` and `storefront` repositories.

The planned deployment platform is Vercel, subject to compatibility with the NestJS application and free-tier limitations.

The API must not depend on the storefront or admin application being deployed in the same environment.

### 10.9 Documentation Constraints

The API documentation must be distributed as follows:

- `SPEC.md`: project specification and scope.
- `README.md`: project overview and developer quick start.
- `CONTRIBUTING.md`: contribution workflow and development conventions.
- `docs/REQUIREMENTS.md`: functional and non-functional requirements.
- `docs/ARCHITECTURE.md`: architectural design and technical decisions.
- `docs/API.md`: API conventions and endpoint documentation.
- `docs/AUTHENTICATION.md`: authentication and authorization architecture.
- `docs/DATABASE.md`: database design and persistence model.
- `docs/SECURITY.md`: security architecture and security practices.
- `docs/TESTING.md`: testing strategy and testing conventions.
- `docs/DEPLOYMENT.md`: deployment and production configuration.

## 11. Technical Documentation References

The following documents are authoritative technical references for implementation:

| Document | Purpose |
| --- | --- |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Functional and non-functional requirements |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture, layers, modules, patterns, and technical decisions |
| [`docs/API.md`](docs/API.md) | REST API conventions, endpoints, HATEOAS, pagination, filtering, and responses |
| [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) | Authentication, JWT lifecycle, cookies, tokens, roles, and security flows |
| [`docs/DATABASE.md`](docs/DATABASE.md) | MongoDB data model, schemas, indexes, relationships, and persistence decisions |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Security controls, threat considerations, and hardening |
| [`docs/TESTING.md`](docs/TESTING.md) | Unit, integration, E2E, database testing, coverage, and test environments |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Environment configuration, CI/CD, Docker, and deployment |

These documents should remain consistent with this specification. When an implementation decision changes the scope or architecture, the relevant documentation must be updated.

## 12. Technology Stack

### Runtime and Framework

- Node.js.
- NestJS.
- TypeScript.
- pnpm.

### Database

- MongoDB Atlas Free Tier.
- Mongoose.

### Authentication and Security

- JWT.
- Passport.
- Argon2.
- Helmet.
- Secure cookies.
- Rate limiting.
- DTO validation and transformation.
- MongoDB sanitization.
- HTTP parameter pollution protection.

### External Services

- Cloudinary.
- Wompi Sandbox.
- Google Maps Platform.
- Resend.

### Documentation

- Swagger/OpenAPI.

### Testing

- Vitest.
- NestJS Testing.
- Supertest.
- MongoDB Memory Server.
- Testcontainers MongoDB.

### Code Quality

- ESLint.
- Prettier.
- Husky.
- lint-staged.
- Commitlint.
- SonarCloud.

### CI/CD and Deployment

- GitHub Actions.
- Docker.
- Vercel.

## 13. API Architecture Principles

The API must follow these principles:

1. **Separation of concerns** — each layer has a clear responsibility.
2. **Single responsibility** — modules and classes should have focused responsibilities.
3. **Dependency inversion** — business logic should not depend unnecessarily on infrastructure details.
4. **Repository abstraction** — persistence operations must be isolated behind repositories.
5. **DTO validation** — external input must be validated at the application boundary.
6. **Secure by default** — authentication, authorization, validation, and security controls are backend responsibilities.
7. **Explicit domain rules** — business rules belong in services/domain-oriented logic rather than controllers.
8. **Reusable infrastructure** — shared cross-cutting concerns should be centralized.
9. **Testability** — business logic and infrastructure should be structured for isolated testing.
10. **Documentation as part of development** — API and architecture changes must be reflected in documentation.
11. **Pragmatic patterns** — design patterns should solve real problems rather than increase complexity.
12. **Modular monolith** — the application should have strong internal boundaries without introducing microservices.

## 14. Data and Persistence Principles

MongoDB should be modeled according to actual access patterns and business relationships rather than blindly reproducing relational database conventions.

The implementation must consider:

- Appropriate embedding versus referencing.
- Index design.
- Query performance.
- Pagination.
- Data consistency.
- Unique constraints.
- Immutable order snapshots.
- Product price snapshots inside orders.
- Payment state consistency.
- Referential integrity at the application level.
- Safe deletion behavior.
- Data validation.

Orders must preserve the relevant historical information required to represent what the customer actually purchased even if the original product changes later.

## 15. API Quality and Error Handling

The API must return predictable responses.

Errors must:

- Use appropriate HTTP status codes.
- Provide machine-readable error information.
- Avoid leaking secrets or internal stack traces.
- Provide useful validation feedback.
- Be handled consistently through centralized mechanisms.

Unexpected errors must be logged appropriately while the public response remains safe.

## 16. Security and Privacy

The API must protect:

- Passwords.
- Refresh tokens.
- Password reset tokens.
- Email verification tokens.
- Payment credentials and provider secrets.
- Cloudinary credentials.
- Resend credentials.
- Google Maps private credentials.
- Database credentials.
- JWT secrets.

Secrets must only be provided through environment variables or the deployment platform's secret management.

Customer information must only be accessible according to authorization rules.

Administrative resources must never rely solely on frontend route protection.

## 17. Development Workflow

The repository must follow a professional development workflow.

Changes should generally follow:

1. Issue definition.
2. Implementation.
3. Unit/integration tests.
4. Linting and type checking.
5. Documentation updates.
6. Pull request.
7. CI validation.
8. Code review.
9. Merge.
10. Deployment when applicable.

Commit messages should follow the project's Commitlint convention.

## 18. Definition of Done

An API feature is considered complete when:

- Its business behavior is implemented.
- Validation is implemented.
- Authorization rules are enforced.
- Persistence is implemented through the repository layer when applicable.
- Relevant errors are handled.
- Unit tests are implemented.
- Integration tests are implemented when applicable.
- E2E coverage exists for critical flows.
- Swagger documentation is updated.
- HATEOAS links are implemented where applicable.
- Relevant documentation is updated.
- ESLint passes.
- TypeScript checks pass.
- Tests pass.
- The production build succeeds.
- CI checks pass.

## 19. Project Success Criteria

The API is considered successful when it provides a stable backend capable of supporting both the Armoniq Storefront and Admin applications without duplicating business logic between them.

The completed API should demonstrate professional backend engineering through:

- Secure authentication.
- Robust authorization.
- Clean modular architecture.
- Repository-based persistence.
- MongoDB modeling.
- REST and HATEOAS.
- Swagger documentation.
- External service integration.
- Automated testing.
- CI/CD.
- Security hardening.
- Clear technical documentation.
- Maintainable TypeScript code.

The API must remain understandable to another developer who reads the repository without requiring access to the original development conversation.
