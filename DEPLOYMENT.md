# Vercel 배포 가이드

## 1. 준비된 파일
- `vercel.json`
  - Next.js 앱용 Vercel 설정
  - `version: 3`, `framework: nextjs`
- `.vercelignore`
  - 배포에 포함하지 않을 파일 목록
  - `.env.local`, `.next`, `node_modules`, 로그 파일 등 제외

## 2. 배포 전 필수 환경
Vercel에서 다음 환경 변수를 설정해야 합니다.

- `GROQ_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

> `.env.local`에 있는 값들을 그대로 Vercel 환경 변수로 등록하세요.

## 3. 로컬 배포 실행 조건
현재 이 환경에서는 `node`, `npm`, `npx`가 PATH에 없어서 배포 명령을 직접 실행할 수 없습니다. 다음 도구가 필요합니다.

- Node.js 20.9 이상
- npm 또는 npx
- Vercel CLI

## 4. 배포 실행 명령
로컬에서 다음을 실행합니다.

```bash
npm install -g vercel
cd c:\Users\user\Documents\ai-story-app
vercel --prod
```

## 5. 확인 및 추가 설정
- `package.json`의 빌드 명령은 `next build`로 올바릅니다.
- `next.config.ts`는 `turbopack.root`만 설정되어 있으며, 일반 Next.js 배포에 문제 없도록 간단한 기본 구성입니다.
- Vercel에 배포 후, Firebase 관련 보안 규칙 및 Firestore 읽기/쓰기 권한을 다시 한 번 확인하세요.

## 6. 요약
- Vercel 설정 파일 준비 완료: `vercel.json`, `.vercelignore`
- 실제 배포는 로컬에 Node/npm이 설치된 환경에서 실행해야 함
- 필요한 환경 변수를 Vercel 프로젝트에 등록해야 함
