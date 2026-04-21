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
npx moduler-framework <project-name>
2. Add a New Feature Module
Navigate into your project folder and generate a new module (Interface, Repo, Services, Routes, etc.):

Bash
cd <project-name>
npx moduler-framework g <module-name>
📂 Project Structure Explained
Your project will be organized as follows:

src/app/feature-modules/: The heart of your app. Each sub-folder contains:

*.interface.ts: Data shapes and TypeScript interfaces.

*.repo.ts: Database logic and queries.

*.services.ts: Business logic and orchestration.

*.routes.ts: API endpoint definitions.

*.validate.ts: Request validation logic.

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

Homepage: If you have a GitHub repo, add "homepage": "https://github.com/youruser/repo#readme".

You are now 100% ready. Type npm publish and launch it!

⚡ The "One-Command" Power
By running npx moduler-framework <name>, the user gets:

A live MongoDB connection script.

A live Redis connection script.

Security keys generated.

A global Error Handler.

A Rate Limiter.