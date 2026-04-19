# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 수정 반영 사항

이 수정본에는 아래 항목이 반영되어 있습니다.

## 지금 바로 고친 것
- API 키를 프론트에서 제거하고 `/api/recommend` 서버 라우트로 이동
- 추천 개수를 TOP 5로 통일
- `dangerouslySetInnerHTML` 제거, 안전한 텍스트 렌더링으로 변경
- 자유 입력값 sanitize 추가
- 추천 구조를 `룰베이스 계산 + AI 설명 보강` 방식으로 분리

## 그다음 항목 반영
- 컴포넌트/로직/API 파일 분리
- 현재 스트링 정보가 추천 점수에 직접 영향
- 스펙 데이터 구조 표준화 (`gauge_mm`, `stiffness`, `specs` 등)
- localStorage 저장 추가
- 내구성/장력유지 항목을 추천 점수에 반영

## 파일 설명
- `App.jsx` : 메인 화면
- `components/` : 카드/분석/UI 조각
- `lib/recommend.js` : 룰베이스 추천 엔진
- `lib/stringDatabase.js` : 구조화된 스트링 데이터
- `lib/sanitize.js` : 입력값 정리
- `lib/storage.js` : localStorage 저장
- `api/recommend.js` : 서버 API 예시 (Vercel/Next API 스타일)

## 환경변수
서버 쪽에만 아래 값을 넣어야 합니다.

```bash
GEMINI_API_KEY=your_key_here
```

프론트에는 `VITE_GEMINI_API_KEY`를 두지 않습니다.

## 참고
현재 업로드한 원본은 단일 파일 구조였기 때문에, 유지보수 편하게 여러 파일로 쪼갠 수정본을 새 폴더로 만들었습니다.