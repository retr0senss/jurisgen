# 🤝 Contributing to JurisGen

JurisGen projesine katkıda bulunduğunuz için teşekkür ederiz! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklar.

## 📋 İçindekiler

- [Code of Conduct](#code-of-conduct)
- [Nasıl Katkıda Bulunurum?](#nasıl-katkıda-bulunurum)
- [Development Setup](#development-setup)
- [Commit Kuralları](#commit-kuralları)
- [Pull Request Süreci](#pull-request-süreci)
- [Issue Raporlama](#issue-raporlama)

## 🤝 Code of Conduct

Bu proje [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct'ını benimser. Katılım göstererek, bu kodu onayladığınızı kabul etmiş olursunuz.

## 🚀 Nasıl Katkıda Bulunurum?

### 1. Repository'yi Fork'layın

```bash
# GitHub'da fork butonuna tıklayın
git clone https://github.com/your-username/jurisgen.git
cd jurisgen
```

### 2. Development Environment Kurun

```bash
# Dependencies
npm install

# Environment setup
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# Database setup
npx prisma migrate dev
npx prisma generate

# MCP Server setup
git clone https://github.com/retr0senss/mevzuat-mcp-jurisgen.git
cd mevzuat-mcp-jurisgen
uv sync
```

### 3. Feature Branch Oluşturun

```bash
git checkout -b feature/amazing-feature
# veya
git checkout -b fix/bug-description
```

## 🛠️ Development Setup

### Gereksinimler

- Node.js 18+
- Python 3.11+
- Git
- uv (Python package manager)

### Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:watch

# Build
npm run build
```

## 📝 Commit Kuralları

[Conventional Commits](https://www.conventionalcommits.org/) formatını kullanıyoruz:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat`: Yeni özellik
- `fix`: Bug düzeltmesi
- `docs`: Dokümantasyon değişiklikleri
- `style`: Kod formatı (linting, spacing, vb.)
- `refactor`: Kod refactoring
- `perf`: Performans iyileştirmeleri
- `test`: Test ekleme/düzeltme
- `chore`: Build process, dependency updates

### Örnekler

```bash
git commit -m "feat: add semantic search functionality"
git commit -m "fix: resolve intent classification accuracy issue"
git commit -m "docs: update API documentation"
git commit -m "refactor(cache): improve LRU cache implementation"
```

## 🔄 Pull Request Süreci

### 1. PR Hazırlığı

```bash
# Latest changes'i pull'layın
git checkout main
git pull upstream main

# Feature branch'inizi update edin
git checkout feature/amazing-feature
git rebase main
```

### 2. PR Oluşturun

- **Title**: Clear ve descriptive
- **Description**: Değişiklikleri açıklayın
- **Screenshots**: UI değişiklikleri varsa
- **Testing**: Test edilen senaryoları belirtin

### 3. PR Template

```markdown
## 📝 Description

Brief description of changes

## 🔄 Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## ✅ Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## 📷 Screenshots (if applicable)

## 📋 Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
```

## 🐛 Issue Raporlama

### Bug Reports

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**

1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**

- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js version: [e.g. 18.17.0]
```

### Feature Requests

```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other solutions you considered

**Additional Context**
Any other context or screenshots
```

## 🎯 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow project configuration
- **Prettier**: Auto-formatting enabled
- **File Naming**: kebab-case for files, PascalCase for components

### Component Structure

```typescript
// components/ui/example-component.tsx
interface ExampleComponentProps {
  title: string;
  optional?: boolean;
}

export function ExampleComponent({
  title,
  optional = false,
}: ExampleComponentProps) {
  return (
    <div className="example-component">
      <h2>{title}</h2>
      {optional && <p>Optional content</p>}
    </div>
  );
}
```

### API Routes

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// __tests__/components/example.test.tsx
import { render, screen } from "@testing-library/react";
import { ExampleComponent } from "@/components/example-component";

describe("ExampleComponent", () => {
  it("renders title correctly", () => {
    render(<ExampleComponent title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// __tests__/api/example.test.ts
import { POST } from "@/app/api/example/route";
import { NextRequest } from "next/server";

describe("/api/example", () => {
  it("handles POST request correctly", async () => {
    const request = new NextRequest("http://localhost:3000/api/example", {
      method: "POST",
      body: JSON.stringify({ test: "data" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

## 📊 Performance Guidelines

- **Bundle Size**: Keep bundle size minimal
- **Core Web Vitals**: Maintain good scores
- **Caching**: Implement appropriate caching strategies
- **Database**: Optimize queries and use indexes

## 🔒 Security Guidelines

- **Input Validation**: Validate all user inputs
- **Authentication**: Use Clerk.dev properly
- **API Security**: Rate limiting and validation
- **Environment Variables**: Never commit secrets

## 📞 İletişim

- **GitHub Issues**: Bug reports ve feature requests
- **GitHub Discussions**: Genel tartışmalar
- **Email**: Özel konular için

## 🙏 Teşekkürler

Katkılarınız JurisGen'i daha iyi hale getiriyor. Her türlü katkı değerlidir:

- 🐛 Bug reports
- 💡 Feature suggestions
- 📖 Documentation improvements
- 🧪 Testing
- 💻 Code contributions
- 📢 Community support

**Happy Coding! 🚀**
