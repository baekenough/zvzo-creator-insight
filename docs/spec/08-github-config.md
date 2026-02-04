# GitHub 레포지토리 설정 스펙

**프로젝트**: zvzo-creator-insight
**핵심 철학**: "언제든 롤백하고 A/B 테스트가 가능한 구성"

---

## 목차

1. [레포지토리 초기 설정](#1-레포지토리-초기-설정)
2. [Issue Templates](#2-issue-templates)
3. [PR Template](#3-pr-template)
4. [Labels 체계](#4-labels-체계)
5. [Milestones](#5-milestones)
6. [CODEOWNERS](#6-codeowners)
7. [Dependabot 설정](#7-dependabot-설정)
8. [GitHub Projects](#8-github-projects-칸반-보드)
9. [Branch Protection Rules](#9-branch-protection-rules)
10. [A/B 테스트 & 롤백 가이드](#10-ab-테스트--롤백-가이드)
11. [README.md 템플릿](#11-readmemd-템플릿)
12. [레포지토리 초기화 스크립트](#12-레포지토리-초기화-스크립트)

---

## 1. 레포지토리 초기 설정

### Repository 기본 정보

```yaml
name: zvzo-creator-insight
description: "AI-powered creator insight platform for product matching and revenue prediction"
visibility: public
topics:
  - nextjs
  - typescript
  - ai
  - creator-economy
  - product-matching
  - revenue-prediction
  - vercel
license: MIT
```

### Repository Settings

**General Settings:**
```yaml
Features:
  - ✅ Issues
  - ✅ Projects
  - ✅ Preserve this repository (GitHub Archive Program)
  - ✅ Discussions
  - ❌ Wiki (사용 안 함, docs 폴더로 대체)
  - ❌ Sponsorships (초기에는 비활성화)

Pull Requests:
  - ✅ Allow squash merging (ONLY)
  - ❌ Allow merge commits
  - ❌ Allow rebase merging
  - ✅ Automatically delete head branches
  - ✅ Always suggest updating pull request branches

Default branch: main
```

**Why Squash-only?**
- 클린한 커밋 히스토리 유지
- 롤백 시 단일 커밋으로 revert 가능
- A/B 테스트 결과를 하나의 커밋으로 통합

---

## 2. Issue Templates

### 디렉토리 구조

```
.github/
└── ISSUE_TEMPLATE/
    ├── bug-report.yml
    ├── feature-request.yml
    ├── improvement.yml
    └── config.yml
```

### 2.1 bug-report.yml

**파일 경로**: `.github/ISSUE_TEMPLATE/bug-report.yml`

```yaml
name: 🐛 Bug Report
description: 버그 또는 예상치 못한 동작을 보고합니다
title: "[Bug] "
labels: ["type: bug", "status: triage"]
body:
  - type: markdown
    attributes:
      value: |
        버그를 발견해 주셔서 감사합니다! 아래 정보를 최대한 상세히 작성해 주시면 빠른 해결에 도움이 됩니다.

  - type: textarea
    id: description
    attributes:
      label: 버그 설명
      description: 발생한 버그를 명확하게 설명해 주세요.
      placeholder: "예: 크리에이터 검색 시 특정 키워드 입력 후 결과가 표시되지 않음"
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: 재현 단계
      description: 버그를 재현할 수 있는 단계를 작성해 주세요.
      placeholder: |
        1. 메인 페이지 접속
        2. 검색창에 "뷰티" 입력
        3. 검색 버튼 클릭
        4. 결과가 나타나지 않음
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: 예상 동작
      description: 어떻게 동작해야 한다고 생각하시나요?
      placeholder: "검색 결과 목록이 표시되어야 함"
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: 실제 동작
      description: 실제로 어떻게 동작했나요?
      placeholder: "빈 화면 또는 로딩 상태가 계속됨"
    validations:
      required: true

  - type: textarea
    id: screenshots
    attributes:
      label: 스크린샷
      description: 가능하다면 스크린샷을 첨부해 주세요.
      placeholder: "드래그 앤 드롭으로 이미지를 첨부할 수 있습니다."

  - type: dropdown
    id: environment
    attributes:
      label: 환경
      description: 어디에서 발생했나요?
      options:
        - Production (vercel.app)
        - Preview Deployment
        - Local Development
    validations:
      required: true

  - type: input
    id: browser
    attributes:
      label: 브라우저
      description: 사용 중인 브라우저와 버전
      placeholder: "예: Chrome 120.0.6099.71"

  - type: input
    id: device
    attributes:
      label: 디바이스
      description: 사용 중인 디바이스
      placeholder: "예: MacBook Pro M1, iPhone 14 Pro"

  - type: textarea
    id: additional
    attributes:
      label: 추가 정보
      description: 버그와 관련된 추가 정보가 있다면 작성해 주세요.
      placeholder: "콘솔 에러 메시지, 네트워크 요청 실패 등"

  - type: checkboxes
    id: terms
    attributes:
      label: 체크리스트
      options:
        - label: 중복된 이슈가 없는지 확인했습니다.
          required: true
        - label: 최신 버전(main 브랜치)에서도 동일한 문제가 발생합니다.
          required: true
```

### 2.2 feature-request.yml

**파일 경로**: `.github/ISSUE_TEMPLATE/feature-request.yml`

```yaml
name: ✨ Feature Request
description: 새로운 기능을 제안합니다
title: "[Feature] "
labels: ["type: feature", "status: triage"]
body:
  - type: markdown
    attributes:
      value: |
        새로운 기능 제안 감사합니다! 구체적으로 작성해 주시면 검토에 도움이 됩니다.

  - type: textarea
    id: summary
    attributes:
      label: 기능 요약
      description: 제안하는 기능을 간단히 설명해 주세요.
      placeholder: "예: 크리에이터 비교 기능 추가"
    validations:
      required: true

  - type: textarea
    id: user-story
    attributes:
      label: 사용자 스토리
      description: 이 기능이 누구에게, 왜 필요한가요?
      placeholder: |
        As a [역할],
        I want to [행동],
        So that [목적].

        예시:
        As a 마케터,
        I want to 여러 크리에이터를 동시에 비교하고,
        So that 최적의 협업 파트너를 빠르게 선정할 수 있다.
    validations:
      required: true

  - type: textarea
    id: acceptance-criteria
    attributes:
      label: 수용 기준 (Acceptance Criteria)
      description: 이 기능이 완성되었다고 판단할 기준을 작성해 주세요.
      placeholder: |
        - [ ] 최대 5명의 크리에이터를 선택할 수 있다
        - [ ] 팔로워 수, 평균 조회수 등을 나란히 비교할 수 있다
        - [ ] 비교 결과를 PDF로 내보낼 수 있다
    validations:
      required: true

  - type: textarea
    id: mockup
    attributes:
      label: 디자인 모형 (선택사항)
      description: 와이어프레임, 스케치, 참고 이미지 등을 첨부해 주세요.

  - type: dropdown
    id: priority
    attributes:
      label: 우선순위
      description: 이 기능이 얼마나 중요하다고 생각하시나요?
      options:
        - Must Have (없으면 서비스 불가)
        - Should Have (중요하지만 차선책 가능)
        - Nice to Have (있으면 좋음)
    validations:
      required: true

  - type: textarea
    id: technical-considerations
    attributes:
      label: 기술적 고려사항 (선택사항)
      description: 구현 시 고려해야 할 기술적 요소가 있다면 작성해 주세요.
      placeholder: |
        - API 응답 시간 최적화 필요
        - 캐싱 전략 검토
        - AI 모델 추가 훈련 필요

  - type: textarea
    id: alternatives
    attributes:
      label: 대안 (선택사항)
      description: 고려한 다른 방법이 있나요?

  - type: checkboxes
    id: terms
    attributes:
      label: 체크리스트
      options:
        - label: 유사한 기능 요청이 없는지 확인했습니다.
          required: true
        - label: 이 기능이 프로젝트의 방향성과 일치한다고 생각합니다.
          required: true
```

### 2.3 improvement.yml

**파일 경로**: `.github/ISSUE_TEMPLATE/improvement.yml`

```yaml
name: 🔧 Improvement
description: 기존 기능의 개선을 제안합니다
title: "[Improvement] "
labels: ["type: improvement", "status: triage"]
body:
  - type: markdown
    attributes:
      value: |
        기존 기능을 더 좋게 만들 아이디어를 공유해 주세요!

  - type: dropdown
    id: area
    attributes:
      label: 개선 영역
      description: 어떤 부분의 개선인가요?
      options:
        - Performance (성능)
        - UX/UI (사용자 경험)
        - Code Quality (코드 품질)
        - Documentation (문서)
        - Accessibility (접근성)
        - Security (보안)
        - DevOps/Infrastructure (인프라)
    validations:
      required: true

  - type: textarea
    id: current-state
    attributes:
      label: 현재 상태
      description: 현재 어떻게 동작하고 있나요?
      placeholder: |
        예: 크리에이터 목록 페이지에서 100개 이상 로드 시
        렌더링에 2-3초 소요됨
    validations:
      required: true

  - type: textarea
    id: proposed-improvement
    attributes:
      label: 개선 제안
      description: 어떻게 개선하고 싶으신가요?
      placeholder: |
        예: Virtual scrolling 구현하여
        뷰포트에 보이는 항목만 렌더링
    validations:
      required: true

  - type: textarea
    id: expected-impact
    attributes:
      label: 기대 효과
      description: 이 개선으로 얻을 수 있는 효과는 무엇인가요?
      placeholder: |
        - 초기 로딩 시간 70% 단축
        - 메모리 사용량 50% 감소
        - 사용자 이탈률 감소
    validations:
      required: true

  - type: textarea
    id: implementation
    attributes:
      label: 구현 방법 (선택사항)
      description: 구체적인 구현 방법이 있다면 작성해 주세요.
      placeholder: |
        - react-window 라이브러리 사용
        - Intersection Observer API 활용
        - 페이지네이션 대신 무한 스크롤 적용

  - type: textarea
    id: risks
    attributes:
      label: 위험 요소 (선택사항)
      description: 이 개선 작업의 잠재적 위험이나 트레이드오프가 있나요?
      placeholder: |
        - 기존 테스트 코드 수정 필요
        - SEO에 영향 가능성 (SSR 검토 필요)

  - type: dropdown
    id: effort
    attributes:
      label: 예상 작업량
      description: 얼마나 걸릴 것 같나요?
      options:
        - Small (1-2일)
        - Medium (3-5일)
        - Large (1주 이상)
    validations:
      required: true

  - type: checkboxes
    id: terms
    attributes:
      label: 체크리스트
      options:
        - label: 유사한 개선 제안이 없는지 확인했습니다.
          required: true
```

### 2.4 config.yml

**파일 경로**: `.github/ISSUE_TEMPLATE/config.yml`

```yaml
blank_issues_enabled: false
contact_links:
  - name: 💬 Discussions
    url: https://github.com/YOUR_USERNAME/zvzo-creator-insight/discussions
    about: 질문이나 아이디어 공유는 Discussions를 이용해 주세요.

  - name: 📖 Documentation
    url: https://github.com/YOUR_USERNAME/zvzo-creator-insight/blob/main/docs/README.md
    about: 프로젝트 문서를 먼저 확인해 보세요.

  - name: 🚀 Vercel Dashboard
    url: https://vercel.com
    about: 배포 상태 및 로그는 Vercel 대시보드에서 확인하세요.
```

---

## 3. PR Template

### PULL_REQUEST_TEMPLATE.md

**파일 경로**: `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## 📝 변경 사항 요약

<!-- 이 PR이 무엇을 하는지 간단히 설명해 주세요 -->


## 🔖 변경 유형

<!-- 해당하는 항목에 체크해 주세요 -->

- [ ] ✨ Feature (새로운 기능)
- [ ] 🐛 Bug Fix (버그 수정)
- [ ] 🔧 Improvement (기존 기능 개선)
- [ ] 📝 Documentation (문서 업데이트)
- [ ] 🎨 Style (코드 포맷팅, 세미콜론 누락 등)
- [ ] ♻️ Refactoring (기능 변경 없는 코드 리팩토링)
- [ ] ⚡ Performance (성능 개선)
- [ ] ✅ Test (테스트 추가 또는 수정)
- [ ] 🔨 Chore (빌드, 설정 변경 등)

## 🔗 관련 이슈

<!-- 관련된 이슈가 있다면 링크해 주세요 -->

Closes #(이슈 번호)

## 🧪 테스트 체크리스트

<!-- 테스트한 항목에 체크해 주세요 -->

- [ ] Local 환경에서 정상 동작 확인
- [ ] Vercel Preview Deployment에서 정상 동작 확인
- [ ] Unit Tests 추가/업데이트 (해당되는 경우)
- [ ] E2E Tests 추가/업데이트 (해당되는 경우)
- [ ] 다양한 브라우저에서 테스트 (Chrome, Safari, Firefox)
- [ ] 모바일 반응형 테스트
- [ ] 성능 영향 확인 (Lighthouse 점수)

## 📸 스크린샷 (UI 변경 시)

<!-- UI 변경이 있다면 Before/After 스크린샷을 첨부해 주세요 -->

### Before
<!-- 변경 전 -->

### After
<!-- 변경 후 -->

## 🎯 A/B 테스트 계획 (해당되는 경우)

<!-- 이 PR이 A/B 테스트 대상이라면 작성해 주세요 -->

- [ ] A/B 테스트 필요
- [ ] Vercel Preview URL:
- [ ] 측정 지표:
- [ ] 테스트 기간:
- [ ] 롤백 기준:

## 📋 추가 정보

<!-- 리뷰어가 알아야 할 추가 정보를 작성해 주세요 -->


## 👀 리뷰어 체크리스트

<!-- 리뷰어를 위한 가이드 -->

- [ ] 코드가 명확하고 이해하기 쉬운가?
- [ ] 적절한 에러 핸들링이 되어 있는가?
- [ ] TypeScript 타입이 정확한가?
- [ ] 성능 저하 요소는 없는가?
- [ ] 보안 취약점은 없는가?
- [ ] 접근성(a11y) 기준을 충족하는가?
- [ ] 재사용 가능한 컴포넌트인가? (해당되는 경우)
- [ ] 적절한 주석과 문서가 있는가?

---

**병합 전 확인사항:**
- [ ] CI/CD 파이프라인 통과
- [ ] 최소 1명의 approve
- [ ] Vercel deployment preview 확인
- [ ] 충돌(conflict) 해결 완료
```

---

## 4. Labels 체계

### 4.1 Label 정의 및 색상 코드

#### Priority Labels
```yaml
priority: critical
  color: "#B60205"
  description: "즉시 조치 필요 (서비스 중단, 보안 취약점)"

priority: high
  color: "#D93F0B"
  description: "다음 릴리즈에 포함되어야 함"

priority: medium
  color: "#FBCA04"
  description: "적절한 시기에 처리"

priority: low
  color: "#0E8A16"
  description: "여유가 있을 때 처리"
```

#### Type Labels
```yaml
type: feature
  color: "#1D76DB"
  description: "새로운 기능 추가"

type: bug
  color: "#B60205"
  description: "버그 수정"

type: improvement
  color: "#5319E7"
  description: "기존 기능 개선"

type: chore
  color: "#EDEDED"
  description: "빌드, 설정 등 유지보수"

type: docs
  color: "#0075CA"
  description: "문서 작업"

type: refactor
  color: "#FBCA04"
  description: "리팩토링"

type: test
  color: "#128A0C"
  description: "테스트 추가/수정"

type: performance
  color: "#D4C5F9"
  description: "성능 개선"

type: security
  color: "#EE0701"
  description: "보안 관련"
```

#### Status Labels
```yaml
status: triage
  color: "#FFFFFF"
  description: "검토 대기 중"

status: in-progress
  color: "#FBCA04"
  description: "작업 진행 중"

status: review
  color: "#5319E7"
  description: "리뷰 대기 중"

status: blocked
  color: "#B60205"
  description: "차단됨 (의존성, 외부 요인)"

status: on-hold
  color: "#D4C5F9"
  description: "보류 중"

status: duplicate
  color: "#CCCCCC"
  description: "중복 이슈"

status: wontfix
  color: "#EDEDED"
  description: "수정하지 않음"
```

#### Area Labels
```yaml
area: frontend
  color: "#006B75"
  description: "프론트엔드 (UI, 컴포넌트)"

area: api
  color: "#0E8A16"
  description: "API, 백엔드 로직"

area: ai
  color: "#D93F0B"
  description: "AI/ML 파이프라인"

area: data
  color: "#1D76DB"
  description: "데이터 모델, 스키마"

area: infra
  color: "#EDEDED"
  description: "인프라, 배포, CI/CD"

area: dx
  color: "#5319E7"
  description: "개발자 경험 (DX)"

area: ux
  color: "#E99695"
  description: "사용자 경험 (UX)"

area: a11y
  color: "#0075CA"
  description: "접근성 (Accessibility)"
```

#### Special Labels
```yaml
good first issue
  color: "#7057FF"
  description: "초보자에게 좋은 이슈"

help wanted
  color: "#008672"
  description: "도움이 필요합니다"

ab-test
  color: "#FEF2C0"
  description: "A/B 테스트 대상"

rollback-candidate
  color: "#D93F0B"
  description: "롤백 검토 필요"

breaking-change
  color: "#EE0701"
  description: "Breaking Change 포함"

dependencies
  color: "#0366D6"
  description: "의존성 업데이트"
```

### 4.2 Label 생성 스크립트

**파일 경로**: `scripts/setup-github-labels.sh`

```bash
#!/bin/bash

# GitHub Labels Setup Script for zvzo-creator-insight
# Usage: ./scripts/setup-github-labels.sh OWNER REPO

OWNER=${1:-"YOUR_USERNAME"}
REPO=${2:-"zvzo-creator-insight"}

echo "🏷️  Setting up GitHub labels for $OWNER/$REPO..."

# Priority Labels
gh label create "priority: critical" \
  --color "B60205" \
  --description "즉시 조치 필요 (서비스 중단, 보안 취약점)" \
  --repo "$OWNER/$REPO" --force

gh label create "priority: high" \
  --color "D93F0B" \
  --description "다음 릴리즈에 포함되어야 함" \
  --repo "$OWNER/$REPO" --force

gh label create "priority: medium" \
  --color "FBCA04" \
  --description "적절한 시기에 처리" \
  --repo "$OWNER/$REPO" --force

gh label create "priority: low" \
  --color "0E8A16" \
  --description "여유가 있을 때 처리" \
  --repo "$OWNER/$REPO" --force

# Type Labels
gh label create "type: feature" \
  --color "1D76DB" \
  --description "새로운 기능 추가" \
  --repo "$OWNER/$REPO" --force

gh label create "type: bug" \
  --color "B60205" \
  --description "버그 수정" \
  --repo "$OWNER/$REPO" --force

gh label create "type: improvement" \
  --color "5319E7" \
  --description "기존 기능 개선" \
  --repo "$OWNER/$REPO" --force

gh label create "type: chore" \
  --color "EDEDED" \
  --description "빌드, 설정 등 유지보수" \
  --repo "$OWNER/$REPO" --force

gh label create "type: docs" \
  --color "0075CA" \
  --description "문서 작업" \
  --repo "$OWNER/$REPO" --force

gh label create "type: refactor" \
  --color "FBCA04" \
  --description "리팩토링" \
  --repo "$OWNER/$REPO" --force

gh label create "type: test" \
  --color "128A0C" \
  --description "테스트 추가/수정" \
  --repo "$OWNER/$REPO" --force

gh label create "type: performance" \
  --color "D4C5F9" \
  --description "성능 개선" \
  --repo "$OWNER/$REPO" --force

gh label create "type: security" \
  --color "EE0701" \
  --description "보안 관련" \
  --repo "$OWNER/$REPO" --force

# Status Labels
gh label create "status: triage" \
  --color "FFFFFF" \
  --description "검토 대기 중" \
  --repo "$OWNER/$REPO" --force

gh label create "status: in-progress" \
  --color "FBCA04" \
  --description "작업 진행 중" \
  --repo "$OWNER/$REPO" --force

gh label create "status: review" \
  --color "5319E7" \
  --description "리뷰 대기 중" \
  --repo "$OWNER/$REPO" --force

gh label create "status: blocked" \
  --color "B60205" \
  --description "차단됨 (의존성, 외부 요인)" \
  --repo "$OWNER/$REPO" --force

gh label create "status: on-hold" \
  --color "D4C5F9" \
  --description "보류 중" \
  --repo "$OWNER/$REPO" --force

gh label create "status: duplicate" \
  --color "CCCCCC" \
  --description "중복 이슈" \
  --repo "$OWNER/$REPO" --force

gh label create "status: wontfix" \
  --color "EDEDED" \
  --description "수정하지 않음" \
  --repo "$OWNER/$REPO" --force

# Area Labels
gh label create "area: frontend" \
  --color "006B75" \
  --description "프론트엔드 (UI, 컴포넌트)" \
  --repo "$OWNER/$REPO" --force

gh label create "area: api" \
  --color "0E8A16" \
  --description "API, 백엔드 로직" \
  --repo "$OWNER/$REPO" --force

gh label create "area: ai" \
  --color "D93F0B" \
  --description "AI/ML 파이프라인" \
  --repo "$OWNER/$REPO" --force

gh label create "area: data" \
  --color "1D76DB" \
  --description "데이터 모델, 스키마" \
  --repo "$OWNER/$REPO" --force

gh label create "area: infra" \
  --color "EDEDED" \
  --description "인프라, 배포, CI/CD" \
  --repo "$OWNER/$REPO" --force

gh label create "area: dx" \
  --color "5319E7" \
  --description "개발자 경험 (DX)" \
  --repo "$OWNER/$REPO" --force

gh label create "area: ux" \
  --color "E99695" \
  --description "사용자 경험 (UX)" \
  --repo "$OWNER/$REPO" --force

gh label create "area: a11y" \
  --color "0075CA" \
  --description "접근성 (Accessibility)" \
  --repo "$OWNER/$REPO" --force

# Special Labels
gh label create "good first issue" \
  --color "7057FF" \
  --description "초보자에게 좋은 이슈" \
  --repo "$OWNER/$REPO" --force

gh label create "help wanted" \
  --color "008672" \
  --description "도움이 필요합니다" \
  --repo "$OWNER/$REPO" --force

gh label create "ab-test" \
  --color "FEF2C0" \
  --description "A/B 테스트 대상" \
  --repo "$OWNER/$REPO" --force

gh label create "rollback-candidate" \
  --color "D93F0B" \
  --description "롤백 검토 필요" \
  --repo "$OWNER/$REPO" --force

gh label create "breaking-change" \
  --color "EE0701" \
  --description "Breaking Change 포함" \
  --repo "$OWNER/$REPO" --force

gh label create "dependencies" \
  --color "0366D6" \
  --description "의존성 업데이트" \
  --repo "$OWNER/$REPO" --force

# Delete default labels (optional)
echo "🗑️  Removing default GitHub labels..."
gh label delete "bug" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
gh label delete "documentation" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
gh label delete "duplicate" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
gh label delete "enhancement" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
gh label delete "good first issue" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
gh label delete "help wanted" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
gh label delete "invalid" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
gh label delete "question" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
gh label delete "wontfix" --repo "$OWNER/$REPO" --yes 2>/dev/null || true

echo "✅ Labels setup complete!"
echo "📊 View labels at: https://github.com/$OWNER/$REPO/labels"
```

**실행 방법:**
```bash
chmod +x scripts/setup-github-labels.sh
./scripts/setup-github-labels.sh YOUR_USERNAME zvzo-creator-insight
```

---

## 5. Milestones

### 5.1 v0.1.0 - 프로젝트 초기화 & 인프라

**Due Date**: Week 1
**Description**: 프로젝트 구조, 개발 환경, CI/CD 파이프라인 구축

**Issues:**
1. **프로젝트 초기 설정**
   - Next.js 14 + TypeScript 프로젝트 생성
   - ESLint, Prettier 설정
   - Tailwind CSS 설정
   - Labels: `type: chore`, `area: dx`, `priority: high`

2. **CI/CD 파이프라인 구축**
   - GitHub Actions 워크플로우 작성
   - Vercel 연동 및 자동 배포
   - Preview Deployment 설정
   - Labels: `type: chore`, `area: infra`, `priority: high`

3. **개발 환경 설정**
   - VSCode 설정 공유 (.vscode/)
   - Git hooks (husky, lint-staged)
   - 환경 변수 관리 (.env.example)
   - Labels: `type: chore`, `area: dx`, `priority: medium`

4. **기본 문서 작성**
   - README.md
   - CONTRIBUTING.md
   - docs/ 폴더 구조
   - Labels: `type: docs`, `priority: medium`

5. **Supabase 프로젝트 생성 및 스키마 초안**
   - Supabase 프로젝트 생성
   - 초기 데이터베이스 스키마 작성
   - RLS 정책 초안
   - Labels: `type: chore`, `area: data`, `priority: high`

### 5.2 v0.2.0 - 기본 UI & Mock 데이터

**Due Date**: Week 2
**Description**: 디자인 시스템, 기본 레이아웃, Mock 데이터로 UI 구현

**Issues:**
1. **디자인 시스템 구축**
   - 컬러 팔레트 정의
   - Typography 설정
   - Shadcn/ui 컴포넌트 통합
   - Labels: `type: feature`, `area: frontend`, `priority: high`

2. **기본 레이아웃 구현**
   - Header, Footer, Navigation
   - 반응형 레이아웃
   - 다크 모드 토글
   - Labels: `type: feature`, `area: frontend`, `priority: high`

3. **Mock 데이터 생성**
   - 크리에이터 Mock 데이터 (50명)
   - 제품 Mock 데이터 (100개)
   - JSON 파일 또는 lib/mock-data.ts
   - Labels: `type: chore`, `area: data`, `priority: medium`

4. **크리에이터 목록 페이지 (Mock)**
   - 카드 리스트 뷰
   - 필터링 UI (카테고리, 팔로워 범위)
   - 페이지네이션 또는 무한 스크롤
   - Labels: `type: feature`, `area: frontend`, `priority: high`

5. **크리에이터 상세 페이지 (Mock)**
   - 프로필 정보 표시
   - 주요 지표 카드
   - Mock 차트 (Recharts)
   - Labels: `type: feature`, `area: frontend`, `priority: high`

6. **제품 매칭 페이지 UI (Mock)**
   - 제품 카드 레이아웃
   - 매칭 점수 표시 (하드코딩)
   - Labels: `type: feature`, `area: frontend`, `priority: medium`

### 5.3 v0.3.0 - 크리에이터 분석 (AI 통합)

**Due Date**: Week 3-4
**Description**: AI 기반 크리에이터 분석 기능 구현

**Issues:**
1. **Supabase 크리에이터 스키마 완성**
   - `creators` 테이블 마이그레이션
   - `creator_metrics` 테이블
   - `creator_categories` 테이블
   - Labels: `type: feature`, `area: data`, `priority: high`

2. **크리에이터 데이터 크롤링 스크립트**
   - YouTube Data API 연동
   - Instagram Graph API 연동 (선택)
   - 데이터 저장 스크립트
   - Labels: `type: feature`, `area: api`, `priority: high`

3. **OpenAI API 연동**
   - Vercel AI SDK 설정
   - API Route 구조 (/api/ai/*)
   - 에러 핸들링 및 재시도 로직
   - Labels: `type: feature`, `area: ai`, `priority: high`

4. **크리에이터 분석 AI 프롬프트**
   - 콘텐츠 카테고리 분류 프롬프트
   - 타겟 오디언스 분석 프롬프트
   - 협업 스타일 분석 프롬프트
   - Labels: `type: feature`, `area: ai`, `priority: high`

5. **크리에이터 분석 API 엔드포인트**
   - `POST /api/creators/[id]/analyze`
   - Streaming 응답 (Vercel AI SDK)
   - 결과 Supabase 저장
   - Labels: `type: feature`, `area: api`, `priority: high`

6. **크리에이터 목록 페이지 (실제 데이터 연동)**
   - Supabase 쿼리 통합
   - 서버 컴포넌트로 SSR
   - 캐싱 전략 (ISR)
   - Labels: `type: feature`, `area: frontend`, `priority: high`

7. **크리에이터 상세 페이지 (AI 분석 결과 표시)**
   - AI 분석 결과 섹션
   - 실시간 분석 트리거 버튼
   - 로딩 상태 (스트리밍)
   - Labels: `type: feature`, `area: frontend`, `priority: high`

8. **Performance 최적화**
   - 이미지 최적화 (next/image)
   - Code splitting
   - Lighthouse 점수 90+ 달성
   - Labels: `type: performance`, `area: frontend`, `priority: medium`

### 5.4 v0.4.0 - 제품 매칭 & 매출 예측

**Due Date**: Week 5-6
**Description**: AI 기반 제품 매칭 및 매출 예측 기능

**Issues:**
1. **제품 데이터베이스 구축**
   - `products` 테이블 마이그레이션
   - `product_categories` 테이블
   - 초기 제품 데이터 시드
   - Labels: `type: feature`, `area: data`, `priority: high`

2. **제품 매칭 알고리즘 설계**
   - 임베딩 기반 유사도 계산
   - 가중치 모델 설계
   - Labels: `type: feature`, `area: ai`, `priority: high`

3. **제품 매칭 AI 프롬프트**
   - 크리에이터-제품 매칭 프롬프트
   - 매칭 이유 생성 프롬프트
   - Labels: `type: feature`, `area: ai`, `priority: high`

4. **제품 매칭 API**
   - `POST /api/creators/[id]/match-products`
   - 상위 N개 제품 반환
   - 매칭 점수 및 이유
   - Labels: `type: feature`, `area: api`, `priority: high`

5. **매출 예측 모델**
   - 회귀 모델 또는 AI 프롬프트 기반
   - 팔로워 수, 참여율, 제품 가격 고려
   - 예측 범위 (최소, 평균, 최대)
   - Labels: `type: feature`, `area: ai`, `priority: high`

6. **매출 예측 API**
   - `POST /api/creators/[id]/predict-revenue`
   - 시나리오별 예측 (낙관적, 보통, 비관적)
   - Labels: `type: feature`, `area: api`, `priority: high`

7. **제품 매칭 페이지 완성**
   - 실제 AI 매칭 결과 표시
   - 매칭 점수 시각화
   - 제품 상세 정보 팝업
   - Labels: `type: feature`, `area: frontend`, `priority: high`

8. **매출 예측 대시보드**
   - 예측 차트 (Recharts)
   - 시나리오 비교 뷰
   - CSV 내보내기
   - Labels: `type: feature`, `area: frontend`, `priority: medium`

9. **A/B 테스트: 매칭 알고리즘 비교**
   - 임베딩 기반 vs 규칙 기반
   - 피드백 수집 UI
   - Labels: `type: feature`, `ab-test`, `priority: medium`

### 5.5 v1.0.0 - MVP 완성

**Due Date**: Week 7-8
**Description**: 프로덕션 준비, 최종 테스트, 문서 정리

**Issues:**
1. **E2E 테스트 작성**
   - Playwright 또는 Cypress 설정
   - 주요 사용자 플로우 테스트
   - CI에 통합
   - Labels: `type: test`, `priority: high`

2. **에러 모니터링 설정**
   - Sentry 또는 Vercel Analytics 연동
   - 에러 로깅 전략
   - Labels: `type: chore`, `area: infra`, `priority: high`

3. **보안 검토**
   - RLS 정책 재검토
   - API Rate Limiting
   - 환경 변수 보안 확인
   - Labels: `type: security`, `priority: critical`

4. **성능 최적화 (최종)**
   - 모든 페이지 Lighthouse 90+
   - Core Web Vitals 최적화
   - 번들 사이즈 최적화
   - Labels: `type: performance`, `priority: high`

5. **접근성 (a11y) 검토**
   - ARIA 속성 추가
   - 키보드 네비게이션 테스트
   - 스크린 리더 테스트
   - Labels: `type: improvement`, `area: a11y`, `priority: medium`

6. **사용자 문서 작성**
   - 사용 가이드 (docs/user-guide.md)
   - FAQ
   - 튜토리얼 비디오 스크립트
   - Labels: `type: docs`, `priority: medium`

7. **개발자 문서 완성**
   - API 문서 (docs/api.md)
   - 아키텍처 다이어그램
   - 배포 가이드
   - Labels: `type: docs`, `priority: medium`

8. **프로덕션 배포 체크리스트**
   - 커스텀 도메인 연결
   - OG 이미지 설정
   - Analytics 설정
   - Labels: `type: chore`, `area: infra`, `priority: high`

9. **런칭 준비**
   - 런칭 블로그 포스트 작성
   - SNS 공유 자료 준비
   - Product Hunt 제출 준비
   - Labels: `type: chore`, `priority: medium`

### 마일스톤 생성 스크립트

**파일 경로**: `scripts/setup-milestones.sh`

```bash
#!/bin/bash

# GitHub Milestones Setup Script
# Usage: ./scripts/setup-milestones.sh OWNER REPO

OWNER=${1:-"YOUR_USERNAME"}
REPO=${2:-"zvzo-creator-insight"}

echo "🎯 Setting up milestones for $OWNER/$REPO..."

# Calculate due dates (adjust as needed)
DUE_1="2026-02-11T23:59:59Z"  # Week 1
DUE_2="2026-02-18T23:59:59Z"  # Week 2
DUE_3="2026-03-04T23:59:59Z"  # Week 3-4
DUE_4="2026-03-18T23:59:59Z"  # Week 5-6
DUE_5="2026-04-01T23:59:59Z"  # Week 7-8

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/milestones" \
  -f title="v0.1.0 - 프로젝트 초기화 & 인프라" \
  -f state="open" \
  -f description="프로젝트 구조, 개발 환경, CI/CD 파이프라인 구축" \
  -f due_on="$DUE_1"

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/milestones" \
  -f title="v0.2.0 - 기본 UI & Mock 데이터" \
  -f state="open" \
  -f description="디자인 시스템, 기본 레이아웃, Mock 데이터로 UI 구현" \
  -f due_on="$DUE_2"

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/milestones" \
  -f title="v0.3.0 - 크리에이터 분석 (AI 통합)" \
  -f state="open" \
  -f description="AI 기반 크리에이터 분석 기능 구현" \
  -f due_on="$DUE_3"

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/milestones" \
  -f title="v0.4.0 - 제품 매칭 & 매출 예측" \
  -f state="open" \
  -f description="AI 기반 제품 매칭 및 매출 예측 기능" \
  -f due_on="$DUE_4"

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/milestones" \
  -f title="v1.0.0 - MVP 완성" \
  -f state="open" \
  -f description="프로덕션 준비, 최종 테스트, 문서 정리" \
  -f due_on="$DUE_5"

echo "✅ Milestones created!"
echo "📊 View milestones at: https://github.com/$OWNER/$REPO/milestones"
```

---

## 6. CODEOWNERS

**파일 경로**: `.github/CODEOWNERS`

```
# CODEOWNERS for zvzo-creator-insight
# Code owners are automatically requested for review when someone opens a PR

# Default owners for everything in the repo
*       @YOUR_USERNAME

# Frontend
/src/app/**              @YOUR_USERNAME
/src/components/**       @YOUR_USERNAME
/src/styles/**           @YOUR_USERNAME

# API & Backend
/src/app/api/**          @YOUR_USERNAME
/src/lib/supabase/**     @YOUR_USERNAME

# AI & ML
/src/app/api/ai/**       @YOUR_USERNAME
/src/lib/ai/**           @YOUR_USERNAME
/prompts/**              @YOUR_USERNAME

# Data & Database
/supabase/**             @YOUR_USERNAME
/supabase/migrations/**  @YOUR_USERNAME

# Infrastructure & DevOps
/.github/**              @YOUR_USERNAME
/vercel.json             @YOUR_USERNAME
/next.config.js          @YOUR_USERNAME

# Documentation
/docs/**                 @YOUR_USERNAME
/README.md               @YOUR_USERNAME

# Configuration
/.vscode/**              @YOUR_USERNAME
/package.json            @YOUR_USERNAME
/tsconfig.json           @YOUR_USERNAME
/.eslintrc.json          @YOUR_USERNAME
```

**팀 환경에서 사용 시 예시:**
```
# Multiple owners example
/src/app/api/**          @backend-team @ai-team
/src/components/**       @frontend-team
/supabase/migrations/**  @backend-team @data-team
```

---

## 7. Dependabot 설정

**파일 경로**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  # npm 패키지 업데이트
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Seoul"
    open-pull-requests-limit: 10
    reviewers:
      - "YOUR_USERNAME"
    assignees:
      - "YOUR_USERNAME"
    labels:
      - "dependencies"
      - "type: chore"
      - "priority: low"
    commit-message:
      prefix: "chore(deps)"
      include: "scope"
    # 자동 머지 가능한 업데이트 (patch, minor)
    # 수동으로 gh pr merge --auto 필요
    target-branch: "main"
    # 특정 패키지 무시 (필요시)
    ignore:
      # - dependency-name: "react"
      #   versions: ["18.x"]

  # GitHub Actions 업데이트
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Seoul"
    open-pull-requests-limit: 5
    reviewers:
      - "YOUR_USERNAME"
    assignees:
      - "YOUR_USERNAME"
    labels:
      - "dependencies"
      - "area: infra"
      - "priority: low"
    commit-message:
      prefix: "chore(actions)"

  # Docker (필요 시)
  # - package-ecosystem: "docker"
  #   directory: "/"
  #   schedule:
  #     interval: "weekly"
```

### Dependabot 전략

**자동 승인 규칙 (GitHub Actions):**
```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Dependabot Auto-Merge

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  pull-requests: write
  contents: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"

      - name: Auto-merge patch updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-approve minor updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-minor'
        run: gh pr review --approve "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**왜 주간 업데이트?**
- 매일: 너무 많은 PR 노이즈
- 월간: 보안 패치 늦음
- **주간**: 적절한 균형

---

## 8. GitHub Projects (칸반 보드)

### 8.1 프로젝트 생성

**프로젝트 이름**: zvzo-creator-insight Roadmap
**템플릿**: Board
**가시성**: Public

### 8.2 컬럼 구조

```
┌─────────────┬─────────────┬──────────────┬─────────────┬─────────────┐
│  Backlog    │    Todo     │ In Progress  │   Review    │    Done     │
├─────────────┼─────────────┼──────────────┼─────────────┼─────────────┤
│ 아직 시작   │ 다음에 할   │ 현재 작업 중 │ 리뷰 대기   │ 완료        │
│ 안 한 이슈  │ 이슈들      │ 인 이슈/PR   │ 중인 PR     │             │
└─────────────┴─────────────┴──────────────┴─────────────┴─────────────┘
```

### 8.3 자동화 규칙

**Automation 설정:**

```yaml
# Issue가 생성되면 → Backlog
trigger: Issue opened
action: Add to project → Column: Backlog

# Issue에 "status: in-progress" 라벨 추가되면 → In Progress
trigger: Issue labeled
label: "status: in-progress"
action: Move to column → In Progress

# PR이 생성되면 → In Progress
trigger: Pull request opened
action: Add to project → Column: In Progress

# PR이 "status: review" 라벨 받으면 → Review
trigger: Pull request labeled
label: "status: review"
action: Move to column → Review

# PR이 머지되면 → Done
trigger: Pull request merged
action: Move to column → Done

# Issue가 닫히면 → Done
trigger: Issue closed
action: Move to column → Done

# PR이 닫히면 (머지 안 됨) → Backlog으로 되돌림
trigger: Pull request closed (not merged)
action: Move to column → Backlog
```

### 8.4 프로젝트 필드 (Custom Fields)

**추가 필드:**
```yaml
Priority:
  type: single_select
  options:
    - Critical
    - High
    - Medium
    - Low

Area:
  type: single_select
  options:
    - Frontend
    - API
    - AI
    - Data
    - Infra

Estimate:
  type: number
  description: "예상 작업 시간 (시간)"

Sprint:
  type: iteration
  duration: 2 weeks
```

### 8.5 CLI로 프로젝트 생성

```bash
#!/bin/bash

# GitHub Project 생성
OWNER="YOUR_USERNAME"
REPO="zvzo-creator-insight"

# 프로젝트 생성 (beta 기능)
gh project create \
  --owner "$OWNER" \
  --title "zvzo-creator-insight Roadmap" \
  --body "AI 크리에이터 인사이트 플랫폼 개발 로드맵"

# 수동으로 웹 UI에서 설정:
# 1. https://github.com/users/YOUR_USERNAME/projects
# 2. New project → Board 템플릿 선택
# 3. Settings → Workflows에서 자동화 규칙 설정
```

---

## 9. Branch Protection Rules

### 9.1 main 브랜치 보호 규칙

**설정 항목:**

```yaml
branch: main

require_pull_request_reviews:
  required_approving_review_count: 1
  dismiss_stale_reviews: true
  require_code_owner_reviews: false  # 초기에는 false (1인 개발)
  require_last_push_approval: false

require_status_checks:
  strict: true  # PR이 최신 main 기반이어야 함
  checks:
    - ci  # GitHub Actions CI 워크플로우
    - deploy-preview  # Vercel Preview Deployment

require_linear_history: true  # Squash merge만 허용
allow_force_pushes: false
allow_deletions: false
require_signed_commits: false  # 선택사항
lock_branch: false
```

### 9.2 CLI로 Branch Protection 설정

**파일 경로**: `scripts/setup-branch-protection.sh`

```bash
#!/bin/bash

# Branch Protection Rules Setup
# Usage: ./scripts/setup-branch-protection.sh OWNER REPO

OWNER=${1:-"YOUR_USERNAME"}
REPO=${2:-"zvzo-creator-insight"}

echo "🔒 Setting up branch protection for $OWNER/$REPO..."

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/branches/main/protection" \
  -f required_status_checks[strict]=true \
  -f "required_status_checks[checks][][context]=ci" \
  -f "required_status_checks[checks][][context]=deploy-preview" \
  -f required_pull_request_reviews[dismiss_stale_reviews]=true \
  -f required_pull_request_reviews[required_approving_review_count]=1 \
  -f required_pull_request_reviews[require_code_owner_reviews]=false \
  -f required_linear_history=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f enforce_admins=true

echo "✅ Branch protection rules applied to main!"
echo "🔗 View at: https://github.com/$OWNER/$REPO/settings/branches"
```

**실행:**
```bash
chmod +x scripts/setup-branch-protection.sh
./scripts/setup-branch-protection.sh YOUR_USERNAME zvzo-creator-insight
```

### 9.3 왜 이런 설정?

| 규칙 | 이유 |
|------|------|
| **최소 1 리뷰** | 코드 품질 유지, 실수 방지 (1인 개발 시 생략 가능) |
| **CI 통과 필수** | 버그 있는 코드 머지 방지 |
| **Vercel Preview 필수** | 배포 가능 여부 확인 |
| **Linear history** | 클린한 커밋 히스토리, 롤백 용이 |
| **Force push 금지** | 히스토리 보존, 안전한 협업 |

---

## 10. A/B 테스트 & 롤백 가이드

### 10.1 핵심 철학

> **"언제든 롤백하고 A/B 테스트가 가능한 구성"**

**구현 방법:**
1. **Vercel Preview Deployments**: 모든 PR은 고유 URL로 배포
2. **Git Tags + Release**: 각 프로덕션 배포는 태그로 기록
3. **Instant Rollback**: Vercel 대시보드에서 원클릭 롤백
4. **Feature Flags**: 런타임 A/B 테스트 (선택사항)

### 10.2 Vercel Preview를 활용한 A/B 테스트

#### 시나리오 1: UI 변경 A/B 테스트

**상황**: 크리에이터 카드 레이아웃을 두 가지 디자인으로 테스트

**워크플로우:**

```bash
# 1. Feature 브랜치 생성
git checkout -b feature/card-layout-variant-a
# 디자인 A 구현
git commit -m "feat: implement card layout variant A"
git push origin feature/card-layout-variant-a

# 2. PR 생성 → Vercel이 자동으로 Preview URL 생성
# Preview URL 예시: https://zvzo-creator-insight-abc123.vercel.app

# 3. 별도 브랜치로 디자인 B 구현
git checkout main
git checkout -b feature/card-layout-variant-b
# 디자인 B 구현
git commit -m "feat: implement card layout variant B"
git push origin feature/card-layout-variant-b

# 4. 두 번째 PR 생성 → 두 번째 Preview URL 생성
# Preview URL 예시: https://zvzo-creator-insight-xyz789.vercel.app

# 5. 두 URL을 사용자에게 공유하고 피드백 수집
# Google Forms, Typeform 등으로 설문

# 6. 승자 결정 후 해당 PR만 머지
gh pr merge feature/card-layout-variant-a --squash

# 7. 패자 PR은 닫기
gh pr close feature/card-layout-variant-b
```

**피드백 수집 템플릿 (Google Forms):**
```
1. 어떤 버전을 테스트하셨나요?
   - [ ] 버전 A (abc123.vercel.app)
   - [ ] 버전 B (xyz789.vercel.app)

2. 정보를 찾기 쉬웠나요? (1-5)
3. 디자인이 깔끔했나요? (1-5)
4. 어떤 버전을 선호하시나요?
   - [ ] A
   - [ ] B
   - [ ] 비슷함

5. 이유를 간단히 적어주세요.
```

#### 시나리오 2: AI 프롬프트 A/B 테스트

**상황**: 크리에이터 분석 프롬프트 두 가지 버전 비교

**구조:**
```typescript
// src/lib/ai/prompts.ts
export const PROMPTS = {
  ANALYZE_CREATOR_V1: `당신은 크리에이터 분석 전문가입니다...`,
  ANALYZE_CREATOR_V2: `당신은 데이터 기반 크리에이터 인사이트 전문가입니다...`,
};

// Feature flag (환경 변수)
const PROMPT_VERSION = process.env.NEXT_PUBLIC_PROMPT_VERSION || 'v1';

export function getAnalyzePrompt() {
  return PROMPT_VERSION === 'v2'
    ? PROMPTS.ANALYZE_CREATOR_V2
    : PROMPTS.ANALYZE_CREATOR_V1;
}
```

**워크플로우:**
```bash
# 1. V2 프롬프트 구현
git checkout -b feature/prompt-v2
# prompts.ts 수정
git commit -m "feat: add analyze prompt v2"
git push origin feature/prompt-v2

# 2. PR 생성 → Vercel Preview 배포
# Preview URL: https://zvzo-creator-insight-prompt-v2.vercel.app

# 3. Vercel 환경 변수 설정
# Preview 브랜치에서 NEXT_PUBLIC_PROMPT_VERSION=v2 설정

# 4. 동일한 크리에이터로 두 버전 테스트
# Production (v1): zvzo-creator-insight.vercel.app/creators/123
# Preview (v2): zvzo-creator-insight-prompt-v2.vercel.app/creators/123

# 5. 결과 비교 (품질, 응답 시간, 토큰 사용량)
# 승자 머지
gh pr merge feature/prompt-v2 --squash
```

**비교 메트릭:**
```yaml
metrics:
  - 분석 정확도 (주관적 평가)
  - 응답 시간 (ms)
  - 토큰 사용량 (cost)
  - 사용자 만족도 (피드백)
```

#### 시나리오 3: 알고리즘 변경 A/B 테스트

**상황**: 제품 매칭 알고리즘 (임베딩 기반 vs 규칙 기반)

**구조:**
```typescript
// src/lib/matching/index.ts
export async function matchProducts(creatorId: string) {
  const algorithm = process.env.MATCHING_ALGORITHM || 'embedding';

  if (algorithm === 'rule-based') {
    return matchProductsRuleBased(creatorId);
  }

  return matchProductsEmbedding(creatorId);
}
```

**워크플로우:**
```bash
# 1. Rule-based 알고리즘 구현 (별도 브랜치)
git checkout -b feature/rule-based-matching
# 구현...
git commit -m "feat: implement rule-based product matching"
git push origin feature/rule-based-matching

# 2. PR 생성 → Preview 배포
# Vercel 환경 변수: MATCHING_ALGORITHM=rule-based

# 3. 동일한 크리에이터로 두 알고리즘 테스트
# Production: 임베딩 기반
# Preview: 규칙 기반

# 4. 매칭 품질 비교 (정확도, 다양성, 속도)

# 5. 승자 머지 또는 Feature Flag로 런타임 전환
```

### 10.3 Release Tag 기반 롤백 절차

#### Release 태깅 전략

**Semantic Versioning:**
```
v{MAJOR}.{MINOR}.{PATCH}

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes
```

**Release 워크플로우:**

```bash
# 1. main 브랜치에서 최신 상태 확인
git checkout main
git pull origin main

# 2. 버전 태그 생성 (수동)
git tag -a v1.0.0 -m "Release v1.0.0: MVP launch"
git push origin v1.0.0

# 3. Vercel이 자동으로 프로덕션 배포
# (Vercel은 main 브랜치의 모든 푸시를 프로덕션으로 배포)

# 4. GitHub Release 생성 (선택사항)
gh release create v1.0.0 \
  --title "v1.0.0 - MVP Launch" \
  --notes "첫 번째 공개 릴리즈입니다." \
  --latest
```

#### Vercel Instant Rollback

**시나리오**: v1.1.0 배포 후 치명적 버그 발견

**방법 1: Vercel Dashboard (가장 빠름)**
```
1. Vercel Dashboard → Project → Deployments
2. 이전 안정 버전 (v1.0.0) 찾기
3. "..." 메뉴 → "Promote to Production" 클릭
4. 즉시 롤백 완료 (10초 이내)
```

**방법 2: Vercel CLI**
```bash
# 1. 배포 목록 확인
vercel ls

# 출력 예시:
# Age  Deployment                           Status    Duration
# 5m   zvzo-creator-insight-abc123.vercel   READY     30s
# 2h   zvzo-creator-insight-xyz789.vercel   READY     28s (v1.0.0)

# 2. 이전 배포를 프로덕션으로 승격
vercel promote zvzo-creator-insight-xyz789.vercel.app

# 3. 확인
vercel ls
```

**방법 3: Git Revert (신중하게)**
```bash
# ⚠️ 주의: main 브랜치 히스토리 변경

# 1. 문제 커밋 되돌리기
git revert HEAD

# 2. 푸시
git push origin main

# 3. Vercel이 자동으로 새 배포 트리거 (revert 반영)
```

#### 롤백 의사결정 기준

**즉시 롤백 (< 5분):**
- [ ] 서비스 완전 중단
- [ ] 보안 취약점 노출
- [ ] 데이터 손실 위험
- [ ] 결제 기능 오류

**계획 롤백 (< 1시간):**
- [ ] 주요 기능 동작 안 함
- [ ] 성능 심각한 저하 (> 50%)
- [ ] 사용자 불만 급증

**Hot Fix 우선 (롤백 대신):**
- [ ] 사소한 UI 버그
- [ ] 특정 조건에서만 발생
- [ ] 빠른 패치 가능 (< 30분)

### 10.4 A/B 테스트 체크리스트

**테스트 시작 전:**
```yaml
planning:
  - [ ] 테스트 목적 명확히 정의
  - [ ] 측정 지표 선정 (정량적 + 정성적)
  - [ ] 샘플 크기 계산 (통계적 유의성)
  - [ ] 테스트 기간 설정 (최소 1주 권장)
  - [ ] 롤백 기준 사전 정의
```

**테스트 진행 중:**
```yaml
monitoring:
  - [ ] 매일 지표 모니터링
  - [ ] 사용자 피드백 수집
  - [ ] 에러 로그 확인
  - [ ] 성능 메트릭 추적 (Vercel Analytics)
```

**테스트 종료 후:**
```yaml
analysis:
  - [ ] 데이터 분석 및 통계적 검증
  - [ ] 승자 결정 (또는 무승부)
  - [ ] 학습 내용 문서화 (docs/ab-tests/)
  - [ ] 패자 브랜치 정리
  - [ ] 승자 프로덕션 배포
```

### 10.5 Vercel 환경 변수 전략

**환경별 변수 관리:**

```yaml
# Production (main 브랜치)
NEXT_PUBLIC_SUPABASE_URL: "https://prod.supabase.co"
OPENAI_API_KEY: "sk-prod-..."
FEATURE_FLAG_NEW_UI: "false"

# Preview (PR 브랜치)
NEXT_PUBLIC_SUPABASE_URL: "https://staging.supabase.co"
OPENAI_API_KEY: "sk-staging-..."
FEATURE_FLAG_NEW_UI: "true"  # A/B 테스트용

# Development (로컬)
NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321"
OPENAI_API_KEY: "sk-dev-..."
```

**브랜치별 환경 변수 오버라이드:**
```
Vercel Dashboard → Settings → Environment Variables

Variable: FEATURE_FLAG_NEW_UI
Production: false
Preview (feature/new-ui 브랜치): true
```

---

## 11. README.md 템플릿

**파일 경로**: `README.md`

```markdown
<div align="center">

# 🎯 zvzo-creator-insight

**AI-Powered Creator Insight Platform**

크리에이터 분석부터 제품 매칭, 매출 예측까지 한 번에

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/zvzo-creator-insight)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)

[데모 보기](https://zvzo-creator-insight.vercel.app) · [문서](./docs) · [이슈 제보](https://github.com/YOUR_USERNAME/zvzo-creator-insight/issues)

</div>

---

## 📸 스크린샷

<div align="center">

### 크리에이터 대시보드
![Dashboard](./docs/screenshots/dashboard.png)

### AI 분석 결과
![Analysis](./docs/screenshots/analysis.png)

### 제품 매칭
![Matching](./docs/screenshots/matching.png)

</div>

---

## ✨ 주요 기능

- 🔍 **AI 기반 크리에이터 분석**: OpenAI GPT를 활용한 심층 분석
- 🎯 **스마트 제품 매칭**: 임베딩 기반 최적 제품 추천
- 📊 **매출 예측**: 협업 시 예상 매출 시뮬레이션
- ⚡ **실시간 데이터**: Supabase 실시간 구독
- 📱 **반응형 디자인**: 모바일부터 데스크톱까지
- 🌙 **다크 모드**: 눈에 편한 인터페이스

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend & AI
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Real-time)
- **AI**: [OpenAI API](https://openai.com/) + [Vercel AI SDK](https://sdk.vercel.ai/)
- **Authentication**: Supabase Auth (선택사항)

### DevOps
- **Deployment**: [Vercel](https://vercel.com/)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics (선택사항)

---

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18+
- npm 또는 pnpm
- Supabase 계정
- OpenAI API 키

### 설치

```bash
# 1. 레포지토리 클론
git clone https://github.com/YOUR_USERNAME/zvzo-creator-insight.git
cd zvzo-creator-insight

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local

# 4. .env.local 파일 편집 (Supabase URL, OpenAI API Key 등)

# 5. Supabase 로컬 개발 (선택사항)
npx supabase start

# 6. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

### 환경 변수

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key

# 선택사항
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📁 프로젝트 구조

```
zvzo-creator-insight/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # 대시보드 레이아웃 그룹
│   │   ├── api/                # API Routes
│   │   │   └── ai/             # AI 관련 엔드포인트
│   │   ├── creators/           # 크리에이터 페이지
│   │   ├── products/           # 제품 페이지
│   │   └── layout.tsx
│   ├── components/             # React 컴포넌트
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── creators/           # 크리에이터 관련 컴포넌트
│   │   └── dashboard/          # 대시보드 컴포넌트
│   ├── lib/                    # 유틸리티 라이브러리
│   │   ├── supabase/           # Supabase 클라이언트
│   │   ├── ai/                 # AI 유틸리티
│   │   └── utils.ts
│   └── types/                  # TypeScript 타입 정의
├── supabase/
│   ├── migrations/             # 데이터베이스 마이그레이션
│   └── seed.sql                # 시드 데이터
├── public/                     # 정적 파일
├── docs/                       # 프로젝트 문서
│   ├── spec/                   # 스펙 문서
│   ├── api.md                  # API 문서
│   └── deployment.md           # 배포 가이드
└── scripts/                    # 유틸리티 스크립트
```

---

## 📖 문서

- [프로젝트 스펙](./docs/spec/)
- [API 문서](./docs/api.md)
- [데이터 모델](./docs/spec/02-data-model.md)
- [AI 파이프라인](./docs/spec/04-ai-pipeline.md)
- [배포 가이드](./docs/deployment.md)
- [A/B 테스트 가이드](./docs/ab-testing.md)

---

## 🧪 테스트

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

---

## 🚀 배포

### Vercel (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/zvzo-creator-insight)

1. 위 버튼 클릭
2. 환경 변수 입력
3. 배포 완료!

### 수동 배포

```bash
# 프로덕션 빌드
npm run build

# Vercel CLI 배포
vercel --prod
```

자세한 내용은 [배포 가이드](./docs/deployment.md) 참조

---

## 🤝 기여하기

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md) 참조

---

## 🐛 이슈 제보

버그를 발견하셨나요? [이슈 생성](https://github.com/YOUR_USERNAME/zvzo-creator-insight/issues/new/choose)

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일 참조.

---

## 👨‍💻 만든 사람

**Your Name** - [@your_twitter](https://twitter.com/your_twitter)

프로젝트 링크: [https://github.com/YOUR_USERNAME/zvzo-creator-insight](https://github.com/YOUR_USERNAME/zvzo-creator-insight)

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**

Made with ❤️ by [Your Name](https://github.com/YOUR_USERNAME)

</div>
```

---

## 12. 레포지토리 초기화 스크립트

### 12.1 완전 자동화 스크립트

**파일 경로**: `scripts/init-github-repo.sh`

```bash
#!/bin/bash

##############################################################################
# GitHub Repository Initialization Script for zvzo-creator-insight
#
# This script automates the complete setup of a GitHub repository including:
# - Repository creation
# - Labels, milestones, and branch protection
# - Issue/PR templates
# - Dependabot and CODEOWNERS
#
# Usage: ./scripts/init-github-repo.sh
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
OWNER="YOUR_USERNAME"  # ⚠️ CHANGE THIS
REPO="zvzo-creator-insight"
REPO_DESC="AI-powered creator insight platform for product matching and revenue prediction"
HOMEPAGE="https://zvzo-creator-insight.vercel.app"

##############################################################################
# Helper Functions
##############################################################################

print_header() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  $1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

check_gh_cli() {
  if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) not found. Please install it first:"
    echo "  brew install gh"
    echo "  or visit: https://cli.github.com/"
    exit 1
  fi

  if ! gh auth status &> /dev/null; then
    print_error "GitHub CLI not authenticated. Please run:"
    echo "  gh auth login"
    exit 1
  fi
}

##############################################################################
# Step 1: Create Repository
##############################################################################

create_repository() {
  print_header "Step 1: Creating GitHub Repository"

  if gh repo view "$OWNER/$REPO" &> /dev/null; then
    print_warning "Repository $OWNER/$REPO already exists. Skipping creation."
  else
    gh repo create "$OWNER/$REPO" \
      --public \
      --description "$REPO_DESC" \
      --homepage "$HOMEPAGE" \
      --clone=false

    print_success "Repository created: https://github.com/$OWNER/$REPO"
  fi

  # Add topics
  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPO/topics" \
    -f names='["nextjs","typescript","ai","creator-economy","product-matching","vercel","supabase"]' \
    &> /dev/null

  print_success "Topics added"
}

##############################################################################
# Step 2: Setup Labels
##############################################################################

setup_labels() {
  print_header "Step 2: Setting Up Labels"

  # Priority Labels
  gh label create "priority: critical" --color "B60205" --description "즉시 조치 필요" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "priority: high" --color "D93F0B" --description "다음 릴리즈에 포함" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "priority: medium" --color "FBCA04" --description "적절한 시기에 처리" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "priority: low" --color "0E8A16" --description "여유가 있을 때 처리" --repo "$OWNER/$REPO" --force 2>/dev/null || true

  # Type Labels
  gh label create "type: feature" --color "1D76DB" --description "새로운 기능 추가" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "type: bug" --color "B60205" --description "버그 수정" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "type: improvement" --color "5319E7" --description "기존 기능 개선" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "type: chore" --color "EDEDED" --description "빌드, 설정 등 유지보수" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "type: docs" --color "0075CA" --description "문서 작업" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "type: refactor" --color "FBCA04" --description "리팩토링" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "type: test" --color "128A0C" --description "테스트 추가/수정" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "type: performance" --color "D4C5F9" --description "성능 개선" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "type: security" --color "EE0701" --description "보안 관련" --repo "$OWNER/$REPO" --force 2>/dev/null || true

  # Status Labels
  gh label create "status: triage" --color "FFFFFF" --description "검토 대기 중" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "status: in-progress" --color "FBCA04" --description "작업 진행 중" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "status: review" --color "5319E7" --description "리뷰 대기 중" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "status: blocked" --color "B60205" --description "차단됨" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "status: on-hold" --color "D4C5F9" --description "보류 중" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "status: duplicate" --color "CCCCCC" --description "중복 이슈" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "status: wontfix" --color "EDEDED" --description "수정하지 않음" --repo "$OWNER/$REPO" --force 2>/dev/null || true

  # Area Labels
  gh label create "area: frontend" --color "006B75" --description "프론트엔드" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "area: api" --color "0E8A16" --description "API, 백엔드 로직" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "area: ai" --color "D93F0B" --description "AI/ML 파이프라인" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "area: data" --color "1D76DB" --description "데이터 모델, 스키마" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "area: infra" --color "EDEDED" --description "인프라, 배포, CI/CD" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "area: dx" --color "5319E7" --description "개발자 경험" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "area: ux" --color "E99695" --description "사용자 경험" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "area: a11y" --color "0075CA" --description "접근성" --repo "$OWNER/$REPO" --force 2>/dev/null || true

  # Special Labels
  gh label create "good first issue" --color "7057FF" --description "초보자에게 좋은 이슈" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "help wanted" --color "008672" --description "도움이 필요합니다" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "ab-test" --color "FEF2C0" --description "A/B 테스트 대상" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "rollback-candidate" --color "D93F0B" --description "롤백 검토 필요" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "breaking-change" --color "EE0701" --description "Breaking Change 포함" --repo "$OWNER/$REPO" --force 2>/dev/null || true
  gh label create "dependencies" --color "0366D6" --description "의존성 업데이트" --repo "$OWNER/$REPO" --force 2>/dev/null || true

  # Delete default labels
  gh label delete "bug" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
  gh label delete "documentation" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
  gh label delete "duplicate" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
  gh label delete "enhancement" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
  gh label delete "invalid" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
  gh label delete "question" --repo "$OWNER/$REPO" --yes 2>/dev/null || true
  gh label delete "wontfix" --repo "$OWNER/$REPO" --yes 2>/dev/null || true

  print_success "Labels configured (34 labels created)"
}

##############################################################################
# Step 3: Create Milestones
##############################################################################

create_milestones() {
  print_header "Step 3: Creating Milestones"

  # Calculate due dates (adjust as needed)
  DUE_1="2026-02-11T23:59:59Z"  # Week 1
  DUE_2="2026-02-18T23:59:59Z"  # Week 2
  DUE_3="2026-03-04T23:59:59Z"  # Week 3-4
  DUE_4="2026-03-18T23:59:59Z"  # Week 5-6
  DUE_5="2026-04-01T23:59:59Z"  # Week 7-8

  gh api --method POST -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPO/milestones" \
    -f title="v0.1.0 - 프로젝트 초기화 & 인프라" \
    -f state="open" \
    -f description="프로젝트 구조, 개발 환경, CI/CD 파이프라인 구축" \
    -f due_on="$DUE_1" 2>/dev/null || true

  gh api --method POST -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPO/milestones" \
    -f title="v0.2.0 - 기본 UI & Mock 데이터" \
    -f state="open" \
    -f description="디자인 시스템, 기본 레이아웃, Mock 데이터로 UI 구현" \
    -f due_on="$DUE_2" 2>/dev/null || true

  gh api --method POST -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPO/milestones" \
    -f title="v0.3.0 - 크리에이터 분석 (AI 통합)" \
    -f state="open" \
    -f description="AI 기반 크리에이터 분석 기능 구현" \
    -f due_on="$DUE_3" 2>/dev/null || true

  gh api --method POST -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPO/milestones" \
    -f title="v0.4.0 - 제품 매칭 & 매출 예측" \
    -f state="open" \
    -f description="AI 기반 제품 매칭 및 매출 예측 기능" \
    -f due_on="$DUE_4" 2>/dev/null || true

  gh api --method POST -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPO/milestones" \
    -f title="v1.0.0 - MVP 완성" \
    -f state="open" \
    -f description="프로덕션 준비, 최종 테스트, 문서 정리" \
    -f due_on="$DUE_5" 2>/dev/null || true

  print_success "Milestones created (5 milestones)"
}

##############################################################################
# Step 4: Branch Protection
##############################################################################

setup_branch_protection() {
  print_header "Step 4: Setting Up Branch Protection (main)"

  print_warning "Branch protection requires the 'main' branch to exist."
  print_warning "Please push your initial commit first, then run:"
  echo ""
  echo "  gh api --method PUT \\"
  echo "    -H \"Accept: application/vnd.github+json\" \\"
  echo "    \"/repos/$OWNER/$REPO/branches/main/protection\" \\"
  echo "    -f required_status_checks[strict]=true \\"
  echo "    -f \"required_status_checks[checks][][context]=ci\" \\"
  echo "    -f \"required_status_checks[checks][][context]=deploy-preview\" \\"
  echo "    -f required_pull_request_reviews[dismiss_stale_reviews]=true \\"
  echo "    -f required_pull_request_reviews[required_approving_review_count]=1 \\"
  echo "    -f required_linear_history=true \\"
  echo "    -f allow_force_pushes=false \\"
  echo "    -f allow_deletions=false"
  echo ""

  print_warning "Skipping for now. Apply manually after first push."
}

##############################################################################
# Step 5: Enable Features
##############################################################################

enable_features() {
  print_header "Step 5: Enabling Repository Features"

  # Enable Issues, Projects, Discussions
  gh api --method PATCH -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPO" \
    -f has_issues=true \
    -f has_projects=true \
    -f has_wiki=false \
    -f has_discussions=true \
    &> /dev/null

  print_success "Features enabled: Issues, Projects, Discussions"
  print_success "Disabled: Wiki (use docs/ folder instead)"
}

##############################################################################
# Step 6: Summary
##############################################################################

print_summary() {
  print_header "🎉 Repository Setup Complete!"

  echo "Repository: https://github.com/$OWNER/$REPO"
  echo ""
  echo "Next Steps:"
  echo ""
  echo "1. Clone the repository:"
  echo "   git clone https://github.com/$OWNER/$REPO.git"
  echo ""
  echo "2. Add GitHub templates to your local repo:"
  echo "   - Copy .github/ISSUE_TEMPLATE/* (from this spec)"
  echo "   - Copy .github/PULL_REQUEST_TEMPLATE.md"
  echo "   - Copy .github/CODEOWNERS"
  echo "   - Copy .github/dependabot.yml"
  echo ""
  echo "3. Push initial commit:"
  echo "   git add ."
  echo "   git commit -m \"chore: initial project setup\""
  echo "   git push origin main"
  echo ""
  echo "4. Apply branch protection (after main branch exists):"
  echo "   ./scripts/setup-branch-protection.sh $OWNER $REPO"
  echo ""
  echo "5. Connect to Vercel:"
  echo "   - Visit https://vercel.com/new"
  echo "   - Import your GitHub repository"
  echo "   - Add environment variables"
  echo ""
  echo "6. Create GitHub Project (Kanban board):"
  echo "   - Visit https://github.com/users/$OWNER/projects"
  echo "   - Click 'New project' → Board template"
  echo "   - Name it 'zvzo-creator-insight Roadmap'"
  echo ""
  print_success "Happy coding! 🚀"
}

##############################################################################
# Main Execution
##############################################################################

main() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════════════╗"
  echo "║                                                                    ║"
  echo "║     GitHub Repository Initialization for zvzo-creator-insight     ║"
  echo "║                                                                    ║"
  echo "╚════════════════════════════════════════════════════════════════════╝"
  echo ""

  # Check prerequisites
  check_gh_cli

  # Confirm before proceeding
  echo "This script will set up:"
  echo "  - Repository: $OWNER/$REPO"
  echo "  - 34 labels (priority, type, status, area)"
  echo "  - 5 milestones (v0.1.0 to v1.0.0)"
  echo "  - Repository features (Issues, Projects, Discussions)"
  echo ""
  read -p "Continue? (y/N): " -n 1 -r
  echo ""

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Cancelled by user"
    exit 0
  fi

  # Execute steps
  create_repository
  setup_labels
  create_milestones
  enable_features
  setup_branch_protection

  # Print summary
  print_summary
}

# Run main function
main "$@"
```

### 12.2 실행 방법

```bash
# 1. 스크립트에 실행 권한 부여
chmod +x scripts/init-github-repo.sh

# 2. OWNER 변수 수정
# scripts/init-github-repo.sh 파일에서 YOUR_USERNAME을 본인 계정으로 변경

# 3. 실행
./scripts/init-github-repo.sh
```

### 12.3 수동 설정이 필요한 항목

스크립트 실행 후 수동으로 해야 할 작업:

```markdown
1. **Issue/PR Templates 추가**
   - .github/ISSUE_TEMPLATE/*.yml 파일 생성
   - .github/PULL_REQUEST_TEMPLATE.md 생성
   - 이 문서의 섹션 2, 3 내용 복사

2. **CODEOWNERS 파일 추가**
   - .github/CODEOWNERS 생성
   - 이 문서의 섹션 6 내용 복사

3. **Dependabot 설정**
   - .github/dependabot.yml 생성
   - 이 문서의 섹션 7 내용 복사

4. **README.md 작성**
   - 루트에 README.md 생성
   - 이 문서의 섹션 11 내용 복사 및 수정

5. **첫 커밋 푸시**
   git add .
   git commit -m "chore: initial project setup with GitHub config"
   git push origin main

6. **Branch Protection 적용**
   ./scripts/setup-branch-protection.sh YOUR_USERNAME zvzo-creator-insight

7. **Vercel 연동**
   - https://vercel.com/new 방문
   - GitHub 레포지토리 import
   - 환경 변수 추가

8. **GitHub Project 생성**
   - https://github.com/users/YOUR_USERNAME/projects
   - New project → Board 템플릿
   - 섹션 8 참고하여 자동화 규칙 설정
```

---

## 요약

이 문서는 **zvzo-creator-insight** 프로젝트의 완전한 GitHub 레포지토리 설정을 다룹니다.

### 핵심 설정

1. **Issue/PR Templates**: 구조화된 이슈 및 PR 작성
2. **Labels (34개)**: Priority, Type, Status, Area, Special
3. **Milestones (5개)**: v0.1.0 ~ v1.0.0
4. **Branch Protection**: main 브랜치 보호 (squash-only, CI 필수)
5. **Dependabot**: 주간 자동 의존성 업데이트
6. **A/B 테스트**: Vercel Preview 기반 테스트 워크플로우
7. **롤백**: Instant Rollback (Vercel) + Git Tags

### 핵심 철학 구현

**"언제든 롤백하고 A/B 테스트가 가능한 구성"**

- ✅ Squash merge로 클린한 커밋 히스토리
- ✅ 모든 PR은 고유 Preview URL
- ✅ Vercel Instant Rollback (10초 이내)
- ✅ Git Tags로 릴리즈 추적
- ✅ 브랜치별 환경 변수 오버라이드

### 즉시 사용 가능

모든 설정 파일은 **copy-paste 가능**하도록 전체 내용을 포함했습니다.

`./scripts/init-github-repo.sh` 실행 후 템플릿 파일만 추가하면 완료!
