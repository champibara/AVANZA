# Contributing to Violence Digital Platform

We welcome contributions from the community! This document provides guidelines for contributing to the Violence Digital Platform project.

## Code of Conduct

Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating in this project.

## Getting Started

### Development Environment Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Start development services: `npm run docker:up`

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Format code: `npm run format`
6. Commit your changes: `git commit -m "feat: description of changes"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Pull Request Guidelines

### Before Submitting a Pull Request

1. Ensure your code passes all tests
2. Run linting to check for code style issues
3. Update documentation if needed
4. Add tests for new functionality
5. Ensure your commit messages follow conventional commits format

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #issue_number

## Testing
- [ ] Added unit tests
- [ ] Added integration tests
- [ ] All tests pass

## Documentation
- [ ] Updated README
- [ ] Updated API documentation
- [ ] Updated design documents

## Security Considerations
- [ ] Reviewed for security implications
- [ ] Follows security requirements (8.1, 8.2)
- [ ] Handles sensitive data appropriately
```

## Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer interfaces over types for object definitions
- Use explicit return types for public APIs
- Avoid `any` type - use `unknown` or proper typing

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes, interfaces, and components
- Use UPPER_SNAKE_CASE for constants
- Use kebab-case for file names

### Testing Guidelines

- Write both unit tests and property-based tests for new functionality
- Use descriptive test names that explain what is being tested
- Mock external dependencies appropriately
- Test edge cases and error conditions

### Security Guidelines

- Always validate and sanitize user input
- Use parameterized queries to prevent SQL injection
- Follow encryption requirements (8.1, 8.2)
- Never commit secrets or credentials
- Implement proper access controls

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Changes to build process, tools, etc.

Examples:
```
feat(chat-api): add PIN generation for cases
fix(evidence-api): fix file upload validation
docs: update README with deployment instructions
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
cd packages/frontend && npm run test

# Run tests with coverage
npm run test -- --coverage
```

### Writing Tests

- Each package should have its own test suite
- Use descriptive test names
- Mock external services appropriately
- Test both happy paths and error conditions

## Documentation

### Updating Documentation

- Update README.md for major changes
- Update API documentation when endpoints change
- Update design documents for architectural changes
- Add inline code comments for complex logic

### API Documentation

Use JSDoc comments for public APIs:

```typescript
/**
 * Generates a unique PIN for case tracking
 * @param caseData - The case data to generate PIN for
 * @returns Unique case PIN string
 * @throws {ValidationError} If case data is invalid
 */
export function generateCasePin(caseData: CaseData): string
```

## Questions?

If you have questions about contributing, please:
1. Check existing documentation
2. Search existing issues
3. Create a new issue with your question