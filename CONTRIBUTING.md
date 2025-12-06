# Contributing to Qalin Sara Inventory

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the project
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18.0 or higher
- npm or yarn
- Git
- A Supabase account for testing
- A code editor (VS Code recommended)

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

---

## Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/qalin-sara-inventory.git
   cd qalin-sara-inventory
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/qalin-sara-inventory.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

6. **Set up the database**
   - Run all migrations in `supabase/migrations/` in order

7. **Start development server**
   ```bash
   npm run dev
   ```

---

## Making Changes

### Branch Naming Convention

Use descriptive branch names:

- `feature/` - New features (e.g., `feature/export-pdf`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect`)
- `docs/` - Documentation changes (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/product-form`)
- `style/` - UI/styling changes (e.g., `style/dark-mode-improvements`)

### Workflow

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow the code style guidelines
   - Add tests if applicable

4. **Test your changes**
   ```bash
   npm run lint
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**

---

## Code Style

### TypeScript Guidelines

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid using `any` type when possible
- Use meaningful variable and function names

```typescript
// ✅ Good
interface ProductFormData {
  code: string
  photoUrl?: string
  sizes: ProductSize[]
}

const handleProductSubmit = async (data: ProductFormData): Promise<void> => {
  // implementation
}

// ❌ Bad
const handleSubmit = async (data: any) => {
  // implementation
}
```

### React Guidelines

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop typing

```typescript
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}

export function Button({ variant, onClick, children, disabled = false }: ButtonProps) {
  return (
    <button
      className={getButtonClasses(variant)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

### File Organization

- Place components in appropriate directories
- Group related files together
- Use index files for clean imports when appropriate

```
components/
├── products/
│   ├── product-form.tsx      # Form component
│   ├── product-table.tsx     # Table component
│   └── product-card.tsx      # Card component
```

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theme colors
- Maintain consistent spacing

```tsx
// ✅ Good - Using Tailwind classes
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">

// ❌ Bad - Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat(products): add bulk import functionality"

# Bug fix
git commit -m "fix(auth): resolve login redirect issue"

# Documentation
git commit -m "docs: update installation instructions"

# Refactoring
git commit -m "refactor(orders): simplify order calculation logic"
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-reviewed the code
- [ ] Added comments for complex logic
- [ ] Updated documentation if needed
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe testing steps

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. Submit your PR
2. Wait for automated checks to pass
3. Address review feedback
4. Once approved, your PR will be merged

---

## Questions?

If you have questions or need help, feel free to:

- Open an issue for discussion
- Reach out to the maintainers

Thank you for contributing! 🎉




