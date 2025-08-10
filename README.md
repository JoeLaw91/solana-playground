# Solana Playground Apps

This monorepo contains the applications for the Solana Playground project.

### Project Structure
```
apps/
├── api/          # NestJS Backend API
├── web/          # Next.js Frontend Web App
└── package.json  # Root package.json for monorepo management
```

### Development
```bash
# Start both API and Web in development mode
pnpm run dev

# Or start individually
pnpm run dev:api   # Start API only
pnpm run dev:web   # Start Web only
```

### Building
```bash
# Build both applications
pnpm run build

# Or build individually
pnpm run build:api
pnpm run build:web
```

### Testing
```bash
# Run API tests
pnpm run test

# Run API tests in watch mode
pnpm run test:api:watch

# Run API end-to-end tests
pnpm run test:api:e2e

# Run API tests with coverage
pnpm run test:api:cov
```

### Linting & Formatting
```bash
# Lint both applications
pnpm run lint

# Format API code
pnpm run format
```
