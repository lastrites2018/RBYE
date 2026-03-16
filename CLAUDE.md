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

### Testing Principles

-   테스트 작성 원칙은 `docs/testing-principles.txt`를 참고한다.
-   테스트는 구현이 아닌 **동작과 결과**를 검증한다.
-   각 테스트의 "사용자"는 해당 모듈의 **직접 소비자**다.
-   외부 의존(localStorage, fetch 등)은 **최소 경계에서만 대체**한다.
