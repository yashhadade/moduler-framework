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
- A request rate limiter
- JWT token validation middleware
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
