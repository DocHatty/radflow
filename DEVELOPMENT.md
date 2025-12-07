# Development Guide

This guide provides detailed information for developers working on RADFLOW.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Building and Deployment](#building-and-deployment)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

RADFLOW is a React-based single-page application (SPA) built with:

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **AI Integration**: Multiple provider support (Google Gemini, OpenAI, Anthropic, etc.)

### Key Architectural Patterns

#### Multi-Provider AI System

The application uses a flexible multi-provider architecture:

```
User Request
    ↓
AI Orchestrator (aiOrchestrator.ts)
    ↓
Task Routing (based on task type)
    ↓
Multi-Provider Service (multiProviderAiService.ts)
    ↓
Provider-Specific Implementation
    ↓
AI Provider API (Google, OpenAI, etc.)
```

#### State Management

State is managed through Zustand stores:

- `WorkflowSlice`: Manages workflow state, reports, and findings
- `SettingsSlice`: Manages application settings and provider configuration

State is persisted to localStorage with selective persistence.

#### Component Architecture

```
App.tsx (Root)
├── Header
├── WorkflowStepper
├── Stages
│   ├── InputStage
│   ├── VerificationStage
│   └── SubmittedStage
└── Modals/Panels
    ├── SettingsPanel
    ├── DiagnosticsPanel
    └── ApiKeySetupModal
```

## Project Structure

```
radflow/
├── .github/                  # GitHub configuration
│   ├── workflows/           # GitHub Actions CI/CD
│   └── dependabot.yml      # Automated dependency updates
├── components/              # React components
│   ├── stages/             # Workflow stage components
│   └── [various components]
├── services/               # Business logic and AI services
│   ├── aiOrchestrator.ts  # Routes tasks to appropriate models
│   ├── multiProviderAiService.ts  # Multi-provider implementation
│   ├── geminiService.ts   # Google Gemini-specific features
│   └── [other services]
├── utils/                  # Utility functions
│   ├── textUtils.ts       # Text processing
│   ├── followUpEngine.ts  # Follow-up recommendations
│   └── [other utilities]
├── hooks/                  # Custom React hooks
├── store/                  # Zustand state management
├── types/                  # TypeScript type definitions
├── contexts/              # React contexts
├── data/                  # Static data and templates
├── guidelines/            # Medical guidelines data
├── settings/              # Configuration and prompts
├── tests/                 # Test files
└── public/                # Static assets
```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- AI Provider API key (Google Gemini recommended)

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/DocHatty/radflow.git
   cd radflow
   npm install
   ```

2. **Configure Environment**
   Create `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Initialize Git Hooks**
   ```bash
   npm run prepare
   ```

### Development Commands

```bash
# Start development server (opens browser automatically)
npm run dev

# Run type checking
npm run type-check

# Run linter
npm run lint
npm run lint:fix  # Auto-fix issues

# Format code
npm run format
npm run format:check

# Run tests
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

## Code Standards

### TypeScript

- **Strict Mode**: Enabled - all code must pass strict type checking
- **Type Safety**: Avoid `any` - use proper types or `unknown`
- **Naming Conventions**:
  - Components: PascalCase (e.g., `MyComponent`)
  - Functions/Variables: camelCase (e.g., `myFunction`)
  - Types/Interfaces: PascalCase (e.g., `MyType`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### React

- **Components**: Use functional components with hooks
- **Props**: Define prop types with TypeScript interfaces
- **State**: Use hooks (useState, useReducer) or Zustand
- **Effects**: Keep useEffect dependencies correct and minimal
- **Memoization**: Use React.memo, useMemo, useCallback for expensive operations

### File Organization

- One component per file
- Co-locate tests with components (ComponentName.test.tsx)
- Group related utilities in utils/
- Keep services focused and single-purpose

### Code Style

Enforced by ESLint and Prettier:

- 2-space indentation
- Semicolons required
- Double quotes for strings
- 80 character line width
- Trailing commas in multi-line structures

## Testing

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Testing Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Test Coverage**: Aim for >80% coverage on critical paths
4. **Mock External Dependencies**: Mock API calls and external services
5. **Test Edge Cases**: Include error cases and boundary conditions

### What to Test

Priority areas for testing:

1. **Critical Services**:
   - `aiOrchestrator.ts` - Task routing logic
   - `multiProviderAiService.ts` - Provider abstraction
   - `followUpEngine.ts` - Follow-up recommendations

2. **Utility Functions**:
   - Text processing
   - Data transformations
   - Validation logic

3. **Complex Components**:
   - Forms with validation
   - State management logic
   - Conditional rendering

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
# View coverage/index.html in browser
```

## Building and Deployment

### Production Build

```bash
npm run build
```

This creates optimized bundles in `dist/`:
- Code splitting for better performance
- Minification and tree-shaking
- Source maps for debugging

### Build Optimization

The build is optimized with:

1. **Code Splitting**: Vendor chunks separated from application code
2. **Manual Chunks**: AI services, utilities, and UI libraries separated
3. **Tree Shaking**: Unused code eliminated
4. **Minification**: Code compressed for production

### Deployment

RADFLOW is a static SPA that can be deployed to:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag-and-drop `dist/` folder
- **GitHub Pages**: Deploy `dist/` folder
- **Any Static Host**: Serve `dist/` folder with a web server

Important: Set environment variables in your hosting platform's settings.

## Troubleshooting

### Common Issues

#### Build Errors

**Problem**: TypeScript errors during build
```bash
npm run type-check
```
Fix type errors before building.

**Problem**: ESLint errors blocking build
```bash
npm run lint:fix
```
Auto-fix linting issues.

#### Runtime Errors

**Problem**: API key not working
- Check `.env.local` file exists
- Verify key is correct
- Check browser console for errors
- Try entering key in Settings panel

**Problem**: AI responses not appearing
- Check network tab for failed requests
- Verify API key has proper permissions
- Check provider status page
- Review diagnostics panel in app

#### Development Server Issues

**Problem**: Port 3000 already in use
- Change port in `vite.config.ts`
- Or kill the process using port 3000

**Problem**: Hot reload not working
- Restart development server
- Clear browser cache
- Check for syntax errors

### Getting Help

1. Check existing issues on GitHub
2. Review documentation and README
3. Ask in discussions (if enabled)
4. Email: DoctorHatkoff14@gmail.com

## Performance Optimization

### Best Practices

1. **Code Splitting**: Import large libraries dynamically
2. **Lazy Loading**: Use React.lazy for route-based splitting
3. **Memoization**: Use React.memo for expensive components
4. **Virtualization**: Use virtual scrolling for long lists
5. **Bundle Analysis**: Use `npm run build -- --mode analyze`

### Monitoring Performance

- Use React DevTools Profiler
- Check Lighthouse scores
- Monitor bundle sizes in CI
- Profile with Chrome DevTools

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

---

For questions or issues, please open a GitHub issue or contact the maintainer.
