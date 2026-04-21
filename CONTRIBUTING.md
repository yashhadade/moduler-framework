# Contributing to Modular Framework

First off, thank you for taking the time to contribute! It is people like you who make this framework better for everyone.

## Branching Strategy

To keep our production code stable, we follow a strict branching model:

1. **main**: Contains the latest stable, published version of the framework. **Direct PRs to `main` will be closed.**
2. **dev**: Integration branch. **All Pull Requests must be targeted at the `dev` branch.**

## How to Contribute

### 1. Fork and Clone

Fork the repository to your own GitHub account and clone it locally:

```bash
git clone https://github.com/yashhadade/moduler-framework.git
cd moduler-framework
npm install
```

### 2. Create a Feature Branch

Branch off from `dev` using a descriptive name:

```bash
git checkout dev
git pull origin dev
git checkout -b feat/your-feature-name
```

### 3. Make Your Changes

Before pushing, make sure the following pass locally:

```bash
npm run format:check
npm run lint
```

If formatting fails, run `npm run format` to auto-fix.
If linting fails, run `npm run lint:fix` where possible.

## Commit Message Format

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This is enforced automatically by CI — **PRs with invalid commit messages will fail the checks and cannot be merged.**

### Format

```
<type>(<optional scope>): <subject>

<optional body>

<optional footer>
```

### Allowed Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation-only changes                              |
| `style`    | Formatting, whitespace, semicolons (no code change)     |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvements                                |
| `test`     | Adding or updating tests                                |
| `build`    | Changes to build system or dependencies                 |
| `ci`       | Changes to CI configuration files or scripts            |
| `chore`    | Other changes that don't modify `src` or `test` files   |
| `revert`   | Reverts a previous commit                               |

### Rules

- The **subject must start with a lowercase letter**.
- The **subject must not be empty**.
- The **header must be 100 characters or less**.
- The **type must be one of the allowed types above**.

### Examples

Good:

```
feat(cli): add interactive project name prompt
fix(template): correct redis connection retry logic
docs: update contributing guide with commit rules
chore(deps): bump prettier to 3.8.1
refactor(bin): simplify template copy logic
```

Bad:

```
Added new feature                   (missing type)
feat: Added new feature             (subject starts with uppercase)
update stuff                        (missing type)
FEAT: add prompt                    (type must be lowercase)
```

## Pull Request Checklist

Before opening a PR, make sure:

- [ ] Branch is created from and targeted at **`dev`** (not `main`).
- [ ] `npm run format:check` passes.
- [ ] `npm run lint` passes.
- [ ] Every commit message follows Conventional Commits.
- [ ] **PR title** also follows Conventional Commits (e.g. `feat: add new CLI option`).
- [ ] PR description clearly explains the "why" of the change.

## What CI Checks

When you open a PR against `dev` or `main`, the following jobs run automatically and **must all pass** before merge:

1. **Prettier + ESLint Check** — runs `npm run format:check` and `npm run lint`.
2. **Conventional Commit Format Check** — validates every commit in the PR using `commitlint`.
3. **PR Title Conventional Format** — validates that the PR title follows Conventional Commits.

If any check fails, fix the issue and push again. The workflow will re-run automatically.

## Questions?

If anything in this guide is unclear, open an issue with the `question` label and we'll help you out.

