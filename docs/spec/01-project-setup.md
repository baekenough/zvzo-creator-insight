# 프로젝트 초기화 스펙: zvzo-creator-insight

> **프로젝트명**: zvzo-creator-insight
> **설명**: AI 기반 크리에이터 판매 분석 대시보드
> **기술 스택**: Next.js 14+ App Router, TypeScript, Vercel
> **작성일**: 2026-02-04

---

## 1. 프로젝트 생성

### 1.1 패키지 매니저 선택

**선택**: **pnpm**

**선택 이유**:
- 디스크 공간 효율성: 전역 스토어를 통한 의존성 공유
- 빠른 설치 속도: npm/yarn 대비 2-3배 빠름
- 엄격한 의존성 관리: Phantom dependency 방지
- Vercel 공식 지원
- Monorepo 확장 가능성 (향후 백엔드 API 분리 시)

### 1.2 프로젝트 초기화 명령어

```bash
# pnpm 설치 (미설치 시)
npm install -g pnpm@8.15.1

# Next.js 프로젝트 생성
pnpm create next-app@14.2.3 zvzo-creator-insight \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

cd zvzo-creator-insight
```

---

## 2. 핵심 의존성 설치

### 2.1 프로덕션 의존성

```bash
# UI Framework & Styling
pnpm add next@14.2.3
pnpm add react@18.3.1 react-dom@18.3.1
pnpm add typescript@5.4.5
pnpm add tailwindcss@3.4.3 postcss@8.4.38 autoprefixer@10.4.19

# shadcn/ui 설치 (CLI를 통한 초기화)
pnpm dlx shadcx-ui@latest init

# 선택할 옵션:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - React Server Components: Yes
# - TypeScript: Yes
# - Tailwind CSS: Yes
# - Import alias: @/components
# - Config: Yes (tailwind.config.ts)

# shadcn/ui 필수 컴포넌트 설치
pnpm dlx shadcn-ui@latest add button card input label select table tabs toast dropdown-menu dialog

# 데이터 시각화
pnpm add recharts@2.12.2

# AI / API
pnpm add openai@4.28.4
pnpm add zod@3.23.6

# 유틸리티
pnpm add clsx@2.1.1 tailwind-merge@2.3.0
pnpm add date-fns@3.6.0
pnpm add lucide-react@0.378.0

# 상태 관리 (optional, 나중에 필요 시)
# pnpm add zustand@4.5.2

# 폼 관리 (나중에 필요 시)
# pnpm add react-hook-form@7.51.3 @hookform/resolvers@3.3.4
```

### 2.2 개발 의존성

```bash
# TypeScript 타입 정의
pnpm add -D @types/node@20.12.7
pnpm add -D @types/react@18.3.1
pnpm add -D @types/react-dom@18.3.0

# Linting & Formatting
pnpm add -D eslint@8.57.0
pnpm add -D eslint-config-next@14.2.3
pnpm add -D prettier@3.2.5
pnpm add -D prettier-plugin-tailwindcss@0.5.14

# Testing
pnpm add -D vitest@1.5.0
pnpm add -D @vitejs/plugin-react@4.2.1
pnpm add -D @testing-library/react@15.0.5
pnpm add -D @testing-library/jest-dom@6.4.2
pnpm add -D @testing-library/user-event@14.5.2
pnpm add -D jsdom@24.0.0

# Git Hooks & Commit Linting
pnpm add -D husky@9.0.11
pnpm add -D lint-staged@15.2.2
pnpm add -D @commitlint/cli@19.3.0
pnpm add -D @commitlint/config-conventional@19.2.2
```

---

## 3. 설정 파일 전체 내용

### 3.1 TypeScript 설정: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/app/*": ["./src/app/*"]
    },
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3.2 ESLint 설정: `.eslintrc.json`

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off",
    "prefer-const": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ]
  }
}
```

### 3.3 Prettier 설정: `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 3.4 Prettier Ignore: `.prettierignore`

```
node_modules
.next
out
build
dist
coverage
.vercel
pnpm-lock.yaml
```

### 3.5 Tailwind 설정: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ZVZO 브랜드 컬러
        zvzo: {
          primary: '#236AF7',
          50: '#EBF2FE',
          100: '#D7E5FD',
          200: '#AFCBFB',
          300: '#87B1F9',
          400: '#5F97F7',
          500: '#236AF7', // 메인 브랜드 컬러
          600: '#1C55C6',
          700: '#154094',
          800: '#0E2B63',
          900: '#071631',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
```

### 3.6 PostCSS 설정: `postcss.config.mjs`

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

### 3.7 Next.js 설정: `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['zvzo.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
```

### 3.8 Vitest 설정: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.config.*',
        '**/*.d.ts',
        'src/app/layout.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3.9 Vitest Setup 파일: `src/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 각 테스트 후 cleanup
afterEach(() => {
  cleanup();
});
```

### 3.10 Commitlint 설정: `commitlint.config.ts`

```typescript
import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능
        'fix', // 버그 수정
        'docs', // 문서 수정
        'style', // 코드 포맷팅 (기능 변경 없음)
        'refactor', // 코드 리팩토링
        'test', // 테스트 추가/수정
        'chore', // 빌드/설정 변경
        'perf', // 성능 개선
        'ci', // CI 설정 변경
        'revert', // 커밋 되돌리기
      ],
    ],
    'subject-case': [0],
  },
};

export default Configuration;
```

### 3.11 Husky Pre-commit Hook

```bash
# Husky 초기화
pnpm exec husky init

# .husky/pre-commit 파일 생성 (자동 생성됨, 내용 수정)
```

**`.husky/pre-commit`** 파일 내용:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

**`.husky/commit-msg`** 파일 생성:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit $1
```

### 3.12 lint-staged 설정: `package.json`에 추가

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,mdx,css,yaml,yml}": ["prettier --write"]
  }
}
```

---

## 4. 디렉토리 구조

### 4.1 전체 파일 트리

```
zvzo-creator-insight/
├── .husky/
│   ├── _/
│   ├── pre-commit
│   └── commit-msg
├── .next/                          # Next.js 빌드 출력 (gitignore)
├── .vscode/
│   └── settings.json
├── node_modules/                   # 의존성 (gitignore)
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│       └── .gitkeep
├── src/
│   ├── __tests__/
│   │   ├── setup.ts
│   │   └── components/
│   │       └── .gitkeep
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── toast.tsx
│   │   ├── dashboard/
│   │   │   ├── sales-chart.tsx
│   │   │   ├── product-table.tsx
│   │   │   └── insight-card.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   └── providers/
│   │       └── theme-provider.tsx
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-sales-data.ts
│   ├── lib/
│   │   ├── openai.ts
│   │   ├── utils.ts
│   │   └── validators.ts
│   ├── types/
│   │   ├── sales.ts
│   │   ├── api.ts
│   │   └── index.ts
│   └── utils/
│       ├── format.ts
│       └── date.ts
├── .env.local                      # 환경 변수 (gitignore)
├── .env.example                    # 환경 변수 예시
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── .prettierignore
├── commitlint.config.ts
├── next.config.ts
├── next-env.d.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

### 4.2 디렉토리별 설명

| 디렉토리 | 용도 |
|---------|------|
| `src/app/` | Next.js 14 App Router 페이지 및 API 라우트 |
| `src/components/ui/` | shadcn/ui 재사용 가능한 UI 컴포넌트 |
| `src/components/dashboard/` | 대시보드 전용 비즈니스 컴포넌트 |
| `src/components/layout/` | 레이아웃 컴포넌트 (헤더, 사이드바 등) |
| `src/hooks/` | 커스텀 React Hooks |
| `src/lib/` | 외부 라이브러리 래퍼 및 설정 |
| `src/types/` | TypeScript 타입 정의 |
| `src/utils/` | 순수 유틸리티 함수 |
| `src/__tests__/` | 테스트 파일 및 설정 |
| `public/` | 정적 파일 (이미지, 폰트 등) |

---

## 5. 환경 변수

### 5.1 `.env.example` 파일

```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Next.js Public Variables (클라이언트에서 접근 가능)
NEXT_PUBLIC_APP_NAME=ZVZO Creator Insight
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 5.2 `.env.local` 파일 (실제 사용, gitignore에 포함)

```bash
# .env.example 복사 후 실제 값 입력
OPENAI_API_KEY=your-actual-openai-api-key-here
NEXT_PUBLIC_APP_NAME=ZVZO Creator Insight
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. 초기 파일 생성

### 6.1 VSCode 설정: `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 6.2 `.gitignore` (기본 생성됨, 추가 항목)

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# vitest
coverage/
```

### 6.3 `README.md`

```markdown
# ZVZO Creator Insight

AI 기반 크리에이터 판매 분석 대시보드

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **AI**: OpenAI API
- **Deployment**: Vercel

## 시작하기

### 사전 요구사항

- Node.js 20.x 이상
- pnpm 8.x 이상

### 설치

\`\`\`bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 실제 API 키 입력

# 개발 서버 실행
pnpm dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 스크립트

\`\`\`bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 실행
pnpm format       # Prettier 포맷팅
pnpm test         # Vitest 테스트 실행
pnpm test:ui      # Vitest UI 실행
pnpm test:coverage # 테스트 커버리지
\`\`\`

## 커밋 컨벤션

이 프로젝트는 [Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다.

\`\`\`
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드/설정 변경
\`\`\`

## 배포

Vercel에 자동 배포됩니다.

\`\`\`bash
# Vercel CLI 설치
pnpm add -g vercel

# 프로젝트 배포
vercel
\`\`\`

## 라이선스

MIT
```

### 6.4 초기 `package.json` 스크립트 추가

```json
{
  "name": "zvzo-creator-insight",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,mdx,css,yaml,yml}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,mdx,css,yaml,yml}\"",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "prepare": "husky"
  }
}
```

---

## 7. 초기 실행 명령어 (전체 프로세스)

### 7.1 프로젝트 생성부터 로컬 실행까지

```bash
# 1. pnpm 설치 (미설치 시)
npm install -g pnpm@8.15.1

# 2. Next.js 프로젝트 생성
pnpm create next-app@14.2.3 zvzo-creator-insight \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

cd zvzo-creator-insight

# 3. shadcn/ui 초기화
pnpm dlx shadcn-ui@latest init
# 프롬프트에서 다음 선택:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - All other options: Yes (default)

# 4. shadcn/ui 컴포넌트 설치
pnpm dlx shadcn-ui@latest add button card input label select table tabs toast dropdown-menu dialog

# 5. 핵심 프로덕션 의존성 설치
pnpm add recharts@2.12.2 openai@4.28.4 zod@3.23.6 clsx@2.1.1 tailwind-merge@2.3.0 date-fns@3.6.0 lucide-react@0.378.0

# 6. 개발 의존성 설치
pnpm add -D prettier@3.2.5 prettier-plugin-tailwindcss@0.5.14 \
  vitest@1.5.0 @vitejs/plugin-react@4.2.1 \
  @testing-library/react@15.0.5 @testing-library/jest-dom@6.4.2 @testing-library/user-event@14.5.2 jsdom@24.0.0 \
  husky@9.0.11 lint-staged@15.2.2 \
  @commitlint/cli@19.3.0 @commitlint/config-conventional@19.2.2

# 7. Husky 초기화
pnpm exec husky init

# 8. 설정 파일 생성 (위의 3. 설정 파일 전체 내용 참고)
# - tsconfig.json (수정)
# - .eslintrc.json (생성)
# - .prettierrc (생성)
# - .prettierignore (생성)
# - tailwind.config.ts (수정 - ZVZO 컬러 추가)
# - next.config.ts (수정)
# - vitest.config.ts (생성)
# - commitlint.config.ts (생성)
# - .vscode/settings.json (생성)

# 9. Husky hooks 설정
echo '#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged' > .husky/pre-commit

echo '#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit $1' > .husky/commit-msg

chmod +x .husky/pre-commit .husky/commit-msg

# 10. package.json에 lint-staged 설정 추가 (수동 편집)
# "lint-staged": {
#   "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
#   "*.{json,md,mdx,css,yaml,yml}": ["prettier --write"]
# }

# 11. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집하여 OPENAI_API_KEY 입력

# 12. 디렉토리 구조 생성
mkdir -p src/{__tests__/components,components/{ui,dashboard,layout,providers},hooks,lib,types,utils}
mkdir -p public/images
touch src/__tests__/setup.ts
touch src/hooks/.gitkeep src/lib/.gitkeep src/types/.gitkeep src/utils/.gitkeep public/images/.gitkeep

# 13. Git 초기화 및 첫 커밋
git add .
git commit -m "chore: initial project setup with Next.js 14 and TypeScript"

# 14. 개발 서버 실행
pnpm dev
```

### 7.2 Vercel 배포

```bash
# 1. Vercel CLI 설치 (글로벌)
pnpm add -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 배포 (초기 설정)
vercel

# 프롬프트 응답:
# - Set up and deploy? Yes
# - Which scope? (계정 선택)
# - Link to existing project? No
# - Project name? zvzo-creator-insight
# - In which directory is your code located? ./
# - Override settings? No

# 4. 환경 변수 설정 (Vercel Dashboard에서)
# https://vercel.com/dashboard -> 프로젝트 선택 -> Settings -> Environment Variables
# OPENAI_API_KEY 추가

# 5. 프로덕션 배포
vercel --prod

# 또는 GitHub 연동 후 자동 배포
# - GitHub 레포지토리 생성
# - Vercel에서 GitHub 레포지토리 import
# - main 브랜치 push 시 자동 배포
```

---

## 8. 초기 코드 파일

### 8.1 `src/lib/utils.ts` (shadcn/ui 유틸)

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 8.2 `src/lib/openai.ts`

```typescript
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### 8.3 `src/types/sales.ts`

```typescript
export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface ProductData {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

export interface Insight {
  type: 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}
```

### 8.4 `src/app/layout.tsx` (기본 수정)

```typescript
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZVZO Creator Insight',
  description: 'AI-powered creator sales analysis dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

### 8.5 `src/app/globals.css` (Tailwind + shadcn/ui 변수)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%; /* ZVZO Primary #236AF7 */
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 8.6 `src/app/page.tsx` (임시 홈페이지)

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-zvzo-primary">
          ZVZO Creator Insight
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          AI 기반 크리에이터 판매 분석 대시보드
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/dashboard">대시보드 시작하기</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
```

---

## 9. 검증 체크리스트

프로젝트 설정 완료 후 다음 사항을 확인하세요:

### 9.1 의존성 설치 확인

```bash
# Node.js 버전 확인 (20.x 이상)
node --version

# pnpm 버전 확인 (8.x 이상)
pnpm --version

# 의존성 설치 확인
pnpm list --depth=0
```

### 9.2 개발 환경 확인

```bash
# TypeScript 컴파일 체크
pnpm type-check

# Linting 확인
pnpm lint

# Formatting 확인
pnpm format:check

# 테스트 실행
pnpm test

# 개발 서버 실행
pnpm dev
# http://localhost:3000 접속 확인
```

### 9.3 Git Hooks 확인

```bash
# 테스트 커밋 (실패해야 정상)
git commit -m "test" --allow-empty
# commitlint가 작동하여 실패

# 정상 커밋
git commit -m "test: verify commit hooks" --allow-empty
# 성공
```

### 9.4 빌드 확인

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 실행
pnpm start
# http://localhost:3000 접속 확인
```

---

## 10. 다음 단계

프로젝트 초기 설정이 완료되었습니다. 다음 단계는:

1. **UI 컴포넌트 개발**: `src/components/dashboard/` 구현
2. **API 라우트 구현**: `src/app/api/analyze/route.ts` OpenAI 연동
3. **대시보드 페이지**: `src/app/dashboard/page.tsx` 완성
4. **데이터 페칭 훅**: `src/hooks/use-sales-data.ts` 구현
5. **테스트 작성**: 주요 컴포넌트 단위 테스트
6. **배포**: Vercel 프로덕션 배포

---

## 부록: 트러블슈팅

### A.1 pnpm 설치 실패

```bash
# npm으로 재설치
npm install -g pnpm --force

# 또는 npx 사용
npx pnpm install
```

### A.2 Husky hooks 실행 안 됨

```bash
# hooks 실행 권한 부여
chmod +x .husky/pre-commit .husky/commit-msg

# Git hooks path 확인
git config core.hooksPath
```

### A.3 OpenAI API 연결 실패

```bash
# 환경 변수 확인
echo $OPENAI_API_KEY

# .env.local 파일 확인
cat .env.local

# API 키 유효성 확인 (curl)
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### A.4 Vercel 배포 실패

```bash
# Vercel 로그 확인
vercel logs

# 환경 변수 확인 (Vercel Dashboard)
# Settings -> Environment Variables

# 로컬 빌드 확인
pnpm build
```

---

**문서 버전**: 1.0
**최종 업데이트**: 2026-02-04
**작성자**: ZVZO Development Team
