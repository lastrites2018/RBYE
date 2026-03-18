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

### Design Principles (Simple Made Easy)

코드를 작성하거나 리뷰할 때 아래 질문을 순서대로 확인한다.
깊이 검토가 필요하면 `docs/react-simple-made-easy-v5.md` 전문을 참조한다.

#### 엮임 체크리스트

1. 이 컴포넌트가 변경되는 이유가 2가지 이상인가? → 분리를 검토한다.
2. 이 `useEffect`가 동기화하는 외부 시스템을 한 문장으로 설명할 수 있는가? → 설명이 안 되면 effect 대신 이벤트 핸들러, 파생 계산, `key` 재생성을 검토한다.
3. 같은 데이터가 2곳 이상에 가변 상태로 저장되어 있는가? → 단일 원천으로 정리한다.
4. 이 테스트를 실행하려면 React를 렌더링해야 하는가? → 순수 함수로 추출한다.
5. 이 값은 다른 값에서 계산 가능한가? → `useState`에 넣지 않고 함수로 파생한다.

#### 상태 분류 기준

-   계산 가능한 값 → 파생 (함수 또는 useMemo)
-   서버 데이터 → 쿼리 캐시 또는 SSR props (별도 store에 복사 금지)
-   URL로 복원 필요 → URL query parameter
-   한 컴포넌트 안에서만 의미 → useState
-   여러 컴포넌트 공유 → zustand store 또는 Context

#### 접합부 주의

-   React 생명주기와 외부 상태(localStorage, API)가 만나는 지점에서 버그가 발생한다.
-   `useState` 초기값은 hydration 전이다. localStorage 값에 의존하는 판단은 `mounted` 플래그 이후에 수행한다.

### Testing Principles

-   테스트 작성 원칙은 `docs/testing-principles.txt`를 참고한다.
-   테스트는 구현이 아닌 **동작과 결과**를 검증한다.
-   각 테스트의 "사용자"는 해당 모듈의 **직접 소비자**다.
-   외부 의존(localStorage, fetch 등)은 **최소 경계에서만 대체**한다.
