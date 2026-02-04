# CI/CD 파이프라인 스펙

> **프로젝트**: zvzo-creator-insight
> **배포 플랫폼**: Vercel
> **CI/CD**: GitHub Actions
> **버전**: 1.0.0
> **작성일**: 2026-02-04

---

## 목차

1. [CI/CD 개요](#cicd-개요)
2. [워크플로우 1: ci.yml (PR 검증)](#워크플로우-1-ciyml-pr-검증)
3. [워크플로우 2: deploy-preview.yml (Preview 배포)](#워크플로우-2-deploy-previewyml-preview-배포)
4. [워크플로우 3: deploy-production.yml (프로덕션 배포)](#워크플로우-3-deploy-productionyml-프로덕션-배포)
5. [워크플로우 4: security.yml (보안 검사)](#워크플로우-4-securityyml-보안-검사)
6. [워크플로우 5: dependabot-auto-merge.yml (자동 머지)](#워크플로우-5-dependabot-auto-mergeyml-자동-머지)
7. [Vercel 설정](#vercel-설정)
8. [시크릿 & 환경 변수](#시크릿--환경-변수)
9. [브랜치 보호 규칙](#브랜치-보호-규칙)
10. [릴리즈 전략](#릴리즈-전략)
11. [트러블슈팅](#트러블슈팅)

---

## CI/CD 개요

### 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Repository                         │
│                   (zvzo-creator-insight)                      │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ├─── Pull Request 생성
                        │    ├─► ci.yml (lint, test, build)
                        │    └─► deploy-preview.yml (Vercel Preview)
                        │
                        ├─── Merge to main
                        │    └─► deploy-production.yml (Vercel Production)
                        │
                        ├─── Weekly Schedule
                        │    └─► security.yml (CodeQL, npm audit)
                        │
                        └─── Dependabot PR
                             └─► dependabot-auto-merge.yml
```

### 핵심 기술 스택

| 구분 | 기술 |
|------|------|
| **CI/CD 플랫폼** | GitHub Actions |
| **배포 플랫폼** | Vercel |
| **패키지 매니저** | pnpm 9.x |
| **Node.js 버전** | 20.x LTS |
| **프레임워크** | Next.js 15.x (App Router) |
| **타입 체크** | TypeScript 5.x |
| **린팅** | ESLint + Prettier |
| **테스팅** | Vitest + React Testing Library |
| **보안 스캔** | CodeQL + npm audit |

### 파이프라인 플로우

#### PR 생성 시

```
1. Developer creates PR → main
2. GitHub Actions triggers:
   ├─ ci.yml (parallel jobs)
   │  ├─ lint (ESLint + Prettier)
   │  ├─ typecheck (tsc --noEmit)
   │  ├─ test (Vitest with coverage)
   │  └─ build (next build)
   └─ deploy-preview.yml
      ├─ Vercel Preview 배포
      └─ PR에 preview URL 코멘트
```

#### PR 머지 시 (main)

```
1. PR merged to main
2. GitHub Actions triggers:
   └─ deploy-production.yml
      ├─ Vercel Production 배포
      ├─ Semantic version 계산
      └─ GitHub Release 생성
```

#### 주간 보안 스캔

```
1. Every Monday 00:00 UTC
2. GitHub Actions triggers:
   └─ security.yml
      ├─ CodeQL 분석
      └─ npm audit
```

### Conventional Commits & Semantic Versioning

#### Commit Message 규칙

```bash
<type>(<scope>): <subject>

# Types
feat:     새로운 기능 추가 (MINOR 버전 증가)
fix:      버그 수정 (PATCH 버전 증가)
docs:     문서 변경 (버전 변경 없음)
style:    코드 포맷팅 (버전 변경 없음)
refactor: 리팩토링 (PATCH 버전 증가)
perf:     성능 개선 (PATCH 버전 증가)
test:     테스트 추가/수정 (버전 변경 없음)
chore:    빌드/도구 변경 (버전 변경 없음)
ci:       CI 설정 변경 (버전 변경 없음)

# Breaking Changes (MAJOR 버전 증가)
feat!: breaking change
fix!: breaking change
BREAKING CHANGE: in commit body
```

#### 버전 증가 규칙

| Commit Type | 버전 증가 | 예시 |
|-------------|-----------|------|
| `feat:` | MINOR (0.1.0 → 0.2.0) | feat: add AI analysis |
| `fix:` | PATCH (0.1.0 → 0.1.1) | fix: resolve auth error |
| `feat!:` 또는 `BREAKING CHANGE:` | MAJOR (0.1.0 → 1.0.0) | feat!: redesign API |
| `docs:`, `style:`, `test:` | 버전 변경 없음 | docs: update README |

---

## 워크플로우 1: ci.yml (PR 검증)

### 목적

Pull Request 생성 시 자동으로 코드 품질 검증을 수행하여 main 브랜치의 안정성을 보장합니다.

### Trigger 조건

- Pull Request가 `main` 브랜치로 생성되거나 업데이트될 때
- PR에 새로운 commit이 push될 때

### Jobs 구성

```
ci.yml
├── lint (ESLint + Prettier)
├── typecheck (TypeScript)
├── test (Vitest + Coverage)
└── build (Next.js Production Build)

모든 Job은 병렬로 실행되며, 하나라도 실패 시 PR 머지 불가
```

### 전체 워크플로우 파일

**파일 경로**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches:
      - main
    types:
      - opened
      - synchronize
      - reopened

# PR 단위로 동시 실행 취소 (최신 commit만 실행)
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  # Job 1: ESLint + Prettier 검사
  lint:
    name: Lint
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Check code formatting (Prettier)
        run: pnpm format:check

      - name: Lint commit messages
        if: github.event_name == 'pull_request'
        run: |
          pnpm dlx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --verbose

  # Job 2: TypeScript 타입 체크
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run TypeScript compiler
        run: pnpm typecheck

  # Job 3: 단위 테스트 + 커버리지
  test:
    name: Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests with coverage
        run: pnpm test -- --coverage --reporter=verbose

      - name: Upload coverage reports to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false

      - name: Upload coverage artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  # Job 4: Next.js 프로덕션 빌드
  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Cache Next.js build
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            ${{ github.workspace }}/.next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('**/pnpm-lock.yaml') }}-

      - name: Build Next.js app
        run: pnpm build
        env:
          # 빌드 시 환경 변수 (민감 정보 제외)
          NEXT_PUBLIC_APP_NAME: zvzo-creator-insight
          NODE_ENV: production

      - name: Check build output
        run: |
          if [ ! -d ".next" ]; then
            echo "Error: .next directory not found"
            exit 1
          fi
          echo "Build successful!"

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: nextjs-build
          path: .next/
          retention-days: 1
```

### Job 상세 설명

#### 1. lint

**목적**: 코드 스타일과 컨벤션 준수 확인

- **ESLint**: JavaScript/TypeScript 코드 품질 검사
- **Prettier**: 코드 포맷팅 일관성 검사
- **commitlint**: Conventional Commits 규칙 검증

**실행 명령어**:
```bash
pnpm lint                # ESLint 검사
pnpm format:check        # Prettier 검사
pnpm dlx commitlint ...  # Commit 메시지 검증
```

**실패 조건**:
- ESLint 에러 발견 (warning은 허용 가능)
- Prettier 포맷팅 불일치
- Commit 메시지가 Conventional Commits 규칙 위반

#### 2. typecheck

**목적**: TypeScript 타입 안정성 검증

- **tsc --noEmit**: 타입 에러만 체크, 빌드 파일은 생성하지 않음
- 모든 `.ts`, `.tsx` 파일에 대해 타입 검사

**실행 명령어**:
```bash
pnpm typecheck  # tsc --noEmit
```

**실패 조건**:
- TypeScript 컴파일 에러 발견
- 타입 정의 누락
- 잘못된 타입 사용

#### 3. test

**목적**: 단위 테스트 실행 및 커버리지 측정

- **Vitest**: 테스트 실행
- **Coverage**: 코드 커버리지 측정 (Istanbul)
- **Codecov**: 커버리지 리포트 업로드

**실행 명령어**:
```bash
pnpm test -- --coverage --reporter=verbose
```

**커버리지 기준**:
- Statements: 80% 이상
- Branches: 75% 이상
- Functions: 80% 이상
- Lines: 80% 이상

**Artifact 업로드**:
- `coverage/`: HTML 커버리지 리포트
- 보관 기간: 7일

**실패 조건**:
- 테스트 케이스 실패
- 커버리지 기준 미달 (warning, 실패는 아님)

#### 4. build

**목적**: Next.js 프로덕션 빌드 검증

- **next build**: 프로덕션 최적화 빌드
- **.next/cache**: 빌드 캐시 저장 (재사용)
- **Build output 검증**: .next 디렉토리 생성 확인

**실행 명령어**:
```bash
pnpm build  # next build
```

**캐싱 전략**:
```yaml
cache-key: OS + pnpm-lock.yaml + source files
restore-keys: OS + pnpm-lock.yaml
```

**Artifact 업로드**:
- `.next/`: 빌드 결과물
- 보관 기간: 1일

**실패 조건**:
- 빌드 에러 발생
- .next 디렉토리 생성 실패
- 환경 변수 누락으로 인한 런타임 에러

### 성능 최적화

#### 병렬 실행

모든 Job은 독립적으로 병렬 실행되어 전체 CI 시간을 단축합니다.

```
총 실행 시간 = max(lint, typecheck, test, build)
예상 시간: 약 5-8분
```

#### 캐싱 전략

| 캐시 대상 | 키 | 효과 |
|-----------|-----|------|
| pnpm store | OS + pnpm-lock.yaml | 의존성 설치 시간 80% 단축 |
| .next/cache | OS + lock + source | 빌드 시간 50% 단축 |

#### Concurrency 설정

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

동일 PR에 새로운 commit이 push되면 이전 CI 실행을 취소하여 리소스를 절약합니다.

### 필수 스크립트 (package.json)

```json
{
  "scripts": {
    "lint": "next lint",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "build": "next build"
  }
}
```

---

## 워크플로우 2: deploy-preview.yml (Preview 배포)

### 목적

Pull Request 생성 시 Vercel Preview 환경에 자동 배포하여 변경 사항을 미리 확인할 수 있도록 합니다.

### Trigger 조건

- Pull Request가 `main` 브랜치로 생성되거나 업데이트될 때
- `ci.yml` 워크플로우가 성공적으로 완료된 후 실행

### 주요 기능

1. **Vercel Preview 배포**: PR별 고유 URL 생성
2. **PR 코멘트**: Preview URL을 PR에 자동으로 코멘트
3. **Lighthouse CI**: 성능 점수 측정 (선택적)
4. **환경 변수**: Preview 전용 환경 변수 사용

### 전체 워크플로우 파일

**파일 경로**: `.github/workflows/deploy-preview.yml`

```yaml
name: Deploy Preview

on:
  pull_request:
    branches:
      - main
    types:
      - opened
      - synchronize
      - reopened

# PR 단위로 동시 실행 취소
concurrency:
  group: preview-${{ github.ref }}
  cancel-in-progress: true

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy-preview:
    name: Deploy to Vercel Preview
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install Vercel CLI
        run: pnpm add -g vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
        env:
          # Preview 환경 변수
          NEXT_PUBLIC_APP_NAME: zvzo-creator-insight
          NEXT_PUBLIC_ENV: preview
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY_PREVIEW }}

      - name: Deploy to Vercel Preview
        id: deploy
        run: |
          PREVIEW_URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }} 2>&1 | grep -oP 'https://[^\s]+')
          echo "preview_url=$PREVIEW_URL" >> $GITHUB_OUTPUT
          echo "Deployed to: $PREVIEW_URL"

      - name: Comment PR with Preview URL
        uses: actions/github-script@v7
        if: success()
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const previewUrl = '${{ steps.deploy.outputs.preview_url }}';
            const commentBody = `
            ## 🚀 Preview Deployment

            ✅ Preview deployed successfully!

            **Preview URL**: ${previewUrl}

            ### Quick Links
            - 🔗 [Open Preview](${previewUrl})
            - 📊 [Vercel Dashboard](https://vercel.com/dashboard)

            ### Environment
            - **Commit**: \`${{ github.event.pull_request.head.sha }}\`
            - **Branch**: \`${{ github.head_ref }}\`
            - **Environment**: Preview

            ---
            *Deployed with ❤️ by GitHub Actions*
            `;

            // 기존 코멘트 찾기
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const botComment = comments.find(comment =>
              comment.user.type === 'Bot' &&
              comment.body.includes('Preview Deployment')
            );

            if (botComment) {
              // 기존 코멘트 업데이트
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: commentBody
              });
            } else {
              // 새 코멘트 생성
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: commentBody
              });
            }

      - name: Comment PR on Failure
        uses: actions/github-script@v7
        if: failure()
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const commentBody = `
            ## ❌ Preview Deployment Failed

            Preview 배포에 실패했습니다.

            ### Troubleshooting
            - [GitHub Actions 로그 확인](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})
            - [Vercel Dashboard 확인](https://vercel.com/dashboard)

            **Commit**: \`${{ github.event.pull_request.head.sha }}\`
            **Branch**: \`${{ github.head_ref }}\`
            `;

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: commentBody
            });

  # (선택적) Lighthouse CI로 성능 측정
  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    needs: deploy-preview
    timeout-minutes: 10
    if: success()

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Lighthouse CI
        run: npm install -g @lhci/cli@0.13.x

      - name: Run Lighthouse CI
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
        run: |
          lhci autorun --config=.lighthouserc.js
        continue-on-error: true

      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-results
          path: .lighthouseci/
          retention-days: 7
```

### Preview URL 코멘트 예시

PR에 자동으로 생성되는 코멘트:

```markdown
## 🚀 Preview Deployment

✅ Preview deployed successfully!

**Preview URL**: https://zvzo-creator-insight-abc123.vercel.app

### Quick Links
- 🔗 [Open Preview](https://zvzo-creator-insight-abc123.vercel.app)
- 📊 [Vercel Dashboard](https://vercel.com/dashboard)

### Environment
- **Commit**: `a1b2c3d4`
- **Branch**: `feature/add-analysis`
- **Environment**: Preview

---
*Deployed with ❤️ by GitHub Actions*
```

### Lighthouse CI 설정 (선택적)

성능 점수를 측정하려면 `.lighthouserc.js` 파일을 생성합니다.

**파일 경로**: `.lighthouserc.js`

```javascript
module.exports = {
  ci: {
    collect: {
      url: [process.env.PREVIEW_URL || 'http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### 환경 변수 분리

Preview와 Production 환경에서 서로 다른 API 키를 사용할 수 있습니다.

| 환경 변수 | Preview | Production |
|-----------|---------|------------|
| `OPENAI_API_KEY` | `OPENAI_API_KEY_PREVIEW` | `OPENAI_API_KEY` |
| `NEXT_PUBLIC_ENV` | `preview` | `production` |
| `DATABASE_URL` | Preview DB | Production DB |

---

## 워크플로우 3: deploy-production.yml (프로덕션 배포)

### 목적

PR이 `main` 브랜치에 머지되면 자동으로 Vercel Production 환경에 배포하고 GitHub Release를 생성합니다.

### Trigger 조건

- `main` 브랜치에 push 이벤트 발생 (PR merge 시)
- 모든 CI 검증이 완료된 상태

### 주요 기능

1. **Vercel Production 배포**: 프로덕션 환경에 배포
2. **Semantic Versioning**: Conventional Commits 기반 버전 자동 계산
3. **GitHub Release 생성**: 릴리즈 노트 자동 생성
4. **Git Tag 생성**: 버전 태그 생성

### 전체 워크플로우 파일

**파일 경로**: `.github/workflows/deploy-production.yml`

```yaml
name: Deploy Production

on:
  push:
    branches:
      - main

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # Job 1: Semantic 버전 계산
  version:
    name: Calculate Version
    runs-on: ubuntu-latest
    outputs:
      new_version: ${{ steps.semantic.outputs.new_release_version }}
      new_release_published: ${{ steps.semantic.outputs.new_release_published }}
      release_notes: ${{ steps.semantic.outputs.new_release_notes }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Semantic Release
        id: semantic
        uses: cycjimmy/semantic-release-action@v4
        with:
          semantic_version: 23
          extra_plugins: |
            @semantic-release/changelog
            @semantic-release/git
          dry_run: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Output version info
        run: |
          echo "New version: ${{ steps.semantic.outputs.new_release_version }}"
          echo "Release published: ${{ steps.semantic.outputs.new_release_published }}"

  # Job 2: Vercel Production 배포
  deploy-production:
    name: Deploy to Vercel Production
    runs-on: ubuntu-latest
    needs: version
    timeout-minutes: 20
    if: needs.version.outputs.new_release_published == 'true'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install Vercel CLI
        run: pnpm add -g vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          # Production 환경 변수
          NEXT_PUBLIC_APP_NAME: zvzo-creator-insight
          NEXT_PUBLIC_ENV: production
          NEXT_PUBLIC_VERSION: ${{ needs.version.outputs.new_version }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Deploy to Vercel Production
        id: deploy
        run: |
          PRODUCTION_URL=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }} 2>&1 | grep -oP 'https://[^\s]+' | tail -1)
          echo "production_url=$PRODUCTION_URL" >> $GITHUB_OUTPUT
          echo "Deployed to: $PRODUCTION_URL"

      - name: Deployment Summary
        run: |
          echo "## 🚀 Production Deployment" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "✅ **Version**: ${{ needs.version.outputs.new_version }}" >> $GITHUB_STEP_SUMMARY
          echo "🔗 **URL**: ${{ steps.deploy.outputs.production_url }}" >> $GITHUB_STEP_SUMMARY
          echo "📦 **Commit**: ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "---" >> $GITHUB_STEP_SUMMARY
          echo "*Deployed at $(date -u '+%Y-%m-%d %H:%M:%S UTC')*" >> $GITHUB_STEP_SUMMARY

  # Job 3: GitHub Release 생성
  release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    needs: [version, deploy-production]
    if: needs.version.outputs.new_release_published == 'true'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Semantic Release
        run: |
          npm install -g semantic-release@23 \
            @semantic-release/changelog \
            @semantic-release/git \
            @semantic-release/github

      - name: Create Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release

      - name: Create Git Tag
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git tag -a "v${{ needs.version.outputs.new_version }}" -m "Release v${{ needs.version.outputs.new_version }}"
          git push origin "v${{ needs.version.outputs.new_version }}"

  # Job 4: 슬랙/디스코드 알림 (선택적)
  notify:
    name: Send Notification
    runs-on: ubuntu-latest
    needs: [version, deploy-production, release]
    if: always() && needs.version.outputs.new_release_published == 'true'

    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1.26.0
        if: success()
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        with:
          payload: |
            {
              "text": "🚀 Production Deployment Successful",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*zvzo-creator-insight* deployed to production!\n\n*Version*: `v${{ needs.version.outputs.new_version }}`\n*URL*: https://zvzo.com"
                  }
                }
              ]
            }

      - name: Send failure notification
        uses: slackapi/slack-github-action@v1.26.0
        if: failure()
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        with:
          payload: |
            {
              "text": "❌ Production Deployment Failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*zvzo-creator-insight* deployment failed!\n\n*Check logs*: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                  }
                }
              ]
            }
```

### Semantic Release 설정

Semantic versioning을 자동으로 계산하려면 `.releaserc.json` 파일을 생성합니다.

**파일 경로**: `.releaserc.json`

```json
{
  "branches": ["main"],
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "preset": "conventionalcommits",
        "releaseRules": [
          { "type": "feat", "release": "minor" },
          { "type": "fix", "release": "patch" },
          { "type": "perf", "release": "patch" },
          { "type": "refactor", "release": "patch" },
          { "type": "docs", "release": false },
          { "type": "style", "release": false },
          { "type": "test", "release": false },
          { "type": "chore", "release": false },
          { "type": "ci", "release": false },
          { "breaking": true, "release": "major" }
        ]
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "preset": "conventionalcommits",
        "presetConfig": {
          "types": [
            { "type": "feat", "section": "✨ Features" },
            { "type": "fix", "section": "🐛 Bug Fixes" },
            { "type": "perf", "section": "⚡ Performance" },
            { "type": "refactor", "section": "♻️ Refactoring" },
            { "type": "docs", "section": "📝 Documentation", "hidden": false },
            { "type": "style", "hidden": true },
            { "type": "test", "hidden": true },
            { "type": "chore", "hidden": true },
            { "type": "ci", "hidden": true }
          ]
        }
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md",
        "changelogTitle": "# Changelog\n\nAll notable changes to this project will be documented in this file."
      }
    ],
    [
      "@semantic-release/github",
      {
        "assets": [
          { "path": "CHANGELOG.md", "label": "Changelog" }
        ]
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

### 버전 계산 예시

#### Commit History

```bash
feat: add AI analysis feature
fix: resolve authentication error
docs: update README
feat!: redesign API endpoints (BREAKING CHANGE)
```

#### 버전 변화

| Commit | 이전 버전 | 새 버전 | 이유 |
|--------|-----------|---------|------|
| `feat: add AI analysis` | 1.0.0 | 1.1.0 | MINOR (new feature) |
| `fix: resolve auth error` | 1.1.0 | 1.1.1 | PATCH (bug fix) |
| `docs: update README` | 1.1.1 | 1.1.1 | 변경 없음 |
| `feat!: redesign API` | 1.1.1 | 2.0.0 | MAJOR (breaking change) |

### GitHub Release 노트 예시

Semantic Release가 자동으로 생성하는 Release Notes:

```markdown
## [2.0.0](https://github.com/org/zvzo-creator-insight/compare/v1.1.1...v2.0.0) (2026-02-04)

### ⚠ BREAKING CHANGES

* redesign API endpoints

### ✨ Features

* add AI analysis feature ([a1b2c3d](https://github.com/org/zvzo-creator-insight/commit/a1b2c3d))
* redesign API endpoints ([e4f5g6h](https://github.com/org/zvzo-creator-insight/commit/e4f5g6h))

### 🐛 Bug Fixes

* resolve authentication error ([i7j8k9l](https://github.com/org/zvzo-creator-insight/commit/i7j8k9l))

### 📝 Documentation

* update README ([m0n1o2p](https://github.com/org/zvzo-creator-insight/commit/m0n1o2p))
```

---

## 워크플로우 4: security.yml (보안 검사)

### 목적

주기적으로 코드베이스와 의존성을 스캔하여 보안 취약점을 조기에 발견합니다.

### Trigger 조건

- **Schedule**: 매주 월요일 00:00 UTC
- **Pull Request**: PR 생성 시 (선택적)
- **Manual**: GitHub Actions UI에서 수동 실행 가능

### 주요 기능

1. **CodeQL 분석**: JavaScript/TypeScript 코드 보안 스캔
2. **npm audit**: 의존성 취약점 검사
3. **SARIF 업로드**: GitHub Security 탭에 결과 업로드

### 전체 워크플로우 파일

**파일 경로**: `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  # 매주 월요일 00:00 UTC 실행
  schedule:
    - cron: '0 0 * * 1'

  # PR 생성 시 실행 (선택적)
  pull_request:
    branches:
      - main

  # 수동 실행 가능
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  # Job 1: CodeQL 분석
  codeql-analysis:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    timeout-minutes: 30

    permissions:
      # CodeQL이 Security 탭에 결과를 업로드하려면 필요
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript']

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: security-extended,security-and-quality

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"

  # Job 2: npm audit (의존성 취약점 검사)
  npm-audit:
    name: npm Audit
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run npm audit
        run: pnpm audit --audit-level=moderate
        continue-on-error: true

      - name: Run pnpm audit with detailed report
        run: |
          pnpm audit --json > audit-report.json || true
          echo "## npm Audit Report" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          if [ -s audit-report.json ]; then
            echo "⚠️ Vulnerabilities found. Please review the report." >> $GITHUB_STEP_SUMMARY
          else
            echo "✅ No vulnerabilities found." >> $GITHUB_STEP_SUMMARY
          fi

      - name: Upload audit report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: npm-audit-report
          path: audit-report.json
          retention-days: 30

  # Job 3: OWASP Dependency Check (선택적, 실행 시간 김)
  dependency-check:
    name: OWASP Dependency Check
    runs-on: ubuntu-latest
    timeout-minutes: 30
    if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run OWASP Dependency-Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'zvzo-creator-insight'
          path: '.'
          format: 'HTML'
          args: >
            --enableRetired
            --enableExperimental

      - name: Upload Dependency-Check report
        uses: actions/upload-artifact@v4
        with:
          name: dependency-check-report
          path: dependency-check-report.html
          retention-days: 30

  # Job 4: Secret Scanning (Git history)
  secret-scan:
    name: Secret Scanning
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install gitleaks
        run: |
          wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_linux_x64.tar.gz
          tar -xzf gitleaks_8.18.2_linux_x64.tar.gz
          sudo mv gitleaks /usr/local/bin/

      - name: Run gitleaks
        run: |
          gitleaks detect --source . --verbose --report-path gitleaks-report.json --exit-code 0

      - name: Upload gitleaks report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: gitleaks-report
          path: gitleaks-report.json
          retention-days: 30

      - name: Check for secrets
        run: |
          if [ -s gitleaks-report.json ]; then
            echo "⚠️ Secrets detected in Git history!" >> $GITHUB_STEP_SUMMARY
            echo "Please review the gitleaks report artifact." >> $GITHUB_STEP_SUMMARY
          else
            echo "✅ No secrets detected." >> $GITHUB_STEP_SUMMARY
          fi

  # Job 5: 보안 리포트 통합
  security-summary:
    name: Security Summary
    runs-on: ubuntu-latest
    needs: [codeql-analysis, npm-audit, secret-scan]
    if: always()

    steps:
      - name: Generate Security Summary
        run: |
          echo "# 🔒 Security Scan Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Date**: $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY

          echo "## Results" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Check | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-------|--------|" >> $GITHUB_STEP_SUMMARY

          if [ "${{ needs.codeql-analysis.result }}" == "success" ]; then
            echo "| CodeQL Analysis | ✅ Passed |" >> $GITHUB_STEP_SUMMARY
          else
            echo "| CodeQL Analysis | ❌ Failed |" >> $GITHUB_STEP_SUMMARY
          fi

          if [ "${{ needs.npm-audit.result }}" == "success" ]; then
            echo "| npm Audit | ✅ Passed |" >> $GITHUB_STEP_SUMMARY
          else
            echo "| npm Audit | ⚠️ Issues Found |" >> $GITHUB_STEP_SUMMARY
          fi

          if [ "${{ needs.secret-scan.result }}" == "success" ]; then
            echo "| Secret Scanning | ✅ Passed |" >> $GITHUB_STEP_SUMMARY
          else
            echo "| Secret Scanning | ⚠️ Secrets Found |" >> $GITHUB_STEP_SUMMARY
          fi

          echo "" >> $GITHUB_STEP_SUMMARY
          echo "---" >> $GITHUB_STEP_SUMMARY
          echo "*Next scan: Next Monday 00:00 UTC*" >> $GITHUB_STEP_SUMMARY
```

### CodeQL 분석 상세

#### 분석 대상

- **Languages**: JavaScript, TypeScript
- **Query Suites**:
  - `security-extended`: 확장된 보안 쿼리
  - `security-and-quality`: 보안 + 코드 품질

#### 탐지 항목

- SQL Injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Insecure Randomness
- Hard-coded Credentials
- Path Traversal
- Command Injection
- Open Redirect
- Information Exposure

#### 결과 확인

GitHub Security 탭에서 확인:
```
Repository → Security → Code scanning alerts
```

### npm audit 상세

#### Audit Level

```yaml
--audit-level=moderate
```

| Level | 설명 |
|-------|------|
| `low` | 낮은 심각도까지 포함 (너무 많은 false positive) |
| `moderate` | 중간 심각도 이상 (권장) |
| `high` | 높은 심각도 이상 |
| `critical` | 치명적인 취약점만 |

#### 취약점 수정

```bash
# 자동 수정 가능한 취약점 패치
pnpm audit fix

# 메이저 버전 업그레이드 필요한 경우
pnpm audit fix --force
```

### Secret Scanning (gitleaks)

#### 탐지 대상

- API Keys (OpenAI, AWS, etc.)
- Database Credentials
- JWT Tokens
- Private Keys (RSA, SSH)
- Generic Secrets (password=...)

#### False Positive 처리

`.gitleaksignore` 파일로 무시할 패턴 지정:

```
# .gitleaksignore
# 테스트용 더미 키
test/fixtures/dummy-api-key.txt

# 공개 문서
docs/examples/sample-config.md
```

### 보안 스캔 결과 예시

GitHub Actions Summary:

```markdown
# 🔒 Security Scan Summary

**Date**: 2026-02-04 00:00:00 UTC

## Results

| Check | Status |
|-------|--------|
| CodeQL Analysis | ✅ Passed |
| npm Audit | ⚠️ Issues Found |
| Secret Scanning | ✅ Passed |

---
*Next scan: Next Monday 00:00 UTC*
```

---

## 워크플로우 5: dependabot-auto-merge.yml (자동 머지)

### 목적

Dependabot이 생성한 PR 중 안전한 업데이트(minor/patch)를 자동으로 머지하여 유지보수 부담을 줄입니다.

### Trigger 조건

- Dependabot PR이 생성되거나 업데이트될 때
- CI가 성공적으로 완료된 경우에만 실행

### 자동 머지 조건

| 업데이트 타입 | 자동 머지 | 이유 |
|--------------|----------|------|
| `patch` (1.0.0 → 1.0.1) | ✅ Yes | 버그 수정, 안전 |
| `minor` (1.0.0 → 1.1.0) | ✅ Yes | 하위 호환성 유지 |
| `major` (1.0.0 → 2.0.0) | ❌ No | Breaking changes 가능 |

### 전체 워크플로우 파일

**파일 경로**: `.github/workflows/dependabot-auto-merge.yml`

```yaml
name: Dependabot Auto-Merge

on:
  pull_request:
    types:
      - opened
      - synchronize
      - reopened

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    name: Auto-merge Dependabot PR
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    timeout-minutes: 10

    steps:
      - name: Fetch Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Check update type
        id: check
        run: |
          UPDATE_TYPE="${{ steps.metadata.outputs.update-type }}"
          echo "update_type=$UPDATE_TYPE" >> $GITHUB_OUTPUT

          if [ "$UPDATE_TYPE" == "version-update:semver-patch" ] || [ "$UPDATE_TYPE" == "version-update:semver-minor" ]; then
            echo "auto_merge=true" >> $GITHUB_OUTPUT
            echo "✅ Auto-merge allowed for $UPDATE_TYPE"
          else
            echo "auto_merge=false" >> $GITHUB_OUTPUT
            echo "❌ Auto-merge NOT allowed for $UPDATE_TYPE (manual review required)"
          fi

      - name: Wait for CI to complete
        if: steps.check.outputs.auto_merge == 'true'
        uses: lewagon/wait-on-check-action@v1.3.4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          check-name: 'ci'
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          wait-interval: 10
          allowed-conclusions: success

      - name: Approve PR
        if: steps.check.outputs.auto_merge == 'true'
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            await github.rest.pulls.createReview({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              event: 'APPROVE',
              body: '✅ Auto-approved by GitHub Actions (Dependabot auto-merge)'
            });

      - name: Enable auto-merge
        if: steps.check.outputs.auto_merge == 'true'
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const pr = context.payload.pull_request;
            await github.rest.pulls.merge({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: pr.number,
              merge_method: 'squash',
              commit_title: `${pr.title} (#${pr.number})`,
              commit_message: 'Auto-merged by Dependabot auto-merge workflow'
            });
            console.log('✅ PR auto-merged successfully');

      - name: Comment on major update
        if: steps.check.outputs.auto_merge == 'false'
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const updateType = '${{ steps.metadata.outputs.update-type }}';
            const packageName = '${{ steps.metadata.outputs.dependency-names }}';

            const commentBody = `
            ## ⚠️ Manual Review Required

            This is a **${updateType}** update for \`${packageName}\`.

            Major version updates may contain **breaking changes** and require manual review.

            ### Next Steps
            1. 📖 Review the [changelog](https://github.com/${packageName}/releases)
            2. ✅ Test the changes locally
            3. 🚀 Merge manually if safe

            ---
            *Dependabot auto-merge only handles patch and minor updates.*
            `;

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: commentBody
            });
```

### Dependabot 설정

**파일 경로**: `.github/dependabot.yml`

```yaml
version: 2

updates:
  # npm 의존성 업데이트
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Seoul"
    open-pull-requests-limit: 10
    reviewers:
      - "your-github-username"
    assignees:
      - "your-github-username"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore(deps)"
      include: "scope"
    # 버전 전략
    versioning-strategy: auto
    # 그룹화 (선택적)
    groups:
      production-dependencies:
        dependency-type: "production"
        update-types:
          - "minor"
          - "patch"
      development-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"

  # GitHub Actions 업데이트
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    labels:
      - "dependencies"
      - "github-actions"
    commit-message:
      prefix: "chore(ci)"
```

### 자동 머지 플로우

```
Dependabot creates PR
       │
       ▼
Check update type
       │
       ├─► patch/minor ──────► Wait for CI ──► Approve ──► Merge
       │
       └─► major ──────────────► Comment "Manual review required"
```

### 안전장치

1. **CI 통과 필수**: 모든 CI 검증이 성공해야 머지
2. **Major 업데이트 제외**: Breaking changes 가능성 있는 업데이트는 수동 리뷰
3. **Squash Merge**: 커밋 히스토리를 깔끔하게 유지
4. **자동 승인 로그**: 누가 언제 승인했는지 기록

### Dependabot PR 예시

#### Patch 업데이트 (자동 머지)

```
Title: chore(deps): bump @types/node from 20.10.0 to 20.10.1

✅ Auto-approved by GitHub Actions (Dependabot auto-merge)
✅ Auto-merged
```

#### Major 업데이트 (수동 리뷰)

```
Title: chore(deps): bump next from 14.0.0 to 15.0.0

## ⚠️ Manual Review Required

This is a **version-update:semver-major** update for `next`.

Major version updates may contain **breaking changes** and require manual review.

### Next Steps
1. 📖 Review the changelog
2. ✅ Test the changes locally
3. 🚀 Merge manually if safe
```

---

## Vercel 설정

### vercel.json 전체 내용

**파일 경로**: `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_NAME": "zvzo-creator-insight",
      "NODE_ENV": "production"
    }
  },
  "env": {
    "OPENAI_API_KEY": "@openai-api-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "crons": [],
  "regions": ["icn1"],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "trailingSlash": false,
  "cleanUrls": true,
  "github": {
    "enabled": true,
    "silent": false,
    "autoAlias": true
  }
}
```

### 주요 설정 항목 설명

#### 빌드 설정

| 필드 | 값 | 설명 |
|------|-----|------|
| `buildCommand` | `pnpm build` | 프로덕션 빌드 명령어 |
| `devCommand` | `pnpm dev` | 로컬 개발 서버 명령어 |
| `installCommand` | `pnpm install --frozen-lockfile` | 의존성 설치 (lock 파일 고정) |
| `framework` | `nextjs` | Next.js 프레임워크 감지 |
| `outputDirectory` | `.next` | 빌드 결과물 디렉토리 |

#### 보안 헤더

| 헤더 | 값 | 목적 |
|------|-----|------|
| `X-Content-Type-Options` | `nosniff` | MIME 타입 스니핑 방지 |
| `X-Frame-Options` | `DENY` | Clickjacking 방지 |
| `X-XSS-Protection` | `1; mode=block` | XSS 공격 방지 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer 정보 제한 |
| `Permissions-Policy` | `camera=(), microphone=()` | 민감한 API 접근 차단 |

#### 리전 설정

```json
"regions": ["icn1"]
```

| 리전 코드 | 위치 | 설명 |
|----------|------|------|
| `icn1` | Seoul, South Korea | 한국 사용자 대상 (최적) |
| `hnd1` | Tokyo, Japan | 일본 사용자 대상 |
| `sin1` | Singapore | 동남아시아 사용자 대상 |
| `sfo1` | San Francisco, USA | 미국 서부 사용자 대상 |

#### 함수 설정

```json
"functions": {
  "api/**/*.ts": {
    "memory": 1024,
    "maxDuration": 10
  }
}
```

| 필드 | 값 | 설명 |
|------|-----|------|
| `memory` | `1024` MB | Serverless 함수 메모리 (512/1024/3008) |
| `maxDuration` | `10` 초 | 함수 최대 실행 시간 (Hobby: 10s, Pro: 60s) |

### 환경 변수 설정

#### Vercel Dashboard에서 설정

```
Project Settings → Environment Variables
```

| 변수명 | 환경 | 값 | 설명 |
|--------|------|-----|------|
| `OPENAI_API_KEY` | Production | `sk-proj-...` | OpenAI API 키 (프로덕션) |
| `OPENAI_API_KEY` | Preview | `sk-proj-...` | OpenAI API 키 (프리뷰) |
| `NEXT_PUBLIC_APP_NAME` | All | `zvzo-creator-insight` | 앱 이름 (공개) |
| `NEXT_PUBLIC_ENV` | Production | `production` | 환경 구분 (공개) |
| `NEXT_PUBLIC_ENV` | Preview | `preview` | 환경 구분 (공개) |
| `DATABASE_URL` | Production | `postgresql://...` | DB 연결 문자열 (프로덕션) |
| `DATABASE_URL` | Preview | `postgresql://...` | DB 연결 문자열 (프리뷰) |

#### 환경 변수 타입

| Prefix | 공개 여부 | 사용처 | 예시 |
|--------|-----------|--------|------|
| `NEXT_PUBLIC_*` | ✅ 공개 (클라이언트) | 브라우저에서 접근 가능 | `NEXT_PUBLIC_API_URL` |
| `*` (일반) | ❌ 비공개 (서버) | 서버/API에서만 접근 | `OPENAI_API_KEY` |

#### CLI로 환경 변수 설정

```bash
# Production 환경
vercel env add OPENAI_API_KEY production

# Preview 환경
vercel env add OPENAI_API_KEY preview

# Development 환경 (로컬)
vercel env add OPENAI_API_KEY development

# 모든 환경
vercel env add NEXT_PUBLIC_APP_NAME
```

#### .env 파일 (로컬 개발)

**파일 경로**: `.env.local` (Git에 포함 X)

```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-your-local-api-key

# Public Variables
NEXT_PUBLIC_APP_NAME=zvzo-creator-insight
NEXT_PUBLIC_ENV=development

# Database (로컬)
DATABASE_URL=postgresql://localhost:5432/zvzo_dev
```

### Preview vs Production 환경 분리

| 구분 | Preview | Production |
|------|---------|------------|
| **URL** | `https://zvzo-pr-123.vercel.app` | `https://zvzo.com` |
| **Branch** | PR 브랜치 | `main` |
| **환경 변수** | Preview 전용 값 | Production 전용 값 |
| **데이터베이스** | Preview DB (격리) | Production DB |
| **외부 API** | 테스트 API 키 | 프로덕션 API 키 |
| **로깅** | 상세 로그 | 에러 로그만 |
| **Analytics** | 비활성화 또는 별도 트래킹 | 활성화 |

### Vercel 프로젝트 설정 체크리스트

#### General Settings

```
✅ Project Name: zvzo-creator-insight
✅ Framework Preset: Next.js
✅ Root Directory: ./
✅ Build Command: pnpm build
✅ Output Directory: .next
✅ Install Command: pnpm install --frozen-lockfile
```

#### Git Settings

```
✅ Production Branch: main
✅ Automatic Deployments: Enabled
✅ Preview Deployments: Enabled
✅ PR Comments: Enabled
```

#### Domains

```
✅ Production: zvzo.com
✅ Auto-assign Preview URLs: Enabled
```

#### Environment Variables

```
✅ OPENAI_API_KEY (Production, Preview 분리)
✅ NEXT_PUBLIC_APP_NAME
✅ NEXT_PUBLIC_ENV
✅ DATABASE_URL (Production, Preview 분리)
```

---

## 시크릿 & 환경 변수

### GitHub Secrets 목록

GitHub Repository Settings → Secrets and variables → Actions에서 설정:

| Secret 이름 | 값 | 사용처 | 설명 |
|-------------|-----|--------|------|
| `VERCEL_TOKEN` | `vercel-token-...` | deploy-*.yml | Vercel CLI 인증 토큰 |
| `VERCEL_ORG_ID` | `team_...` | deploy-*.yml | Vercel 조직 ID |
| `VERCEL_PROJECT_ID` | `prj_...` | deploy-*.yml | Vercel 프로젝트 ID |
| `OPENAI_API_KEY` | `sk-proj-...` | deploy-production.yml | OpenAI API 키 (프로덕션) |
| `OPENAI_API_KEY_PREVIEW` | `sk-proj-...` | deploy-preview.yml | OpenAI API 키 (프리뷰) |
| `CODECOV_TOKEN` | `codecov-token-...` | ci.yml | Codecov 업로드 토큰 |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | deploy-production.yml | 슬랙 알림 웹훅 (선택적) |
| `LHCI_GITHUB_APP_TOKEN` | `lhci-token-...` | deploy-preview.yml | Lighthouse CI 토큰 (선택적) |

### Secret 생성 방법

#### 1. VERCEL_TOKEN 생성

```bash
# Vercel CLI 설치
pnpm add -g vercel

# Vercel 로그인
vercel login

# 토큰 생성
vercel token create "GitHub Actions"
# 출력: vercel-token-abc123xyz...
```

GitHub에 추가:
```
Settings → Secrets → New repository secret
Name: VERCEL_TOKEN
Value: vercel-token-abc123xyz...
```

#### 2. VERCEL_ORG_ID 및 VERCEL_PROJECT_ID 확인

```bash
# 프로젝트 디렉토리에서 실행
vercel link

# .vercel/project.json 파일이 생성됨
cat .vercel/project.json
```

출력 예시:
```json
{
  "orgId": "team_abc123",
  "projectId": "prj_xyz789"
}
```

GitHub에 추가:
```
VERCEL_ORG_ID: team_abc123
VERCEL_PROJECT_ID: prj_xyz789
```

#### 3. OPENAI_API_KEY 생성

1. OpenAI Platform 로그인: https://platform.openai.com/
2. API Keys 메뉴로 이동
3. "Create new secret key" 클릭
4. 키 이름: `zvzo-production` 또는 `zvzo-preview`
5. 생성된 키 복사 (한 번만 표시됨!)

GitHub에 추가:
```
OPENAI_API_KEY: sk-proj-...
OPENAI_API_KEY_PREVIEW: sk-proj-...
```

#### 4. CODECOV_TOKEN 생성

1. Codecov 로그인: https://codecov.io/
2. Repository 추가
3. Settings → Upload Token 복사

GitHub에 추가:
```
CODECOV_TOKEN: codecov-token-...
```

#### 5. SLACK_WEBHOOK_URL 생성 (선택적)

1. Slack Workspace에서 Incoming Webhooks 앱 설치
2. 채널 선택
3. Webhook URL 복사

GitHub에 추가:
```
SLACK_WEBHOOK_URL: https://hooks.slack.com/services/T00/B00/XXX
```

### 환경 변수 vs Secret

| 구분 | 환경 변수 (Vercel) | Secret (GitHub) |
|------|-------------------|----------------|
| **저장 위치** | Vercel Dashboard | GitHub Repository Settings |
| **사용처** | Next.js 앱 런타임 | GitHub Actions 워크플로우 |
| **공개 여부** | 비공개 (서버) 또는 공개 (클라이언트) | 항상 비공개 |
| **접근 방법** | `process.env.VAR_NAME` | `${{ secrets.VAR_NAME }}` |
| **예시** | `OPENAI_API_KEY` (앱 실행 시) | `VERCEL_TOKEN` (배포 시) |

### 환경 변수 우선순위

```
1. Vercel Environment Variables (Vercel Dashboard)
2. .env.production.local (Git 제외, 프로덕션)
3. .env.local (Git 제외, 모든 환경)
4. .env.production (Git 포함 가능)
5. .env (Git 포함 가능)
```

### 안전한 환경 변수 관리

#### ✅ DO

- Secret은 항상 GitHub Secrets 또는 Vercel Environment Variables에 저장
- `.env.local` 파일은 `.gitignore`에 추가
- Production과 Preview 환경에서 서로 다른 키 사용
- 주기적으로 키 로테이션 (3-6개월마다)
- 최소 권한 원칙 적용 (필요한 권한만 부여)

#### ❌ DON'T

- Secret을 코드에 하드코딩하지 않기
- `.env` 파일을 Git에 커밋하지 않기
- Production API 키를 로컬 개발에 사용하지 않기
- Slack/Discord에 Secret을 공유하지 않기
- 브라우저 콘솔에 Secret 출력하지 않기

### .gitignore 설정

```bash
# Environment Variables
.env
.env.local
.env.*.local
.env.production.local
.env.development.local

# Vercel
.vercel
.vercel/project.json
```

---

## 브랜치 보호 규칙

### GitHub Branch Protection 설정

Repository Settings → Branches → Add rule (Branch name pattern: `main`)

#### 필수 설정

```yaml
✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Dismiss stale pull request approvals when new commits are pushed
   ✅ Require review from Code Owners (선택적)

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Required status checks:
      - lint
      - typecheck
      - test
      - build
      - deploy-preview / Deploy to Vercel Preview

✅ Require conversation resolution before merging

✅ Require signed commits (선택적)

✅ Require linear history (squash/rebase만 허용)

✅ Include administrators (관리자도 규칙 준수)

❌ Allow force pushes (절대 허용 안 함)

❌ Allow deletions (main 브랜치 삭제 방지)
```

### Required Status Checks 상세

CI 워크플로우와 연동하여 모든 검증이 통과해야만 머지 가능:

| Status Check | 워크플로우 | Job 이름 | 필수 여부 |
|--------------|-----------|----------|----------|
| `lint` | ci.yml | Lint | ✅ 필수 |
| `typecheck` | ci.yml | Type Check | ✅ 필수 |
| `test` | ci.yml | Test | ✅ 필수 |
| `build` | ci.yml | Build | ✅ 필수 |
| `deploy-preview` | deploy-preview.yml | Deploy to Vercel Preview | ✅ 필수 |
| `codeql-analysis` | security.yml | CodeQL Analysis | ⚠️ 권장 (optional) |

### 머지 전략

#### 1. Squash and Merge (권장)

```
모든 PR 커밋을 하나로 합쳐서 main에 머지
장점: 깔끔한 히스토리, Semantic Release와 호환
```

**설정**:
```
Repository Settings → General → Pull Requests
✅ Allow squash merging
   ✅ Default to pull request title and description
❌ Allow merge commits
❌ Allow rebase merging
```

**Squash 후 커밋 메시지 형식**:
```
feat: add AI analysis feature (#123)

- Implement GPT-4 integration
- Add analysis result visualization
- Update API documentation

Co-authored-by: Developer <dev@example.com>
```

#### 2. Merge Commit (비권장)

```
모든 PR 커밋을 그대로 유지하면서 머지
단점: 히스토리가 복잡해짐
```

#### 3. Rebase and Merge (선택적)

```
PR 커밋을 main 위에 rebase
장점: Linear history
단점: Semantic Release와 충돌 가능
```

### PR 머지 플로우

```
1. Developer creates PR → main
2. CI runs (lint, typecheck, test, build)
3. Preview deployment (Vercel)
4. Code review (1 approval required)
5. All status checks pass ✅
6. Squash and merge
7. Production deployment (Vercel)
8. Semantic Release (GitHub Release)
```

### PR 템플릿

**파일 경로**: `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## 변경 사항

<!-- 무엇을 변경했는지 간단히 설명해주세요 -->

## 변경 이유

<!-- 왜 이 변경이 필요한지 설명해주세요 -->

## 테스트 계획

<!-- 어떻게 테스트했는지 설명해주세요 -->

- [ ] 로컬에서 테스트 완료
- [ ] Unit tests 추가/업데이트
- [ ] Preview 환경에서 수동 테스트 완료

## 체크리스트

- [ ] Conventional Commits 규칙 준수 (`feat:`, `fix:`, etc.)
- [ ] TypeScript 에러 없음 (`pnpm typecheck`)
- [ ] ESLint 에러 없음 (`pnpm lint`)
- [ ] 테스트 통과 (`pnpm test`)
- [ ] 문서 업데이트 (필요 시)

## 스크린샷 (UI 변경 시)

<!-- 변경된 UI 스크린샷을 첨부해주세요 -->

## 관련 이슈

<!-- 관련된 이슈 번호를 적어주세요 -->
Closes #123
```

### Code Owners (선택적)

**파일 경로**: `.github/CODEOWNERS`

```
# 모든 파일에 대한 기본 리뷰어
*       @your-github-username

# API 코드는 백엔드 팀 리뷰 필요
/app/api/**  @backend-team

# CI/CD 설정은 데브옵스 팀 리뷰 필요
/.github/**  @devops-team

# 문서는 테크니컬 라이터 리뷰 필요
/docs/**     @tech-writers
```

---

## 릴리즈 전략

### Semantic Versioning 규칙

```
MAJOR.MINOR.PATCH

예: 1.2.3
  │ │ └─ PATCH: 버그 수정 (하위 호환)
  │ └─── MINOR: 새 기능 추가 (하위 호환)
  └───── MAJOR: Breaking changes (하위 호환 X)
```

### 버전 증가 규칙

| Commit Type | 버전 증가 | 예시 | 릴리즈 노트 섹션 |
|-------------|-----------|------|-----------------|
| `feat:` | MINOR (0.1.0 → 0.2.0) | `feat: add AI analysis` | ✨ Features |
| `fix:` | PATCH (0.1.0 → 0.1.1) | `fix: resolve auth error` | 🐛 Bug Fixes |
| `perf:` | PATCH | `perf: optimize rendering` | ⚡ Performance |
| `refactor:` | PATCH | `refactor: simplify API` | ♻️ Refactoring |
| `feat!:` 또는 `BREAKING CHANGE:` | MAJOR (0.1.0 → 1.0.0) | `feat!: redesign API` | ⚠️ BREAKING CHANGES |
| `docs:` | 버전 변경 없음 | `docs: update README` | 📝 Documentation |
| `style:` | 버전 변경 없음 | `style: format code` | (포함 안 됨) |
| `test:` | 버전 변경 없음 | `test: add unit tests` | (포함 안 됨) |
| `chore:` | 버전 변경 없음 | `chore: update deps` | (포함 안 됨) |

### 릴리즈 자동화 플로우

```
1. PR merged to main
2. deploy-production.yml 실행
3. Semantic Release 실행:
   ├─ Commit 분석 (feat, fix, BREAKING CHANGE)
   ├─ 버전 계산 (MAJOR.MINOR.PATCH)
   ├─ CHANGELOG.md 생성
   ├─ package.json 버전 업데이트
   ├─ Git tag 생성 (v1.2.3)
   └─ GitHub Release 생성
4. Vercel Production 배포
```

### GitHub Release 노트 예시

#### Release v1.2.0 (2026-02-04)

```markdown
## [1.2.0](https://github.com/org/zvzo-creator-insight/compare/v1.1.0...v1.2.0) (2026-02-04)

### ✨ Features

* **ai**: add GPT-4 based content analysis ([a1b2c3d](https://github.com/org/zvzo-creator-insight/commit/a1b2c3d))
* **ui**: add dark mode support ([e4f5g6h](https://github.com/org/zvzo-creator-insight/commit/e4f5g6h))
* **api**: implement caching layer ([i7j8k9l](https://github.com/org/zvzo-creator-insight/commit/i7j8k9l))

### 🐛 Bug Fixes

* **auth**: resolve token expiration issue ([m0n1o2p](https://github.com/org/zvzo-creator-insight/commit/m0n1o2p))
* **ui**: fix mobile layout overflow ([q3r4s5t](https://github.com/org/zvzo-creator-insight/commit/q3r4s5t))

### ⚡ Performance

* **api**: optimize database queries ([u6v7w8x](https://github.com/org/zvzo-creator-insight/commit/u6v7w8x))

### 📝 Documentation

* update API documentation ([y9z0a1b](https://github.com/org/zvzo-creator-insight/commit/y9z0a1b))

---

**Full Changelog**: https://github.com/org/zvzo-creator-insight/compare/v1.1.0...v1.2.0
```

#### Release v2.0.0 (Breaking Changes)

```markdown
## [2.0.0](https://github.com/org/zvzo-creator-insight/compare/v1.2.0...v2.0.0) (2026-03-01)

### ⚠ BREAKING CHANGES

* **api**: API endpoints now require authentication token in header
* **db**: database schema migration required (run `pnpm migrate`)

### ✨ Features

* **api**: redesign authentication system ([c2d3e4f](https://github.com/org/zvzo-creator-insight/commit/c2d3e4f))
* **db**: migrate to PostgreSQL ([g5h6i7j](https://github.com/org/zvzo-creator-insight/commit/g5h6i7j))

### 📖 Migration Guide

#### Authentication Changes

**Before (v1.x)**:
```typescript
fetch('/api/analysis', {
  method: 'POST',
  body: JSON.stringify({ content })
});
```

**After (v2.x)**:
```typescript
fetch('/api/analysis', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ content })
});
```

#### Database Migration

```bash
pnpm migrate
```

---

**Full Changelog**: https://github.com/org/zvzo-creator-insight/compare/v1.2.0...v2.0.0
```

### CHANGELOG.md 자동 생성

Semantic Release가 자동으로 `CHANGELOG.md`를 생성하고 Git에 커밋합니다.

**파일 경로**: `CHANGELOG.md`

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0](https://github.com/org/zvzo-creator-insight/compare/v1.2.0...v2.0.0) (2026-03-01)

### ⚠ BREAKING CHANGES

* **api**: API endpoints now require authentication token

### ✨ Features

* **api**: redesign authentication system ([c2d3e4f](https://github.com/org/zvzo-creator-insight/commit/c2d3e4f))

## [1.2.0](https://github.com/org/zvzo-creator-insight/compare/v1.1.0...v1.2.0) (2026-02-04)

### ✨ Features

* **ai**: add GPT-4 based content analysis ([a1b2c3d](https://github.com/org/zvzo-creator-insight/commit/a1b2c3d))

### 🐛 Bug Fixes

* **auth**: resolve token expiration issue ([m0n1o2p](https://github.com/org/zvzo-creator-insight/commit/m0n1o2p))

## [1.1.0](https://github.com/org/zvzo-creator-insight/compare/v1.0.0...v1.1.0) (2026-01-15)

### ✨ Features

* **ui**: add dark mode support ([e4f5g6h](https://github.com/org/zvzo-creator-insight/commit/e4f5g6h))
```

### Git Tag 규칙

#### 태그 형식

```
v<MAJOR>.<MINOR>.<PATCH>

예시:
v1.0.0
v1.2.3
v2.0.0-beta.1 (pre-release)
```

#### 자동 태그 생성

`deploy-production.yml` 워크플로우가 자동으로 태그를 생성하고 push합니다:

```bash
git tag -a "v1.2.0" -m "Release v1.2.0"
git push origin "v1.2.0"
```

#### 수동 태그 생성 (필요 시)

```bash
# 현재 커밋에 태그 생성
git tag -a v1.2.0 -m "Release v1.2.0"

# 특정 커밋에 태그 생성
git tag -a v1.2.0 abc123 -m "Release v1.2.0"

# 태그 push
git push origin v1.2.0

# 모든 태그 push
git push origin --tags
```

#### 태그 삭제 (실수 시)

```bash
# 로컬 태그 삭제
git tag -d v1.2.0

# 원격 태그 삭제
git push origin :refs/tags/v1.2.0
```

### Pre-release 버전 (선택적)

개발 중인 버전을 사전 배포하려면:

```bash
# Alpha 버전
v2.0.0-alpha.1
v2.0.0-alpha.2

# Beta 버전
v2.0.0-beta.1
v2.0.0-beta.2

# Release Candidate
v2.0.0-rc.1
v2.0.0-rc.2
```

`.releaserc.json`에 pre-release 설정 추가:

```json
{
  "branches": [
    "main",
    {
      "name": "beta",
      "prerelease": true
    },
    {
      "name": "alpha",
      "prerelease": true
    }
  ]
}
```

---

## 트러블슈팅

### 자주 발생하는 문제와 해결 방법

#### 1. CI 실패: "pnpm: command not found"

**원인**: pnpm이 설치되지 않음

**해결**:
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v3
  with:
    version: 9  # 버전 명시
```

#### 2. Vercel 배포 실패: "VERCEL_TOKEN not found"

**원인**: GitHub Secrets에 `VERCEL_TOKEN`이 없음

**해결**:
```bash
# Vercel CLI로 토큰 생성
vercel token create "GitHub Actions"

# GitHub Secrets에 추가
Settings → Secrets → New repository secret
Name: VERCEL_TOKEN
Value: <생성된 토큰>
```

#### 3. TypeScript 빌드 에러: "Cannot find module"

**원인**: 의존성 설치 누락 또는 캐시 문제

**해결**:
```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

# 캐시 무효화
- name: Clear cache
  run: rm -rf node_modules .next
```

#### 4. Semantic Release 실패: "GITHUB_TOKEN permissions"

**원인**: GitHub Token 권한 부족

**해결**:
```yaml
jobs:
  release:
    permissions:
      contents: write  # Git tag, release 생성 권한
      issues: write    # Issue 생성 권한
      pull-requests: write  # PR 업데이트 권한
```

#### 5. Preview 배포 URL이 PR에 코멘트되지 않음

**원인**: `github-script` 액션 권한 문제

**해결**:
```yaml
permissions:
  pull-requests: write

# 또는 PAT (Personal Access Token) 사용
- uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.PAT }}
```

#### 6. CodeQL 분석 시간 초과

**원인**: 대규모 코드베이스

**해결**:
```yaml
jobs:
  codeql-analysis:
    timeout-minutes: 60  # 기본 30분 → 60분으로 증가
```

#### 7. npm audit 실패: "High severity vulnerabilities"

**원인**: 의존성에 보안 취약점 존재

**해결**:
```bash
# 자동 수정
pnpm audit fix

# 강제 업데이트 (Breaking changes 주의)
pnpm audit fix --force

# 특정 패키지 업데이트
pnpm update <package-name>
```

#### 8. Dependabot PR이 자동 머지되지 않음

**원인**: CI가 실패하거나 Major 업데이트

**해결**:
```yaml
# dependabot-auto-merge.yml에서 로그 확인
- name: Wait for CI to complete
  uses: lewagon/wait-on-check-action@v1.3.4
  with:
    check-name: 'ci'  # CI job 이름 확인
```

#### 9. Vercel 빌드 시 환경 변수 누락

**원인**: Vercel Dashboard에 환경 변수 미설정

**해결**:
```bash
# Vercel CLI로 설정
vercel env add OPENAI_API_KEY production

# 또는 Vercel Dashboard에서 수동 설정
Project Settings → Environment Variables
```

#### 10. GitHub Actions 실행 시간 초과

**원인**: Job이 너무 오래 실행됨

**해결**:
```yaml
jobs:
  build:
    timeout-minutes: 20  # 기본값보다 낮게 설정

# 또는 캐싱 최적화
- uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      .next/cache
```

### 디버깅 팁

#### CI 로그 확인

```
GitHub Actions → 실패한 워크플로우 클릭 → 실패한 Job 클릭 → 에러 로그 확인
```

#### Vercel 배포 로그 확인

```
Vercel Dashboard → Deployments → 실패한 배포 클릭 → Build Logs 확인
```

#### 로컬에서 CI 재현

```bash
# 동일한 명령어를 로컬에서 실행
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

#### GitHub Actions 로컬 실행 (act)

```bash
# act 설치 (macOS)
brew install act

# 워크플로우 로컬 실행
act pull_request -W .github/workflows/ci.yml

# 특정 Job만 실행
act -j lint
```

#### 환경 변수 디버깅

```yaml
- name: Debug environment variables
  run: |
    echo "VERCEL_ORG_ID: ${VERCEL_ORG_ID:0:5}..."  # 일부만 출력
    echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."  # 보안 주의
```

---

## 참고 자료

### 공식 문서

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### 추천 읽기

- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
- [pnpm 워크스페이스](https://pnpm.io/workspaces)

### 도구

- [act](https://github.com/nektos/act) - GitHub Actions 로컬 실행
- [Vercel CLI](https://vercel.com/docs/cli) - Vercel 배포 CLI
- [semantic-release](https://github.com/semantic-release/semantic-release) - 자동 릴리즈

---

## 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0.0 | 2026-02-04 | 초기 버전 작성 |

---

**문서 끝**
