<!--
  ⚠️ TEMPLATE NOTICE
  This is a starter template. Customize for your project.
  See CHECKLIST.md for items that need review.
-->

# Contributing to [project-name]

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/[github-username]/[repo-name]/issues)
2. If not, create a new issue using the bug report template
3. Provide as much detail as possible

### Suggesting Features

1. Check if the feature has already been suggested in [Issues](https://github.com/[github-username]/[repo-name]/issues)
2. If not, create a new issue using the feature request template
3. Explain the use case and benefits

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `pnpm typecheck && pnpm lint`
5. Commit your changes: `git commit -m "feat: add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/[github-username]/[repo-name].git
cd [repo-name]

# Install dependencies
pnpm install

# Start development server
pnpm dev:website

# Run type check
pnpm typecheck

# Run linter
pnpm lint
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Questions?

Feel free to open a [Discussion](https://github.com/[github-username]/[repo-name]/discussions) if you have any questions.
