# Modular Node.js Framework (MNF)

A highly structured, production-ready **Node.js + TypeScript** framework designed for scalability. It ships with a **Feature-Module architecture**, automated RSA security, and first-class support for **both MongoDB (Mongoose) and PostgreSQL (TypeORM)** — pick the database when you create the project, and the CLI takes care of the rest.

---

## Key Features

- **Dual-DB support:** pick MongoDB (Mongoose) or PostgreSQL (TypeORM) at project creation.
- **Feature-Module pattern:** code is organized by business domain (User, Admin, Auth) rather than by technical role.
- **Auto DB detection:** the `g` generator reads the project's `.moduler.json` and scaffolds the correct flavor of module — no flags needed.
- **Automated RSA security:** unique 2048-bit `private.pem` / `public.pem` keys are generated for every new project.
- **Strict TypeScript:** pre-configured `tsconfig.json` for type safety.
- **Standardized responses:** built-in `ResponseHandler` utility for consistent API responses.
- **Batteries included:** pre-wired error handler, rate limiter, logger, JWT middleware, Redis cache, and more.

---

## Installation & Usage

You do **not** need to install this globally. Use `npx` to always get the latest version.

### 1. Create a new project

```bash
npx moduler-framework <project-name>
```

You will be prompted to choose a database:

```
? Which database do you want to use?
  > MongoDB (Mongoose)
    PostgreSQL (TypeORM)
```

Or skip the prompt with a flag:

```bash
npx moduler-framework my-api --mongo
npx moduler-framework my-api --postgres
```

This scaffolds the project, generates unique RSA keys, and writes a `.moduler.json` marker at the project root so future commands know which DB to use.

### 2. Generate a feature module

Inside a generated project:

```bash
cd my-api
npx moduler-framework g <module-name>
```

The generator auto-detects the project's DB type and scaffolds the right module (Mongoose schema/repo or TypeORM entity/repo).

You can also force a specific flavor anywhere:

| Command                          | Behavior                                                    |
| -------------------------------- | ----------------------------------------------------------- |
| `npx moduler-framework g <name>` | **Auto-detect** DB type from `.moduler.json`, then scaffold |
| `npx moduler-framework m <name>` | Always generate a **MongoDB (Mongoose)** module             |
| `npx moduler-framework p <name>` | Always generate a **PostgreSQL (TypeORM)** module           |

Each module creates:

- `*.interface.ts` – data shapes and TypeScript interfaces
- `*.schema.ts` – Mongoose schema **or** TypeORM entity (depending on DB)
- `*.repo.ts` – database access layer
- `*.services.ts` – business logic and orchestration
- `*.routes.ts` – Express routes wired through `validateBody`
- `*.validate.ts` – Zod validation schemas
- `*.responses.ts` – module-scoped response/error constants

---

## Project Structure

```
src/
  app/
    feature-modules/         # Your business modules (user, admin, auth, ...)
      <module>/
        <module>.interface.ts
        <module>.schema.ts
        <module>.repo.ts
        <module>.services.ts
        <module>.routes.ts
        <module>.validate.ts
        <module>.responses.ts
    db.cache.connection/     # Mongo/Postgres + Redis connection setup
    middleware/               # app middlewares (auth, errorHandler, rateLimiter, ...)
    routes/                   # Route registry and types
    utility/
      keys/                   # Auto-generated RSA keys (unique per project)
      base.schema.ts          # Mongoose BaseSchema   (MongoDB projects)
      base.entity.ts          # TypeORM  BaseEntity   (PostgreSQL projects)
  index.ts
scripts/                      # copy-keys.js and friends
.moduler.json                 # Marker file: { "db": "mongodb" | "postgres" }
```

---

## Security & Keys

On creation, the framework generates a **2048-bit RSA key pair** in `src/app/utility/keys/`:

- **Private key** – used for signing JWTs or encrypting sensitive data.
- **Public key** – used for verifying signatures.

These keys are unique to every project. **Never commit or share your `private.pem`.**

---

## Built-in middleware

Generated projects include three reusable middleware modules in `src/app/middleware/`. Together they cover **authentication**, **role checks**, and **rate limiting**.

### How authentication is applied globally

In `src/app/routes/routes.ts`, each feature router is mounted with **`tokenValidator`** and a shared list of **`ExcludedPath`** entries (from `routes.data.ts`):

- Every request hits **`tokenValidator(excludedPaths)`** before your route handlers.
- Paths listed in `excludedPaths` skip JWT checks (typically login, refresh, or public signup-style endpoints). Match rules use the **full path** (mount prefix + route path) and HTTP **method**, both normalized (trailing slashes stripped).
- All other requests must send `Authorization: Bearer <jwt>`. The token is verified with the **RSA public key** from `getPublicKey()` (same key pair as in [Security & Keys](#security--keys)).
- On success, the middleware sets **`res.locals.userId`** and **`res.locals.role`** from the JWT payload (`id` and `role`). Your handlers and downstream middleware can read these.
- On failure (missing header, invalid token, expired token, missing public key), the middleware passes an **`AppError`** to Express (`401` for auth issues, `500` if the public key is missing). Use your global error handler to shape the HTTP response.

**Exports from `token.validate.ts`:**

| Export           | Purpose                                                                       |
| ---------------- | ----------------------------------------------------------------------------- |
| `tokenValidator` | Curried middleware factory: `(excludedPaths) => (req, res, next) => …`        |
| `ExcludedPath`   | Helper class: `new ExcludedPath(url, method)` — `method` is stored uppercased |
| `AppError`       | Error type with `statusCode`; used by auth and rate limiting                  |

### Role-based access (`roleValidator.ts`)

**`roleValidator`** is a **factory**: you call it with an allow-list of roles (values from `src/app/utility/constant.ts` **`Role`**). It returns standard Express middleware.

- It reads **`res.locals.role`**, which **`tokenValidator` must have set earlier** on the same request. If you use `roleValidator` on a path that is excluded from JWT validation, `role` may be undefined and the check will fail as expected.
- If the user’s role is **not** in the allow-list, the client gets **`403`** with a JSON body: `FORBIDDEN_ACCESS` and a clear message.
- **Typical usage:** mount or apply `roleValidator([Role.ADMIN, …])` on routers or individual routes **after** the stack that runs `tokenValidator`, or only on subpaths that are never excluded from auth.

_(The template ships this middleware ready to use; wire it into specific `_.routes.ts` files when you need admin-only or role-specific endpoints.)\*

### Rate limiting (`rateLimiter.ts`)

**`rateLimiter(limit, windowMs)`** returns **async** Express middleware that limits how many requests a caller can make in a sliding Redis-backed window.

- **Identity:** It builds a Redis key from **`res.locals.apiKeyId`** (if you set it in earlier middleware) or the literal `public`, plus **HTTP method**, **route pattern** (`baseUrl` + `route.path`), and the client **IP** (via `clientIp.getter.ts`).
- **Storage:** Uses **`connectToRedis()`**. The first request in a window sets the key’s TTL to **`windowMs`** (milliseconds). Count is incremented with **`INCR`**; when count **`> limit`**, the next middleware receives **`AppError`** with status **`429`**.
- **Resilience:** If Redis errors, the middleware **fails open** (calls `next()` without blocking) so a short Redis outage does not take down the API. Tighten this behavior in production if you prefer fail-closed.
- **Typical usage:** `router.post('/login', rateLimiter(5, 60_000), handler)` — e.g. five attempts per minute per IP for a sensitive route.

---

## Getting Started with Development

After the project is generated:

```bash
cd <project-name>
npm install
cp .env.sample .env     # configure your environment
npm run dev
```

---

## Architecture Rules

To keep the codebase clean, modular, and easy to scale, follow these strict boundaries.

### 1. Repository Layer Boundary

A `*.repo.ts` file **must only be used by its own module's service**.

- `user.repo.ts` used only by `user.services.ts`
- `user.repo.ts` used by `auth.services.ts` is **not** allowed

This ensures each module fully owns its database logic, and no other module can reach into its data layer directly.

### 2. Cross-Module Communication (Service-to-Service Only)

If one module needs data or behavior from another module, it **must communicate service-to-service only**. The service file is the **only public entry point** of a module. Every other file is considered private to that module.

What another module **can** access:

- `*.services.ts` — the single allowed entry point for cross-module communication

What another module **must NOT** access:

- `*.repo.ts` — repositories are private; only the owning service may use them
- `*.routes.ts` — routes are HTTP-layer concerns and must never be imported or called by another module
- `*.validate.ts`, `*.controller.ts`, or any other internal file

Examples:

- `auth.services.ts` → calls `user.services.ts` — allowed
- `auth.services.ts` → calls `user.repo.ts` — not allowed
- `auth.services.ts` → imports from `user.routes.ts` — not allowed
- `order.controller.ts` → calls `payment.repo.ts` — not allowed

**Rule of thumb:** If Module A needs something from Module B, it calls `B.services.ts`. Nothing else. Ever.

### 3. Typical Flow

```
Route  →  Validate  →  Service  →  Repo  →  Database
                          ↕
                   (Other module's Service)
```

### Why this matters

- **Encapsulation:** Each module owns its data access logic.
- **Refactoring safety:** Changing a repo only affects its own service.
- **Testability:** Services can be mocked cleanly at module boundaries.
- **Scalability:** Modules can later be split into microservices with minimal changes.

---

## What You Get Out of the Box

Running `npx moduler-framework <name>` gives you:

- A live **MongoDB** _or_ **PostgreSQL** connection script (based on your choice)
- A live **Redis** connection script
- Auto-generated RSA security keys
- A global error handler
- Middleware for **JWT auth**, **role checks**, and **Redis rate limiting** — see [Built-in middleware](#built-in-middleware)
- Zod-based request validation
- A standardized response handler

---

## Contributing

If you want to suggest improvements to the template or the CLI logic:

1. Fork the repository.
2. Create a feature branch.
3. Submit a Pull Request.

---

## Quick Reference

```bash
# Create a MongoDB project (prompted)
npx moduler-framework shop-api

# Create a PostgreSQL project (no prompt)
npx moduler-framework shop-api --postgres

# Inside the project: auto-detects DB from .moduler.json
npx moduler-framework g product

# Force MongoDB flavor
npx moduler-framework m order

# Force PostgreSQL flavor
npx moduler-framework p invoice
```
