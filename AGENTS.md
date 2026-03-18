### Language And Naming Rules

-   이슈, PR, 커밋 메시지, 응답은 한국어를 기본으로 작성한다.
-   PR 제목과 커밋 메시지는 한국어 명령형 어미 `~하라`를 사용한다.
-   사용자 질문이 영어여도 응답은 한국어를 우선하고, 필요 시 영어를 덧붙인다.

### Commit Message Rules

-   Structure: Title (required) + Description (optional)
-   Title format: "[작업내용] [목적]하라"
-   Examples:
    -   "CLAUDE.md 파일 추가 및 PR 생성, 이슈, PR 템플릿 구조 규칙 정의하라"
    -   "타입 정의 개선 및 코드 중복 제거하라"

### Work Process

-   단순 커맨드 실행(커밋, 푸시 등)을 제외한 모든 작업은 **구현 전에 타당성을 먼저 검토**하고 의견을 제시한다.
-   타당성 체크 항목: 이 변경이 사용자에게 가치가 있는가, 기존 동작을 깨뜨리지 않는가, 더 단순한 방법은 없는가.
-   사용자가 동의한 후에 구현을 시작한다.

### Date/Time

-   이 프로젝트는 한국 서비스다. 날짜/시간 생성 시 **KST 기준**을 사용한다.
-   `new Date().toISOString()`은 UTC 기준이므로 날짜가 어긋난다. 사용 금지.
-   KST 날짜가 필요하면 `new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)` 또는 date-fns의 로컬 포맷을 사용한다.

### Design Principles

-   코드 설계 판단은 `docs/react-simple-made-easy-v5.md`의 원칙을 참조한다.
-   핵심 기준: 엮임을 줄이는가 → 상태를 줄이는가 → React 없이 테스트 가능한가 → 일관적인가.
-   `useEffect`는 외부 시스템 동기화에만 사용한다. 내부 상태 동기화에 effect가 필요하면 구조를 다시 본다.

### Testing Principles

-   테스트 작성 원칙은 `docs/testing-principles.txt`를 참고한다.
-   테스트는 구현이 아닌 **동작과 결과**를 검증한다.
-   각 테스트의 "사용자"는 해당 모듈의 **직접 소비자**다.
-   외부 의존(localStorage, fetch 등)은 **최소 경계에서만 대체**한다.
