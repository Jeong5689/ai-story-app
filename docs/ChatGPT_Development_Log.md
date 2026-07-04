# AI Story App Development Log

**Project:** AI Story App
**Framework:** Next.js + TypeScript
**Database:** Firebase Firestore
**Authentication:** Firebase Auth
**AI Model:** Groq API
**IDE:** VS Code
**Deployment:** Vercel

---

# Development Goal

AI를 이용하여 어린이를 위한 동화를 생성하고 저장하는 웹 애플리케이션 개발

주요 기능

- AI 동화 생성
- 연령별 동화 생성
- 동화 수정
- 동화 삭제
- 이미지 생성
- TTS
- 관리자 페이지
- 커뮤니티
- 마이페이지

---

# Development Environment

Node.js

VS Code

GitHub

Vercel

Firebase

Groq API

---

# Completed

## 1. GitHub Deployment

- GitHub Repository 생성
- Vercel 연동
- 자동 배포 설정 완료

---

## 2. Homepage

업데이트

- Homepage Design
- Navigation
- Community
- Admin Page
- My Page

---

## 3. Story Features

완료

- Story Generation
- Story Edit
- Story Delete
- Age Groups

---

## 4. Cloudinary

추가 완료

- Image Upload

---

## 5. TTS

추가 완료

---

# Groq API

## 목표

Groq AI를 이용하여 동화 생성

예제

```javascript
import Groq from "groq-sdk";

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
```

---

## 필요한 환경변수

```
GROQ_API_KEY=
```

---

# Firebase

현재 사용

- Firestore
- Authentication

firebase.ts

```typescript
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
```

---

# 발견한 문제

## Firebase Error

브라우저 콘솔

```
FirebaseError:
Missing or insufficient permissions.
```

### 의미

Firestore Security Rules가 현재 요청을 허용하지 않음

가능한 원인

- Firestore Rules
- Authentication
- Collection Permission
- Login Required

---

## Chrome Error

```
A listener indicated an asynchronous response...
```

영향

거의 없음

Chrome Extension에서 발생하는 경우가 많음

---

## Copilot Error

```
Server error:500
```

원인

GitHub Copilot 서버 오류

애플리케이션 오류와는 별개

---

# 조사해야 할 사항

## Firestore Rules

Firebase Console

Firestore Database

Rules

현재 Rules 확인 필요

---

## Story API

찾아야 할 파일

```
app/api/story/route.ts
```

또는

```
storyService.ts
```

또는

```
generateStory.ts
```

---

## 검색할 키워드

VS Code

Ctrl + Shift + F

검색

```
addDoc(
```

```
setDoc(
```

```
collection(
```

```
generateStory
```

```
chat.completions
```

```
groq
```

```
동화 생성 중 오류가 발생했습니다.
```

---

# 현재 프로젝트 구조

```
app/
components/
lib/
public/
```

루트

```
package.json
next.config.ts
.env.local
README.md
```

---

# 다음 작업

□ Firestore Rules 확인

□ Story 생성 코드 찾기

□ Firestore 권한 수정

□ Groq API 정상 호출 확인

□ Story 저장 테스트

□ Production 재배포

---

# 향후 기능

- AI 이미지 생성
- AI 음성 읽기
- PDF Export
- EPUB Export
- 학부모 모드
- 교사용 모드
- 관리자 통계
- AI 추천 동화
- 다국어 지원
- AI 삽화 생성

---

# 배포

GitHub

↓

Vercel

↓

Production

---

# 진행 현황

| 기능 | 상태 |
|-------|------|
| Next.js | 완료 |
| Firebase | 완료 |
| Vercel | 완료 |
| Groq API | 진행 중 |
| Firestore | 권한 문제 |
| Story Generation | 디버깅 중 |

---

Last Updated

2026-06-30