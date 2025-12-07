# Contributing to RADFLOW

Thank you for your interest in contributing to RADFLOW! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Style and Standards](#code-style-and-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

RADFLOW is built for radiologists, by those who understand radiology. We expect all contributors to:

- Be respectful and professional
- Focus on constructive feedback
- Prioritize patient safety and data security
- Maintain confidentiality of any protected health information (PHI)

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git** installed and configured
- At least one AI provider API key (Google Gemini recommended)

### Forking and Cloning

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/radflow.git
   cd radflow
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/DocHatty/radflow.git
   ```

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

4. **Run Code Quality Checks**
   ```bash
   # Type checking
   npm run type-check
   
   # Linting
   npm run lint
   
   # Format code
   npm run format
   ```

## Development Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, maintainable code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Run Quality Checks**
   ```bash
   npm run type-check
   npm run lint
   npm run format
   npm run build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `perf:` - Performance improvements
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template with details

## Code Style and Standards

### TypeScript Guidelines

- Enable and respect TypeScript strict mode
- Avoid using `any` type - use proper typing
- Document complex types with JSDoc comments
- Use meaningful variable and function names

### React Best Practices

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components focused and single-purpose
- Use proper prop types and interfaces

### Code Organization

```
/components     - React components
/services       - Business logic and API services
/hooks          - Custom React hooks
/utils          - Utility functions
/types          - TypeScript type definitions
/store          - State management (Zustand)
/contexts       - React contexts
```

### Formatting

We use Prettier for code formatting. Run `npm run format` before committing.

Key settings:
- 2 spaces for indentation
- Semicolons required
- Double quotes for strings
- 80 character line width
- Trailing commas

### Linting

We use ESLint for code quality. Run `npm run lint` and fix any issues before committing.

## Testing Guidelines

### Test Structure

Tests should be placed adjacent to the code they test:
```
components/
  MyComponent.tsx
  MyComponent.test.tsx
```

### Test Coverage

Aim for high test coverage, especially for:
- Critical services (AI orchestration, multi-provider service)
- Utility functions
- Complex business logic
- Error handling paths

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Run linting and formatting checks
   - Update documentation if needed
   - Add tests for new features
   - Ensure no security vulnerabilities

2. **PR Description**
   Include:
   - Clear description of changes
   - Related issue numbers
   - Screenshots for UI changes
   - Breaking changes (if any)
   - Testing performed

3. **Review Process**
   - Address reviewer feedback promptly
   - Keep discussion focused and professional
   - Be open to suggestions
   - Update your branch as needed

4. **Merging**
   - PRs require approval from maintainers
   - Ensure CI checks pass
   - Squash commits if requested
   - Maintainer will merge when ready

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Description** - Clear and concise description
2. **Steps to Reproduce** - Detailed steps
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - Browser, OS, Node version
6. **Screenshots** - If applicable
7. **Error Messages** - Console logs or errors

### Feature Requests

When requesting features:

1. **Use Case** - Describe the clinical scenario
2. **Proposed Solution** - How it should work
3. **Alternatives** - Other approaches considered
4. **Impact** - Who benefits and how

### Security Issues

**DO NOT** report security vulnerabilities in public issues.

Instead, email: DoctorHatkoff14@gmail.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Architecture Guidelines

### Multi-Provider AI System

When working with AI providers:
- Use the `aiOrchestrator` for task routing
- Add new providers through `multiProviderAiService`
- Maintain provider abstraction
- Test with multiple providers

### State Management

- Use Zustand for global state
- Keep state normalized and minimal
- Use selectors for derived state
- Persist only necessary data

### Performance Considerations

- Lazy load large components
- Implement code splitting for services
- Optimize bundle size
- Cache API responses when appropriate
- Use React.memo for expensive components

## Questions?

If you have questions:
- Check existing issues and discussions
- Read the documentation
- Email: DoctorHatkoff14@gmail.com

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (Personal/Research Use - see LICENSE file).

---

Thank you for contributing to RADFLOW! Your efforts help build better tools for radiologists worldwide.
