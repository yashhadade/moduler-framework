# My Modular Framework

A powerful Node.js/TypeScript framework with built-in RSA key generation.

## How to use

Run this to create a new project:
`npx moduler-framework <project-name>`

## Generate a Module

`npx moduler-framework g <module-name>`

🚀 Modular Node.js Framework (MNF)
A highly structured, production-ready Node.js & TypeScript framework designed for scalability. It comes pre-configured with a Feature-Module architecture, automated RSA security, and a robust utility suite.

🛠️ Key Features
Feature-Module Pattern: Organizes code by business logic (e.g., User, Admin, Auth) rather than technical role.

Automated RSA Security: Generates unique private.pem and public.pem keys for every new project.

Strict TypeScript: Pre-configured tsconfig.json for type safety.

Standardized Responses: Built-in utility for consistent API responses.

Built-in CLI: Scaffolds projects and generates modules in seconds.

📥 Installation & Usage
You don't need to install this globally. Use npx to ensure you always have the latest version.

1. Create a New Project
   Run the following command to scaffold a complete project:

Bash
npx moduler-framework <project-name> 2. Add a New Feature Module
Navigate into your project folder and generate a new module (Interface, Repo, Services, Routes, etc.):

Bash
cd <project-name>
npx moduler-framework g <module-name>
📂 Project Structure Explained
Your project will be organized as follows:

src/app/feature-modules/: The heart of your app. Each sub-folder contains:

\*.interface.ts: Data shapes and TypeScript interfaces.

\*.repo.ts: Database logic and queries.

\*.services.ts: Business logic and orchestration.

\*.routes.ts: API endpoint definitions.

\*.validate.ts: Request validation logic.

src/app/utility/keys/: Stores your project's unique RSA keys. (Auto-generated)

src/app/middleware/: Custom middlewares like auth, errorHandler, and rateLimiter.

scripts/: Automation scripts (e.g., copy-keys.js).

🔐 Security & Keys
Upon creation, the framework generates a 2048-bit RSA key pair in src/app/utility/keys/.

Private Key: Used for signing JWTs or encrypting sensitive data.

Public Key: Used for verifying signatures.

Note: These keys are unique to every project. Never share your private.pem file.

🚀 Getting Started with Development
Once the project is created:

Install dependencies:

Bash
npm install
Configure your environment:

Bash
cp .env.sample .env
Run in development mode:

Bash
npm run dev
🤝 Contributing
If you want to suggest improvements to the template or the CLI logic:

Fork the repository.

Create your feature branch.

Submit a Pull Request.

Tips for your NPM Page:
Add Tags: In your package.json, add "keywords": ["nodejs", "framework", "typescript", "modular", "cli"]. This helps people find it.

License: Ensure you have a "license": "MIT" (or similar) in your package.json so companies feel safe using it.

Homepage: If you have a GitHub repo, add "homepage": "https://github.com/yashhadade/moduler-framework.git".

You are now 100% ready. Type npm publish and launch it!

⚡ The "One-Command" Power
By running npx moduler-framework <name>, the user gets:

A live MongoDB connection script.

A live Redis connection script.

Security keys generated.

A global Error Handler.

A Rate Limiter.

## 📐 How To Use This Framework (Architecture Rules)

To keep the codebase clean, modular, and easy to scale, follow these strict boundaries:

### 1. Repository Layer Boundary

A `*.repo.ts` file **must only be used by its own module's service**.

- ✅ `user.repo.ts` → used only by `user.services.ts`
- ❌ `user.repo.ts` → used by `auth.services.ts` (not allowed)

This ensures each module fully owns its database logic, and no other module can reach into its data layer directly.

### 2. Cross-Module Communication (Service-to-Service Only)

If one module needs data or behavior from another module, it **must communicate service-to-service only**. The service file is the **only public entry point** of a module. Every other file is considered private to that module.

What another module **can** access:

- ✅ `*.services.ts` — the single allowed entry point for cross-module communication

What another module **must NOT** access:

- ❌ `*.repo.ts` — repositories are private; only the owning service may use them
- ❌ `*.routes.ts` — routes are HTTP-layer concerns and must never be imported or called by another module
- ❌ `*.validate.ts`, `*.controller.ts`, or any other internal file

Examples:

- ✅ `auth.services.ts` → calls `user.services.ts`
- ❌ `auth.services.ts` → calls `user.repo.ts`
- ❌ `auth.services.ts` → imports from `user.routes.ts`
- ❌ `order.controller.ts` → calls `payment.repo.ts`

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
